import { Injectable,BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {Model} from 'mongoose';
import { CreateChunkDto } from './dto/create-chunk.dto';
import {Chunk, ChunkDocument} from './schemas/chunk.schema';
import {User, UserDocument } from 'src/user/schemas/user.schema';

@Injectable()
export class ChunkService {
    constructor(
        @InjectModel(Chunk.name) private chunkModel:Model<ChunkDocument>,
        @InjectModel(User.name) private userModel:Model<UserDocument>,
    ){}
    async create(dto:CreateChunkDto,userId:string):Promise<Chunk>{
        const {chunk,date,type} = dto;
        console.log("*********",chunk,date,type)
        const existing  = await this.chunkModel.findOne({chunk,type});
        console.log("existing",existing)
        if (existing){
            throw new BadRequestException('this sentence already exsits');
        }
        const item = new this.chunkModel({
            userId,
            chunk,
            date,
            type,
        })
        const saved = await item.save();
        await this.userModel.findByIdAndUpdate(userId, {
            $addToSet:{chunks:saved._id},
        })
        return saved;
    }

    async getChunkList(
        user:{sub:string,userName:string},
        type:string,
        pageIndex:number,
        pageSize:number,
      ){
        const fullUser = await this.userModel.findById(user.sub)
        if(!fullUser?.chunks||fullUser.favorites.length===0){
          return [];
        }
        console.log("pageIndex",pageIndex)
        console.log("pageSize",pageSize)
        const skip = (pageIndex-1)*pageSize;
        const fitler = {
          _id:{$in:fullUser.chunks},
          type,
        }
        console.log('skipppp',skip)
        const chunks = await this.chunkModel.find(fitler).skip(skip).limit(pageSize).exec();
        console.log('chunkssss',chunks)

        return chunks;
    }

    // the category of tab 
    getChunkType(){
        return [
            {text:'Noun+Noun',id:'001'},
            {text:'Adj+Noun',id:'002'},
            {text:'Verb+Noun',id:'003'},
            {text:'Adv+Adj',id:'004'},
            {text:'Verb+Adv',id:'005'},
            {text:'Verb+Prep',id:'006'},
            {text:'Idioms',id:'007'},
        ]
    }


}
