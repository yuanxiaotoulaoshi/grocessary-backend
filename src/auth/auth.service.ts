import { Injectable,UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService:UserService,
    private readonly jwtService:JwtService,
  ){}

  async login(loginDto:{userName:string;password:string}){
    console.log("########",loginDto)
    const user = await this.userService.validateUser(loginDto.userName,loginDto.password);
    console.log("********",user)
    if(!user){
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = {sub:user._id, userName:user.userName};
    const token = this.jwtService.sign(payload);
    return {
      message:'Login successfully',
      token
    }
  }
}
