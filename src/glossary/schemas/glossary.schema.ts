import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GlossaryDocument = Glossary & Document;
type currentMetadata = {
  baseName: string, 
  videoId: string,
}

@Schema()
export class Glossary{
  _id:string;

  @Prop({required:true})
  cnName:string;

  @Prop({required:true})
  enName:string;

  @Prop({required:true})
  categoryLevel1:string;

  @Prop({required:true})
  categoryLevel2:string;

  @Prop({required:false})
  currentMetadata:string;
}

export const GlossarySchema = SchemaFactory.createForClass(Glossary);