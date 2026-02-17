---
title: 'I Shipped a Native macOS App in a Day'
date: '2026-02-23'
spoiler: "Making polished, shippable desktop apps for yourself has never been easier."
---

I shipped a native macOS app in a day. A day where I was also recovering from a cold, booking flights, letting workers into my apartment to fix a broken pipe, and working on the actual products I'm building. It looks great. It works great. It ships via Homebrew and auto-updates.

A year ago I would have gotten the core working and stopped there. No code signing, no auto-updates, no Homebrew formula, no README. It would have sat on my hard drive, used once, forgotten.

[Local Translate](https://github.com/fcjr/local-translate) is an offline translation app for macOS. It uses Google's [TranslateGemma](https://huggingface.co/collections/google/translategemma-685a606c209046a3ed0540de) to translate 79 languages locally on Apple Silicon. Your text never leaves your machine.

## The Vibe Shift

The gap between "I wish this existed" and "I shipped it" has gotten absurdly small.

A friend needed some sensitive documents translated and I didn't want to send them to the cloud. I tried TranslateGemma via [Ollama](https://ollama.com/) and was impressed with how decent it was. Good enough that it deserved something nicer than a terminal. So I sat down with [Claude Code](https://claude.ai/claude-code) and started building.

By the end of the day I had a [Tauri](https://tauri.app/) app with a Svelte frontend, Rust core, and Python backend running TranslateGemma via [MLX](https://github.com/ml-explore/mlx) on the GPU. Model selection, text-to-speech via [Qwen3 TTS](https://huggingface.co/Qwen/Qwen3-TTS), a Homebrew tap, DMG packaging, auto-updates. It's something I'd hand to a friend and say "install this."

I'm probably not proud of the code. But I'm happy with the results, and for a project like this, isn't that the important part?

## What Changed

Building desktop apps always felt too painful to justify for personal tools. Half your time goes to packaging, code signing, platform quirks, update mechanisms. Stuff that has nothing to do with the problem you care about. Most of my ideas for little tools died as "I should build that someday."

Claude Code just handled all of that. I focused on the translation and the UI. Everything else happened around it. I love writing software and I don't expect that to go away any time soon, but it's nice to spend more time solving problems and less time fighting with the details.

The gap between "I don't care, I'll vibe code it" and "I'd be proud to have my friends install this" has gotten surprisingly small.

## The App

You pick a source language, pick a target language, paste text, get a translation. Once the model downloads, you don't need an internet connection.

| Model | RAM | Download |
|-------|-----|----------|
| TranslateGemma 4B (4-bit) | 4 GB | ~2.2 GB |
| TranslateGemma 4B (8-bit) | 6 GB | ~4.1 GB |
| TranslateGemma 27B (4-bit) | 18 GB | ~15.2 GB |

The 4B at 4-bit is fast and surprisingly good. My M4 Max translates a paragraph almost instantly. The 27B is noticeably better if you have the RAM for it.

```bash
brew install fcjr/fcjr/local-translate
```

Or grab the DMG from the [releases page](https://github.com/fcjr/local-translate/releases). Requires macOS Ventura or later and Apple Silicon.

## Build Things for Yourself

I think programmers are going to start building way more small, polished tools for themselves and their friends. It's now worth building something you might be the only user of. It's becoming easier to maintain multiple bespoke apps. I'm thinking alot about what malleable software means now that we have these new tools, but thats a topic for another time.

If you've been sitting on an idea for a little utility that would make your life better, go build it. It's probably a day.

Source code is on [GitHub](https://github.com/fcjr/local-translate).
