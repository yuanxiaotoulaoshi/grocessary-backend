import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { register } from 'module';
import { JwtStrategy } from './jwt.strategy'; // ✅ 导入
import { JwtAuthGuard } from './jwt-auth.guard'; // 你原有的
@Module({
  imports:[
    UserModule,
    JwtModule.register({
      secret:'your_jwt_secret_key',
      signOptions:{expiresIn:'7d'},
    })
  ],
  controllers: [AuthController],
  providers: [AuthService,JwtModule,  JwtAuthGuard,JwtStrategy],
  exports:[AuthService,JwtModule,  JwtAuthGuard, JwtStrategy]
})
export class AuthModule {}
