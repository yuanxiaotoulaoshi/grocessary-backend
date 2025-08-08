import { Injectable,BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import {Model} from 'mongoose';
import {Listen, ListenDocument} from './schemas/listen.schema';
import { CreateListenDto } from './dto/create-listen.dto';
import {User, UserDocument } from 'src/user/schemas/user.schema';
import { NotFoundException } from '@nestjs/common';

import * as fs from 'fs';
import * as path from 'path';
import * as fsExtra from 'fs-extra';
@Injectable()
export class ListenService {
  constructor(
    @InjectModel(Listen.name) private listenModel:Model<ListenDocument>,
    @InjectModel(User.name) private userModel:Model<UserDocument>,
    @InjectQueue('listen-processing') private listenQueue: Queue,
  ){}
  
  async create(dto:CreateListenDto,userId:string):Promise<Listen>{
    const {sentence, videoId, start,end,audioPath,baseName} = dto;
    console.log("")
    const existing  = await this.listenModel.findOne({baseName,audioPath,userId});
    console.log("existing",existing)
    if (existing){
      throw new BadRequestException('this sentence already exsits');
    }
    const collect = new this.listenModel({
      userId,
      sentence, 
      videoId, 
      start,
      end,
      audioPath,
      baseName,
    })
    const saved = await collect.save();
    await this.userModel.findByIdAndUpdate(userId, {
      $addToSet:{favorites:saved._id},
    })
    return saved;
  }

  async unfavorite(userId:string, listenId:string):Promise<void>{
    const listenItem = await this.listenModel.findById(listenId);
    if(!listenItem){
      throw new NotFoundException('该句子不存在')
    }
    await this.userModel.findByIdAndUpdate(userId,{
      $pull:{favorites:listenId}
    })
    // delete this item completelu from database
    await this.listenModel.findByIdAndDelete(listenId);
  }

  async getFavorites(
    user:{sub:string,userName:string},
    pageIndex:number,
    pageSize:number,
  ){
    const fullUser = await this.userModel.findById(user.sub)
    if(!fullUser?.favorites||fullUser.favorites.length===0){
      return [];
    }
    console.log("pageIndex",pageIndex)
    console.log("pageSize",pageSize)
    const skip = (pageIndex-1)*pageSize;
    const fitler = {
      _id:{$in:fullUser.favorites},
    }

    console.log('skipppp',skip)
    const favorites = await this.listenModel.find(fitler).skip(skip).limit(pageSize).exec();
    console.log('favoritesss',favorites)

    return favorites;
  }

  async processVideo(videoPath: string,originalName: string) {
    const baseName = path.basename(originalName, path.extname(originalName));
    const wavPath = `./uploads/${baseName}.wav`;
    const transcriptPath = `./uploads/${baseName}_sentences`;
    const mp3OutputDir = transcriptPath;
    
    if (fs.existsSync(mp3OutputDir)) {
      console.log("🔁 该视频已处理，复用现有结果");
      return {
        status: 'completed',
        message: 'Video already processed',
        originalName,
        baseName,
        transcriptPath: path.join(transcriptPath, `${baseName}.json`),
        mp3Dir: mp3OutputDir,
        videoPath,
      };
    }
    try {
      // 确保输出目录存在
      await fsExtra.ensureDir(mp3OutputDir);
      console.log("CCCCCCCCCCC")
      // 添加任务到 Redis 队列
      const job = await this.listenQueue.add(
        'process-video',
        {
          videoPath,
          originalName,
          baseName,
          wavPath,
          transcriptPath,
          mp3OutputDir,
        },
        {
          attempts: 3, // 重试次数
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 5, // 保留最近 5 个完成的任务
          removeOnFail: 10, // 保留最近 10 个失败的任务
        }
      );

      console.log(`📝 任务已添加到队列，Job ID: ${job.id}`);

      return {
        status: 'processing',
        message: 'Upload received, processing in background',
        jobId: job.id,
        originalName,
        baseName,
        transcriptPath: path.join(transcriptPath, `${baseName}.json`),
        mp3Dir: mp3OutputDir,
        videoPath,
      };
    } catch (err) {
      console.error('❌ Processing error:', err);
      throw new Error('Failed to process video');
    }

  }

  async getSegents(videoPath: string) {
    const baseName = path.basename(videoPath, path.extname(videoPath));
    const transcriptPath = path.join('uploads', `${baseName}_sentences`, `${baseName}.json`);

    if (!fs.existsSync(transcriptPath)) {
      return { status: 'processing' }; // 或抛出 202 Accepted 状态
    }

    const content = fs.readFileSync(transcriptPath, 'utf-8');
    const json = JSON.parse(content);
    return { status: 'done', segments: json.segments };
  }

  async getMp3List(videoPath: string) {
    const baseName = path.basename(videoPath, path.extname(videoPath));
    const mp3Dir = `./uploads/${baseName}_sentences`;
  
    if (!fs.existsSync(mp3Dir)) {
      throw new Error(`MP3 文件夹不存在: ${mp3Dir}`);
    }
  
    const files = fs.readdirSync(mp3Dir).filter(file => file.endsWith('.mp3'));
    return files.map(file => ({
      fileName: file,
      url: `/uploads/${baseName}_sentences/${file}`, // 假设你把 uploads 目录暴露为静态资源
    }));
  }
  
  async clearAll(): Promise<{message:string}>{
    await this.listenModel.deleteMany({});
    await this.userModel.updateMany({},{$set:{favorites:[]}})
    return {message:'数据库已清空'}
  }
}
