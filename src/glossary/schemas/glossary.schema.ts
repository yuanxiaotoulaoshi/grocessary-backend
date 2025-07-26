import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GlossaryDocument = Glossary & Document;

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
}

export const GlossarySchema = SchemaFactory.createForClass(Glossary);