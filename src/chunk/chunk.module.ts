import { Module } from '@nestjs/common';
import { ChunkService } from './chunk.service';
import { ChunkController } from './chunk.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {Chunk, ListenSchema} from './schemas/chunk.schema';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from 'src/user/schemas/user.schema'; 
import { UserModule } from 'src/user/user.module';
@Module({
  imports:[
        MongooseModule.forFeature([
            {name:Chunk.name,schema:ListenSchema},   
            {name: User.name, schema: UserSchema },
        ]),
        UserModule,
        AuthModule,
    ],
  controllers: [ChunkController],
  providers: [ChunkService],

})
export class ChunkModule {}
