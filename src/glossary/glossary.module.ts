
import {Module} from '@nestjs/common';
import {MongooseModule} from '@nestjs/mongoose';
import {Glossary,GlossarySchema} from './schemas/glossary.schema'
import { GlossaryController } from './glossary.controller';
import { GlossaryService } from './glossary.service';

@Module({
  imports:[MongooseModule.forFeature([{ name: Glossary.name, schema: GlossarySchema }])],
  controllers:[GlossaryController],
  providers:[GlossaryService],
})
export class GlossaryModule {}