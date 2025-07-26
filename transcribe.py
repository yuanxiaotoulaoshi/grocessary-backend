import sys
from faster_whisper import WhisperModel
import json

def main(audio_path):
    model = WhisperModel("medium", device="cpu", compute_type="int8")
    segments, info = model.transcribe(audio_path, beam_size=5)

    result = {
        "language": info.language,
        "duration": info.duration,
        "segments": [
            {
                "start": seg.start,
                "end": seg.end,
                "text": seg.text
            }
            for seg in segments
        ]
    }

    json_path = audio_path.replace(".wav", ".json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(json_path)

if __name__ == "__main__":
    audio_path = sys.argv[1]
    main(audio_path)
