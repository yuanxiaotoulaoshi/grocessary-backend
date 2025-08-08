import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChunkDocument = Chunk & Document;

@Schema()
export class Chunk{
  @Prop({ required: true })
  userId: string;

  @Prop({required:true})
  chunk:string;

  @Prop({required:true})
  date:string;

  @Prop({required:true})
  type:string;
}

export const ListenSchema = SchemaFactory.createForClass(Chunk);