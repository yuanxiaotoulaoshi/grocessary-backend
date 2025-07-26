import {IsEmail , IsNotEmpty , MinLength} from 'class-validator';

export class LoginUserDto{
  @IsEmail()
  userName: string; // this can be either email or username

  @MinLength(6)
  password:string;
}