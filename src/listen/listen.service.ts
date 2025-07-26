import { Injectable,BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Listen, ListenDocument} from './schemas/listen.schema';
import { CreateListenDto } from './dto/create-listen.dto';
import {User, UserDocument } from 'src/user/schemas/user.schema';
import { NotFoundException } from '@nestjs/common';
import {cutSentencesToMp3} from './utils/ffmpeg';
import {transcribeWithWhisper} from './utils/whisper'
import * as fs from 'fs';
import * as path from 'path';
import * as fsExtra from 'fs-extra';
@Injectable()
export class ListenService {
  constructor(
    @InjectModel(Listen.name) private listenModel:Model<ListenDocument>,
    @InjectModel(User.name) private userModel:Model<UserDocument>
  ){}
  
  async create(dto:CreateListenDto,userId:string):Promise<Listen>{
    const {sentence, videoId, start,end,audioPath,baseName} = dto;
    const existing  = await this.listenModel.findOne({audioPath,userId});
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
    console.log("#####",listenId)
    console.log("&&&&&",userId)
    const listenItem = await this.listenModel.findById(listenId);
    console.log("*****",listenItem)
    if(!listenItem){
      throw new NotFoundException('该句子不存在')
    }
    await this.userModel.findByIdAndUpdate(userId,{
      $pull:{favorites:listenId}
    })
    // delete this item completelu from database
    await this.listenModel.findByIdAndDelete(listenId);
  }

  async getFavorites(user:{sub:string,userName:string}){
    console.log("userrrrrr",user)
    const fullUser = await this.userModel.findById(user.sub)
    console.log("fullUser",fullUser)

    if(!fullUser?.favorites||fullUser.favorites.length===0){
      return [];
    }

    const favorites = await this.listenModel.find({
      _id:{$in:fullUser.favorites},
    })

    console.log("****",favorites)
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
        message: 'Video already processed',
        originalName,
        baseName,
        transcriptPath: path.join(transcriptPath, `${baseName}.json`),
        mp3Dir: mp3OutputDir,
        videoPath,
      };
    }
   
    await fsExtra.emptyDir(mp3OutputDir);

    try{
      // 1. 调用 Whisper，生成 wav 和 json 字幕
    transcribeWithWhisper(videoPath, transcriptPath, wavPath).then(()=>{
      const transcriptFilePath = path.join(transcriptPath, `${baseName}.json`);
      if (!fs.existsSync(transcriptFilePath)) {
        console.error("Transcript file missing", transcriptFilePath);
        return;
      }
      const transcriptJson = JSON.parse(fs.readFileSync(transcriptFilePath, 'utf-8'));
      const segments = transcriptJson.segments;

      return cutSentencesToMp3(wavPath, segments, mp3OutputDir);
    }) .then(() => {
      console.log('All processing done for', videoPath);
    })
    .catch(err => {
      console.error('Processing error', err);
    });
    console.log("CCCCCCCCCC")
  
    return {
      message: 'Upload received, processing in background',
      originalName:path.basename(videoPath),
      baseName,
      transcriptPath:path.join(transcriptPath,`${baseName}.json`),
      mp3Dir: mp3OutputDir,
      videoPath,
    };
    }catch (err) {
      console.error("❌ Processing error:", err);
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
