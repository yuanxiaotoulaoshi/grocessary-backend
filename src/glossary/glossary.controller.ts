import { Controller,Get,Post,Query,Body } from '@nestjs/common';
import { GlossaryService } from './glossary.service';
import { CreateGlossaryDto } from './dto/create-glossary.dto';
@Controller('glossary')
export class GlossaryController {
  constructor(private readonly glossaryService: GlossaryService){}

  @Get()
  async getGlossaryList(
    @Query('categoryLevel1') categoryLevel1:string,
    @Query('categoryLevel2') categoryLevel2:string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
  ){
    return this.glossaryService.findAll(categoryLevel1, categoryLevel2, +page, +pageSize);
  }

  @Get('categories')
  getCategories(){
    return this.glossaryService.getCategoryTabs();
  }

  @Post('add')
  createGlossary(@Body() createDto: CreateGlossaryDto) {
    return this.glossaryService.create(createDto);
  }

  @Post('seed')
  seedGlossary() {
    return this.glossaryService.seedGlossary();
  }
}
