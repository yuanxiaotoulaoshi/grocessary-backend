import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { transcribeWithWhisper } from './utils/whisper';
import { cutSentencesToMp3 } from './utils/ffmpeg';
import * as fs from 'fs';
import * as path from 'path';

interface VideoProcessingData {
  videoPath: string;
  originalName: string;
  baseName: string;
  wavPath: string;
  transcriptPath: string;
  mp3OutputDir: string;
}

@Processor('listen-processing')
export class ListenProcessor {
  @Process('process-video')
  async handleVideoProcessing(job: Job<VideoProcessingData>) {
    const {
      videoPath,
      originalName,
      baseName,
      wavPath,
      transcriptPath,
      mp3OutputDir,
    } = job.data;

    try {
      console.log(`🚀 开始处理视频: ${originalName} (Job ID: ${job.id})`);

      // 更新进度: 开始处理
      await job.progress(10);

      // 1. 调用 Whisper，生成 wav 和 json 字幕
      console.log('📝 开始转录...');
      await transcribeWithWhisper(videoPath, transcriptPath, wavPath);
      
      // 更新进度: 转录完成
      await job.progress(60);

      // 2. 检查转录结果
      const transcriptFilePath = path.join(transcriptPath, `${baseName}.json`);
      if (!fs.existsSync(transcriptFilePath)) {
        throw new Error(`❌ 转录文件未生成: ${transcriptFilePath}`);
      }

      // 3. 读取转录结果并切割音频
      console.log('🔪 开始切割音频...');
      const transcriptJson = JSON.parse(
        fs.readFileSync(transcriptFilePath, 'utf-8')
      );
      const segments = transcriptJson.segments;

      if (!segments || segments.length === 0) {
        throw new Error('❌ 未找到有效的音频片段');
      }

      // 更新进度: 开始切割
      await job.progress(70);

      // 4. 切割音频为 MP3 文件
      await cutSentencesToMp3(wavPath, segments, mp3OutputDir);

      // 更新进度: 切割完成
      await job.progress(90);

      // 5. 清理临时 wav 文件（可选）
      if (fs.existsSync(wavPath)) {
        fs.unlinkSync(wavPath);
        console.log(`🗑️ 已清理临时文件: ${wavPath}`);
      }

      // 完成处理
      await job.progress(100);

      console.log(
        `✅ 视频处理完成: ${originalName} (Job ID: ${job.id})`
      );
      console.log(`📁 输出目录: ${mp3OutputDir}`);
      console.log(`📄 转录文件: ${transcriptFilePath}`);

      return {
        status: 'completed',
        originalName,
        baseName,
        transcriptPath: transcriptFilePath,
        mp3OutputDir,
        segmentsCount: segments.length,
      };
    } catch (error) {
      console.error(
        `❌ 处理视频失败: ${originalName} (Job ID: ${job.id})`,
        error
      );

      // 清理可能生成的文件
      try {
        if (fs.existsSync(wavPath)) {
          fs.unlinkSync(wavPath);
        }
        if (fs.existsSync(mp3OutputDir)) {
          const files = fs.readdirSync(mp3OutputDir);
          for (const file of files) {
            fs.unlinkSync(path.join(mp3OutputDir, file));
          }
          fs.rmdirSync(mp3OutputDir);
        }
      } catch (cleanupError) {
        console.error('清理文件失败:', cleanupError);
      }

      throw error;
    }
  }

  // 可选: 添加其他处理器方法
  @Process('cleanup-old-files')
  async handleCleanupOldFiles(job: Job<{ olderThanDays: number }>) {
    const { olderThanDays } = job.data;
    
    try {
      console.log(`🧹 开始清理 ${olderThanDays} 天前的文件...`);
      
      const uploadsDir = './uploads';
      const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);
      
      if (!fs.existsSync(uploadsDir)) {
        return { message: '上传目录不存在' };
      }
      
      const entries = fs.readdirSync(uploadsDir, { withFileTypes: true });
      let deletedCount = 0;
      
      for (const entry of entries) {
        const fullPath = path.join(uploadsDir, entry.name);
        const stats = fs.statSync(fullPath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          if (entry.isDirectory()) {
            fs.rmSync(fullPath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(fullPath);
          }
          deletedCount++;
          console.log(`🗑️ 已删除: ${fullPath}`);
        }
      }
      
      console.log(`✅ 清理完成，删除了 ${deletedCount} 个文件/目录`);
      
      return {
        status: 'completed',
        deletedCount,
        message: `成功清理 ${deletedCount} 个过期文件`,
      };
    } catch (error) {
      console.error('清理文件失败:', error);
      throw error;
    }
  }
}