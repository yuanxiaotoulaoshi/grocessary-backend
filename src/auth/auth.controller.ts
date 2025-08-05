import { Controller,Post,Get,Res,Req,Body, UseGuards} from '@nestjs/common';
import { AuthService } from './auth.service';
import {Response} from 'express'
import { JwtAuthGuard } from './jwt-auth.guard';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  async login(@Res({passthrough:true}) res:Response,@Body() body:any){
    console.log("resss",res)
    const {token} = await this.authService.login(body);
    res.cookie('token',token,{
      httpOnly:true,
      maxAge:7 * 24 * 60 * 60 * 1000, // 7day
      sameSite:true,
    })
    return {message:'Login successfully'}
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('token');
    return { message: 'Logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req){
    const {userName} = req.user;
    return {
      userName,
    };
  }
}
