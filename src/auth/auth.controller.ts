import { Controller ,Post,Res,Body} from '@nestjs/common';
import { AuthService } from './auth.service';
import {Response} from 'express'
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  async login(@Res({passthrough:true}) res:Response,@Body() body:any){
    console.log("resss",res)
    const {token} = await this.authService.login(body);
    res.cookie('token',token,{
      httpOnly:true,
      maxAge:7 * 24 * 60 * 60 * 1000, // 1day
    })
    return {message:'Login successfully'}
  }
}
