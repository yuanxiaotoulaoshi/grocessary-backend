import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { ListenService } from './listen.service';
import { ListenController } from './listen.controller';
import { ListenProcessor } from './listen.processor';
import {Listen, ListenSchema} from './schemas/listen.schema';
import { AuthModule } from 'src/auth/auth.module';
import { User, UserSchema } from 'src/user/schemas/user.schema'; // 👈
import { UserModule } from 'src/user/user.module';

@Module({
  imports:[
    MongooseModule.forFeature([{name:Listen.name,schema:ListenSchema},    { name: User.name, schema: UserSchema },]),UserModule,
    AuthModule,
    BullModule.registerQueue({
      name: 'listen-processing',
    }),
  ],
  controllers: [ListenController],
  providers: [ListenService,ListenProcessor],
  exports:[ListenService],
})
export class ListenModule {}
