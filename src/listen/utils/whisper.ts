// import { exec } from 'child_process';
// import { promisify } from 'util';
// import * as path from 'path';
// import * as fs from 'fs';
// import { parseWhisperSegments } from './ffmpeg';

// const execAsync = promisify(exec);

// /**
//  * 调用 ffmpeg + whisper 自动处理字幕，并切割为 mp3
//  * @param inputPath - 原始 mp4 文件路径
//  * @param transcriptOutDir - 输出字幕和 mp3 的文件夹（如 uploads/xxx_sentences）
//  * @param wavOutPath - 中间生成的 wav 路径（如 uploads/xxx.wav）
//  */
// export async function transcribeWithWhisper(
//   inputPath: string,
//   transcriptOutDir: string,
//   wavOutPath: string,
// ) {
//   console.log('🚀 开始转码为 wav');

//   // 1. 将 mp4 转为 wav 格式
//   const wavCommand = `ffmpeg -y -i "${inputPath}" -ar 16000 -ac 1 "${wavOutPath}"`;
//   await execAsync(wavCommand);
//   console.log('✅ 转码为 wav 完成，开始识别');

//   // 2. 使用 Whisper 进行英文字幕识别
//   const whisperCommand = `whisper "${wavOutPath}" --model medium --language English --task transcribe --output_format json --output_dir "${transcriptOutDir}"`;
//   await execAsync(whisperCommand);

//   // 3. 获取 whisper 的输出 json 文件（在 uploads/xxx.json）
//   const base = path.parse(wavOutPath).name;

//   // 4. 确保输出目录存在
//   if (!fs.existsSync(transcriptOutDir)) {
//     fs.mkdirSync(transcriptOutDir, { recursive: true });
//   }

//   // 5. 移动 whisper 输出的 json 为 result.json
//   const jsonDestPath = path.join(transcriptOutDir, `${base}.json`);
//   // fs.renameSync(jsonSrcPath, jsonDestPath);
//   console.log(`✅ Whisper 识别完成，已保存为 ${jsonDestPath}`);

//   // 6. 切割为 mp3 文件
//   const segments = parseWhisperSegments(jsonDestPath);

//   console.log(`✅ 成功生成 ${segments.length} 个 mp3 片段`);
// }

import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import { parseWhisperSegments } from './ffmpeg';

const execAsync = promisify(exec);

export async function transcribeWithWhisper(
  inputPath: string,
  transcriptOutDir: string,
  wavOutPath: string,
) {
  console.log('🚀 开始转码为 wav');

  // 1. 将 mp4 转为 wav 格式
  const wavCommand = `ffmpeg -y -i "${inputPath}" -ar 16000 -ac 1 "${wavOutPath}"`;
  await execAsync(wavCommand);
  console.log('✅ 转码为 wav 完成，开始识别');

  // 2. 使用 faster-whisper 识别（通过 Python 脚本）
  const transcribeCommand = `python3 src/listen/utils/transcribe.py "${wavOutPath}" "${transcriptOutDir}"`;
  await execAsync(transcribeCommand);

  // 3. 生成的 JSON 路径
  const base = path.parse(wavOutPath).name;
  const jsonDestPath = path.join(transcriptOutDir, `${base}.json`);

  if (!fs.existsSync(jsonDestPath)) {
    throw new Error(`❌ JSON 文件未生成: ${jsonDestPath}`);
  }

  console.log(`✅ Whisper 识别完成，已保存为 ${jsonDestPath}`);

  // 4. 切割为 mp3 文件
  const segments = parseWhisperSegments(jsonDestPath);
  console.log(`✅ 成功生成 ${segments.length} 个 mp3 片段`);
}
