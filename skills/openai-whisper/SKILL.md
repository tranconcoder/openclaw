---
name: openai-whisper
description: Local speech-to-text with the Whisper CLI (no API key). optimized for low RAM.
homepage: https://openai.com/research/whisper
metadata:
  {
    "openclaw":
      {
        "emoji": "🎙️",
        "requires": { "bins": ["whisper"] }
      },
  }
---

# Whisper (CLI)

Use `whisper` to transcribe audio locally. 

**IMPORTANT: Always use `--model small` to save RAM (optimized for VPS with limited memory).**

Quick start

- `whisper /path/audio.mp3 --model small --output_format txt --output_dir .`
- `whisper /path/audio.m4v --model small --task translate --output_format srt`

Notes

- Models download to `~/.cache/whisper` on first run.
- Use `small` model as it only requires ~2.5GB RAM.
