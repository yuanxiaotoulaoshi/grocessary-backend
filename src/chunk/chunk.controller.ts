import { Controller,UseGuards,Get,Post,Body,Req,Query} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateChunkDto } from './dto/create-chunk.dto';
import { CurrentUser } from 'src/common/utils/decorators/current-user.decorator';
import { JwtPayload } from 'src/auth/types/jwt-payload';

import { ChunkService } from './chunk.service';

@Controller('chunk')
export class ChunkController {
    constructor(private readonly chunkService: ChunkService) {}

    @UseGuards(JwtAuthGuard)
    @Post('collect')
    collect(@Body() dto: CreateChunkDto, @Req() req: Request) {
        const user = req['user'] as {sub:string}; // 来自 cookie 的 user 信息
        return this.chunkService.create(dto, user.sub); // 👈 传入 userId
    }

    @UseGuards(JwtAuthGuard)
    @Get('chunkList')
    async getChunkList(
    @CurrentUser() user:JwtPayload,
    @Query('pageIndex') pageIndex = 1,
    @Query('pageSize') pageSize = 10,
    @Query('type') type = '',
    ){
        return this.chunkService.getChunkList(
            user,
            type,
            pageIndex,
            pageSize,
        );
    }

    @Get('chunkType')
    getCategories(){
        return this.chunkService.getChunkType();
    }
}
