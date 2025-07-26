import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * 将传入的 wav 音频按句子分割导出为 mp3 文件
 * @param wavPath 原始 wav 文件路径
 * @param segments 分割的时间段数组 [{ start, end }]
 * @param outputDir mp3 输出目录（将直接写入该目录）
 */
export async function cutSentencesToMp3(
  wavPath: string,
  segments: { start: number; end: number; id?: number }[],
  outputDir: string,
) {
  if (fs.existsSync(outputDir)) {
    const stat = fs.statSync(outputDir);
    if (!stat.isDirectory()) {
      fs.unlinkSync(outputDir);
      fs.mkdirSync(outputDir, { recursive: true });
    }
  } else {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  for (let i = 0; i < segments.length; i++) {
    const { start, end } = segments[i];
    const duration = end - start;
    const outputFile = path.join(outputDir, `sentence_${i}.mp3`);

    const command = `ffmpeg -y -i "${wavPath}" -ss ${start} -t ${duration} -vn -ar 44100 -ac 2 -b:a 192k "${outputFile}"`;
    await execAsync(command);
  }
}

/**
 * 解析 Whisper 生成的 JSON 文件，提取时间段数组
 */
export function parseWhisperSegments(jsonPath: string): { start: number; end: number }[] {
  const content = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(content);

  if (!Array.isArray(data.segments)) {
    throw new Error(`❌ Whisper JSON 格式不正确: ${jsonPath}`);
  }

  return data.segments.map((seg: any) => ({
    start: seg.start,
    end: seg.end,
  }));
}
