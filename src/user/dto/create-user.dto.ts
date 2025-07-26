import {IsEmail, IsNotEmpty, MinLength} from 'class-validator';
export class CreateUserDto {
  @IsNotEmpty()
  userName:string;

  @MinLength(6)
  password:string;
  
  @IsEmail()
  email:string;
}