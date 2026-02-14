#!/usr/bin/env python3
"""
YouTube Playlist Transcript Fetcher
Fetches transcripts from all videos in the AgeSA Finansal Terapi playlist
and saves them as a JSON file for use in the chatbot.
"""

import subprocess
import json
import re
import sys
import time

from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import (
    TranscriptsDisabled,
    NoTranscriptFound,
    VideoUnavailable,
)


PLAYLIST_URL = "https://www.youtube.com/playlist?list=PL43zPaq7_JxTixiFeNf-nQFvRhAzTI0Jq"

# Create a single instance (v1.2+ API)
ytt = YouTubeTranscriptApi()


def get_playlist_videos(playlist_url):
    """Extract all video info from a YouTube playlist using yt-dlp."""
    try:
        result = subprocess.run(
            ["yt-dlp", "--flat-playlist", "--dump-json", playlist_url],
            capture_output=True,
            text=True,
            check=True,
        )
        videos = []
        for line in result.stdout.strip().split("\n"):
            if not line.strip():
                continue
            data = json.loads(line)
            title = data.get("title", "Unknown Title")
            # Skip private/deleted videos
            if title in ["[Private video]", "[Deleted video]"]:
                continue
            videos.append(
                {
                    "id": data.get("id", ""),
                    "title": title,
                    "url": f"https://www.youtube.com/watch?v={data.get('id', '')}",
                    "duration": data.get("duration", 0),
                }
            )
        return videos
    except subprocess.CalledProcessError as e:
        print(f"yt-dlp error: {e}")
        return []


def clean_transcript(text):
    """Remove annotations like [Music], [Applause], etc."""
    text = re.sub(r"\[.*?\]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def get_transcript(video_id):
    """Fetch transcript for a video using v1.2+ API."""
    try:
        # Try Turkish first, then English
        result = ytt.fetch(video_id, languages=["tr", "en"])
        return result.snippets
    except Exception:
        pass

    try:
        # Try listing available transcripts
        transcript_list = ytt.list(video_id)
        # Try to find any Turkish transcript
        for t in transcript_list:
            if t.language_code.startswith("tr"):
                fetched = t.fetch()
                return fetched.snippets
        # Try any available
        for t in transcript_list:
            fetched = t.fetch()
            return fetched.snippets
    except Exception:
        pass

    try:
        # Last resort: fetch without language preference
        result = ytt.fetch(video_id)
        return result.snippets
    except Exception as e:
        print(f"  Could not fetch transcript: {e}")
        return None


def format_timestamp(seconds):
    """Convert seconds to HH:MM:SS format."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    if hours > 0:
        return f"{hours:02d}:{minutes:02d}:{secs:02d}"
    return f"{minutes:02d}:{secs:02d}"


def process_video(video_info):
    """Process a single video: fetch transcript and format it."""
    video_id = video_info["id"]
    title = video_info["title"]
    url = video_info["url"]

    print(f"  Fetching transcript for: {title}")

    snippets = get_transcript(video_id)
    if not snippets:
        print(f"  SKIPPED (no transcript available)")
        return None

    # Build full text
    full_text = " ".join(
        s.text.strip() for s in snippets if s.text.strip()
    )
    full_text = clean_transcript(full_text)

    # Build segments with timestamps (group every ~60 seconds)
    segments = []
    current_segment = {"start": 0, "text": ""}
    segment_duration = 60  # seconds

    for snippet in snippets:
        start = snippet.start
        text = snippet.text.strip()
        if not text:
            continue

        if start - current_segment["start"] >= segment_duration and current_segment["text"]:
            segments.append(
                {
                    "timestamp": format_timestamp(current_segment["start"]),
                    "start_seconds": current_segment["start"],
                    "text": clean_transcript(current_segment["text"]),
                }
            )
            current_segment = {"start": start, "text": text}
        else:
            current_segment["text"] += " " + text

    # Don't forget the last segment
    if current_segment["text"]:
        segments.append(
            {
                "timestamp": format_timestamp(current_segment["start"]),
                "start_seconds": current_segment["start"],
                "text": clean_transcript(current_segment["text"]),
            }
        )

    return {
        "videoId": video_id,
        "title": title,
        "url": url,
        "duration": video_info.get("duration", 0),
        "fullText": full_text,
        "segments": segments,
        "segmentCount": len(segments),
        "wordCount": len(full_text.split()),
    }


def main():
    print(f"Fetching playlist: {PLAYLIST_URL}")
    print("=" * 60)

    videos = get_playlist_videos(PLAYLIST_URL)
    print(f"Found {len(videos)} videos in playlist\n")

    results = []
    for i, video in enumerate(videos, 1):
        print(f"[{i}/{len(videos)}] Processing: {video['title']}")
        result = process_video(video)
        if result:
            results.append(result)
            print(f"  OK - {result['wordCount']} words, {result['segmentCount']} segments")
        time.sleep(1)  # Be nice to YouTube

    print("\n" + "=" * 60)
    print(f"Successfully processed {len(results)}/{len(videos)} videos")

    total_words = sum(r["wordCount"] for r in results)
    print(f"Total words: {total_words}")
    print(f"Estimated tokens: ~{int(total_words * 1.3)}")

    # Save as JSON
    output = {
        "playlist": {
            "title": "AgeSA ile Finansal Terapi",
            "url": PLAYLIST_URL,
            "videoCount": len(results),
            "totalWords": total_words,
        },
        "videos": results,
    }

    output_path = "scripts/transcripts.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"\nSaved to {output_path}")
    return output


if __name__ == "__main__":
    main()
