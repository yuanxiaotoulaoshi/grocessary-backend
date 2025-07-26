import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Glossary,GlossaryDocument} from './schemas/glossary.schema';
import { transformGlossary } from 'src/common/utils/transform-glossary';
import { CreateGlossaryDto } from './dto/create-glossary.dto';
import {Model} from 'mongoose';
@Injectable()
export class GlossaryService {
  constructor(
    @InjectModel(Glossary.name) private glossaryModel:Model<GlossaryDocument>,
  ){}

  async findAll(
    categoryLevel1:string,
    categoryLevel2:string,
    page:number,
    pageSize:number,
  ):Promise<any[]>{
    const skip = (page-1)*pageSize;
    const fitler = {
      categoryLevel1,
      categoryLevel2,
    }

    const results = await this.glossaryModel.find(fitler).skip(skip).limit(pageSize).exec();
    return results.map(transformGlossary); 
  }

  // insert a piece of data
  async create(createDto: CreateGlossaryDto) {
    const {cnName, enName, categoryLevel1,categoryLevel2} = createDto;
    const exists = await this.glossaryModel.exists({
      cnName,
      categoryLevel1,
      categoryLevel2,
    })
    if(exists){
      return{
        inserted:false,
        message:'该词条已存在，请不要重复插入',
      }
    }
    const created = new this.glossaryModel(createDto);
    await created.save(); 
    return {
      inserted:true,
      message:'插入成功',
    }
  }

  // initial data
  async seedGlossary(): Promise<void> {
    const sampleData = [];
    await this.glossaryModel.insertMany(sampleData);
  }

  // 
  getCategoryTabs(){
    return {
      前端: ['HTML', 'CSS', 'JavaScript', 'Vue', 'React'],
      后端: ['Node', 'Database', 'Auth'],
      数据: ['SQL', 'ETL', 'BigData'],
    }
  }

}
