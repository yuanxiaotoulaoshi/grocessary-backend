import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ListenDocument = Listen & Document;

@Schema()
export class Listen{
  @Prop({ required: true })
  userId: string;

  @Prop({required:true})
  sentence:string;

  @Prop({required:true})
  videoId:string;

  @Prop({required:true})
  start:number;

  @Prop({required:true})
  end:number;

  @Prop({required:true})
  audioPath:string;

  @Prop({required:true})
  baseName:string;
}

export const ListenSchema = SchemaFactory.createForClass(Listen);