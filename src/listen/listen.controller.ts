import { 
  Body,
  Query,
  Controller,
  Post,
  Get,
  UseGuards,
  Req, 
  Delete,
  Request,UploadedFile,UseInterceptors,BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {extname} from 'path';
import { ListenService } from './listen.service';
import { CreateListenDto } from './dto/create-listen.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/common/utils/decorators/current-user.decorator';
// import { Request } from 'express';
import { UserDocument } from 'src/user/schemas/user.schema';
import { JwtPayload } from 'src/auth/types/jwt-payload';
@Controller('listen')
export class ListenController {
  constructor(private readonly listenService: ListenService) {}

  @UseGuards(JwtAuthGuard)
  @Post('collect')
  collect(@Body() dto: CreateListenDto, @Req() req: Request) {
    const user = req['user'] as {sub:string}; // 来自 cookie 的 user 信息
    return this.listenService.create(dto, user.sub); // 👈 传入 userId
  }

  @UseGuards(JwtAuthGuard)
  @Delete('unfavorite')
  async unfavorite(@Request() req, @Body('listenId')listenId:string ){
    const userId = req.user.sub;
    return this.listenService.unfavorite(userId,listenId)
  }

  @UseGuards(JwtAuthGuard)
  @Get('favorites')
  async getFavoriteAudios(@CurrentUser() user:JwtPayload){
    return this.listenService.getFavorites(user);
  }

  @Delete('clear-all')
  async clearAll(){
    return this.listenService.clearAll()
  }

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file',{
      storage:diskStorage({
        destination:'./uploads',
        filename:(req,file,cb)=>{
          // const uniqueName = `${Date.now()}${extname(file.originalname)}`;
          // cb(null,uniqueName);
          cb(null, file.originalname); // 直接保留原始文件名
        },
      })
    })
  )
  async uploadVideo(@UploadedFile() file:Express.Multer.File){
    if(!file){
      throw new BadRequestException('No file uploaded');
    }
    console.log("AAAAAAAAAAAA")
    console.log("EEEEEEEEEEEE")
    const result = await this.listenService.processVideo(file.path,file.originalname);
    console.log("BBBBBBBBBBBB")
    return {
      message:'Processed successfully',
      originalName:file.originalname,
      savePath:file.path,
      transcriptpath:result.transcriptPath,
    };
  }

  @Get('segents')
  async getSegents(@Query('videoPath') videoPath:string){
    return this.listenService.getSegents(videoPath);
  }

  @Get('mp3-list')
  async getMp3List(@Query('videoPath') videoPath:string){
    return this.listenService.getMp3List(videoPath);
  }

}
