import { Body,Controller,Post,Get } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import {Res} from '@nestjs/common';
import { Response } from 'express';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() CreateUserDto:CreateUserDto){
    return this.userService.create(CreateUserDto);
  }

  @Post('login')
  async login(@Body() loginDto:LoginUserDto,@Res({passthrough:true})res:Response){
    return this.userService.login(loginDto,res)
  }

  @Get('userList')
  async getRegisterList(){
    return this.userService.getRegisterList();
  }
}
