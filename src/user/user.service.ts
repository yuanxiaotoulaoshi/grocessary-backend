import { Injectable ,BadRequestException} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {User, UserDocument} from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel:Model<UserDocument>,
  private jwtService:JwtService){}

  async create(createUserDto:CreateUserDto):Promise<User>{
    const {userName, email, password} = createUserDto;
    console.log("****",createUserDto)
    const existing  = await this.userModel.findOne({$or:[{email},{userName}]});
    if (existing){
      throw new BadRequestException('UserName or email already exsits');
    }
    const hashedPassword = await bcrypt.hash(password,10);
    const user = new this.userModel({
      userName, 
      email, 
      password:hashedPassword,
    })
    return user.save();
  }

  async validateUser(userName:string , password:string):Promise<User|null>{
    const users = await this.userModel.find();

    const user = await this.userModel.findOne({userName});
    if(!user){
      throw new BadRequestException('Invalid credentials');
    }
    if(!password){
      throw new BadRequestException('Password cannot be empty');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
      throw new BadRequestException('Invalid credentials');
    }
    return user;
  }

  async login(loginDto:LoginUserDto,res:Response){
    const user = await this.validateUser(loginDto.userName , loginDto.password);
    const payload = {userId:user?._id};
    const token = this.jwtService.sign(payload);
    res.cookie('token',{
      httpOnly:true,
      sameSite:'lax',
      maxAge:7 * 24 * 60 * 60 * 1000,
    })
    return {
      message: 'Login successful',
      user:{
        _id:user?._id,
        userName:user?.userName,
        email:user?.email
      },
    }
  }

}
