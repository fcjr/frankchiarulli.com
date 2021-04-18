---
author: 'Frank Chiarulli Jr.'
title: 'Influencing your Parent Process'
date: '2021-04-18'
description: 'Exploring how to execute commands from a child process.'
tags: ['go', 'syscall', 'process', 'ioctl']
categories: ['go', 'process', 'linux', 'syscall']
series: ['alert']
---

I recently started writing a go replacement for Markus Færevaag's wonderful zsh module [wd](https://github.com/mfaerevaag/wd) (a cd wrapper for jumping to different directories by aliases). WD is _wonderful_ but it requires a bit of shell configuration to get started with. Ideally my solution would be completely portable.

Since modifying another processes environment is really a posix no-go, the "correct" way to do this would be wrap a portable executable in a shell function for each target shell script language like so:

```sh
# non-portable wrapper function written in each target's shell script language, contained in the .rc
function wd() {
	cd "$(portable_wd_implementation_in_go "$0")"
}
```

Now when executing `wd` the output of the portable implementation would be returned to the parent shell and the parent shell would then `cd` to that result.

But what if we wanted to ignore the rules and influence the parent shell with zero configuration. My first thought was modifying the shell environment directly via the [ptrace](https://man7.org/linux/man-pages/man2/ptrace.2.html) syscall. However this is effectively impossible on modern macOS machines since the introduction of [SIP](https://support.apple.com/en-us/HT204899).

## Enter [ioctl](https://man7.org/linux/man-pages/man2/ioctl.2.html).

The ioctl syscall allows you to modify parameters of special files like terminals! Sounds promising. Of particular interest is the `TIOCSTI` command for faking terminal input. Calling `TIOCSTI` with a particular byte will add it to the input queue of the given file, effectively typing the character. So lets give it a try!

```go
package main

import (
        "syscall"
        "unsafe"
)

func main() {
	char := '!'
	syscall.Syscall(
			syscall.SYS_IOCTL,
			0,
			syscall.TIOCSTI,
			uintptr(unsafe.Pointer(&char)),
		)
}
```

Executing the above go program prints '!' to the parent terminal! Now we can wrap ioctl in a little helper function and execute commands in our parents shell!

```go
package main

import (
        "syscall"
        "unsafe"
)

// injects the given string into the parent shell
func inject(str string) {
	for _, char := range str {
		syscall.Syscall(
			syscall.SYS_IOCTL,
			0,
			syscall.TIOCSTI,
			uintptr(unsafe.Pointer(&char)),
		)
	}
}

func main() {
	inject("cd /\r") // executes "cd /" in our parent shell.
}
```
