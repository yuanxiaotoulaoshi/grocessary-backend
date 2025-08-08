import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document,Types} from 'mongoose';

export type UserDocument = User & Document ;

@Schema({timestamps:true})
export class User{
  _id:Types.ObjectId;

  @Prop({required:true, unique:true})
  userName:string;

  @Prop({required:true, unique:true})
  email:string;

  @Prop({required:true})
  password:string;

  @Prop({type:[String], default:[]})
  favorites:string [];

  @Prop({type:[String], default:[]})
  chunks:string [];
}
export const UserSchema = SchemaFactory.createForClass(User);