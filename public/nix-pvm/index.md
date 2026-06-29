---
title: "Running a Virtual Machine on a Cloud Box That Can't Run Virtual Machines"
date: '2026-06-29'
spoiler: "Cheap cloud servers can't run real VMs. Here's why, and how I got them to anyway."
---

I wanted to run other people's code on my servers without trusting it, on cloud boxes cheap enough to have a lot of them. Those two goals are at odds, and getting around that pulled me deeper into how virtual machines work than I ever planned to go.

## Running Code You Don't Trust

The code I want to run isn't mine. It might be an AI agent's output, or a stranger's contest submission. So I put a wall around it, and a bad program can only break its own little world.

The cheap wall is a [container](https://www.docker.com/resources/what-container/). Docker starts instantly and costs almost nothing, but every container shares the host's one operating system kernel. That's fine if you trust what's running. If you don't, it's a thin wall: one bug in that shared kernel and the code is loose on the host.

A virtual machine is the real wall. It's a whole simulated computer with its own kernel running on top of yours. Code inside can't even see your real machine; take over its kernel and you've taken over a fake computer. The catch is that VMs are heavy and slow to boot.

[microVMs](https://github.com/firecracker-microvm/firecracker) like [Firecracker](https://github.com/firecracker-microvm/firecracker) and [Cloud Hypervisor](https://www.cloudhypervisor.org/) fix that. They boot in milliseconds and use barely any memory, with a real VM's isolation. It's what [AWS Lambda](https://aws.amazon.com/blogs/aws/firecracker-lightweight-virtualization-for-serverless-computing/) runs your code in. That's what I wanted: a fresh, throwaway VM for every bit of untrusted code. Then I tried to run one on a cheap cloud box.

## The `/dev/kvm` Problem

A VM needs the CPU's help to run at any speed. Modern chips have virtualization built into the silicon for it. On Linux, [KVM](https://linux-kvm.org/page/Main_Page) is what uses it, and you reach KVM through one file, `/dev/kvm`. No file, no VMs, and a microVM won't even start without it.

On hardware you own, the file is just there. The trouble with a cheap cloud box is that the box is itself a VM. Your $5 [Hetzner](https://www.hetzner.com/cloud) instance isn't a computer, it's a VM on Hetzner's hardware, so a microVM on it would be a VM inside a VM. That's [nested virtualization](https://en.wikipedia.org/wiki/Hardware-assisted_virtualization#Nested_virtualization), and it only works if your provider passes the CPU's virtualization down to you. Budget tiers almost never do. Hetzner Cloud doesn't, on any tier. No nested virtualization, no `/dev/kvm`, no microVM.

The usual answer is to rent bare metal, where `/dev/kvm` is real. But bare metal is expensive and inflexible, and I wanted the opposite: lots of small, cheap boxes. So I kept looking.

## PVM

[PVM](https://github.com/virt-pvm/linux) (Pagetable Virtual Machine) does in software what a VM normally offloads to those missing CPU features. It does that work itself, so it runs on a box that never had the hardware to begin with. It comes from [Ant Group](https://lwn.net/Articles/963718/), who run it in production, so it's well past a science project.

The cost is that PVM lives in the Linux kernel, so you run custom builds. Two of them:

- A host kernel for the cloud box. Boot on it and `/dev/kvm` appears, done in software. The box now looks like it can run VMs.
- A guest kernel for the VM. PVM's faked hardware is odd enough that a stock kernel won't boot on it, so the VM boots this one instead.

I got it working end to end on a €4/month [Hetzner `cx23`](https://www.hetzner.com/cloud) with no hardware virtualization at all:

```
Hetzner cx23 (no hardware virtualization)
  → PVM host kernel makes /dev/kvm appear
    → Cloud Hypervisor boots a microVM with the PVM guest kernel
      → the guest boots all the way to a working system
```

It works.

## Building the Kernels Once

Booting it once is easy. The annoying part is that both kernels have to be compiled, and a Linux kernel is huge: about an hour for the host, twenty minutes for the guest. You don't want that on every server, and definitely not on the cheap box itself.

So I build each kernel once and let every box download the result. That's what [nix-pvm](https://github.com/fcjr/nix-pvm) is. It defines both kernels in [Nix](https://nixos.org/); CI builds them once and pushes them to a cache ([Cachix](https://www.cachix.org/)). Nobody compiles them again. Each box pulls the prebuilt kernel, byte-for-byte, as fast as a download.

Here's the actual config I run on my contest fleet, not a toy snippet. Four things to get right.

### 1. Trust the cache and pull in the module

In your `flake.nix`, add the cache so the kernels download instead of compiling, pull in `nix-pvm`, and import its [NixOS module](https://nixos.wiki/wiki/NixOS_modules) on the host:

```nix
{
  # Pull the prebuilt PVM kernels from the cache instead of compiling them.
  # Trusted users honor this; otherwise pass --accept-flake-config or put these
  # two lines in the builder's nix.conf.
  nixConfig = {
    extra-substituters = [ "https://nix-pvm.cachix.org" ];
    extra-trusted-public-keys = [
      "nix-pvm.cachix.org-1:Nf9cU+dJIq7XpVPE9SMD4UWeXqO1u0U4m6ApnN3CtRg="
    ];
  };

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.11";
  inputs.nix-pvm.url = "github:fcjr/nix-pvm";

  outputs = { nixpkgs, nix-pvm, ... }: {
    nixosConfigurations.my-host = nixpkgs.lib.nixosSystem {
      system = "x86_64-linux";
      modules = [
        nix-pvm.nixosModules.default   # PVM host kernel + pti=off + kvm-pvm + cache
        ./configuration.nix
      ];
    };
  };
}
```

That sets the host kernel, the options PVM needs (`pti=off`, autoloading `kvm-pvm`), and the cache. Rebuild, reboot, and `/dev/kvm` is there.

### 2. Drop the default initrd modules on the host

The one host gotcha. The PVM host kernel is minimal and doesn't ship the default initrd modules (`nvme`, `pata_marvell`, and so on), so the stock module closure fails to build. On Hetzner Cloud you only need virtio to reach the disk, and the `qemu-guest` profile handles that, so in `configuration.nix`:

```nix
boot.initrd.includeDefaultModules = false;
```

### 3. Build a guest the PVM kernel can boot

The guest kernel is a package from the same flake. Point your hypervisor at its `bzImage`:

```nix
guestKernel = nix-pvm.packages.x86_64-linux.pvm-guest-kernel;
# → "${guestKernel}/bzImage"
```

The initramfs has to be gzip. The guest kernel only enables `CONFIG_RD_GZIP`, so anything else won't unpack, leaving no `/init` and a panic:

```nix
pkgs.makeInitrdNG {
  compressor = "gzip";
  contents = [ { source = "${myInit}/bin/init"; target = "/init"; } ];
}
```

### 4. Give the launcher `/dev/kvm`

Whatever boots the microVM (for me, a Go supervisor running [Cloud Hypervisor](https://www.cloudhypervisor.org/)) needs `/dev/kvm`. In its systemd service:

```nix
serviceConfig = {
  DeviceAllow = [ "/dev/kvm rw" ];
  SupplementaryGroups = [ "kvm" ];
};
```

That's it. The host boots on the PVM kernel, `/dev/kvm` is live, and the supervisor boots a single-use microVM per job. None of this is Hetzner-specific; it's just where I tested it.

## What I'm Using It For

The whole detour was for a programming contest I'm running this summer with friends: [Nolen Royalty](https://eieio.games) as our fearless leader, plus [Eliot Hedeman](https://github.com/eliothedeman) and [Henry Nelson](https://github.com/hcnelson99). More on that when we launch.

A contest means running code from strangers to score it. You want a clean, disposable VM around every submission, and you want a lot of them to be cheap. nix-pvm is how we get it.

## Try It

```sh
nix build .#pvm-kernel         # the host kernel
nix build .#pvm-guest-kernel   # the guest kernel
```

Or wire it into your flake with the four steps above. The cache hands you both kernels prebuilt, so neither ever compiles on your box.

Source is on [GitHub](https://github.com/fcjr/nix-pvm). It's early and pinned to what I've tested (Linux 6.7.12 on a Hetzner `cx23`), but the core idea works today: a real VM, on a cloud box that can't run one.
