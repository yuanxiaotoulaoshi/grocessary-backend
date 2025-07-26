// auth/jwt-auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const token = req.cookies['token'];
    if (!token) return false;

    try {
      const payload = await this.jwtService.verifyAsync(token);
      req['user'] = payload; // ✅ 保存 user 信息供后续使用
      return true;
    } catch (e) {
      return false;
    }
  }
}
