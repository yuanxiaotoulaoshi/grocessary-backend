# transcribe.py

import sys
import os
import json
import torch
from faster_whisper import WhisperModel

# 获取命令行参数
wav_path = sys.argv[1]
output_dir = sys.argv[2]

# 提取 base 文件名（不含扩展名）
base = os.path.splitext(os.path.basename(wav_path))[0]
json_path = os.path.join(output_dir, f"{base}.json")

# 确保输出目录存在
os.makedirs(output_dir, exist_ok=True)

# 加载模型（CPU 模式；可以改为 'medium'、'large'）
model_size = "medium"
device = "cpu"
# device = "cuda" if torch.cuda.is_available() else "cpu"
model = WhisperModel(model_size, device=device, compute_type="int8")

# 开始转录
segments, _ = model.transcribe(wav_path, language="en", task="transcribe")

# 将 segments 转为 JSON 格式
output_segments = []
for segment in segments:
    output_segments.append({
        "start": segment.start,
        "end": segment.end,
        "text": segment.text.strip()
    })

# 保存为 JSON 文件
with open(json_path, "w", encoding="utf-8") as f:
    json.dump({"segments": output_segments}, f, ensure_ascii=False, indent=2)

print(f"✅ 成功生成字幕文件: {json_path}")
