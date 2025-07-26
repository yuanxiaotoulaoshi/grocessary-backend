import { Controller,Get,Body } from '@nestjs/common';
import { TranslateService } from './translate.service';

@Controller('translate')
export class TranslateController {
    constructor(private readonly translateService: TranslateService) {}

    @Get()
    async translate(@Body() body:{text:string}){
        const {text} = body;
        const result = await this.translateService.translate(text);
        return {translateText: result};
    }
}
