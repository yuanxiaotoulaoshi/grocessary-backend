import { Module } from '@nestjs/common';
// import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {MongooseModule} from '@nestjs/mongoose';
import {GlossaryModule} from './glossary/glossary.module';
import { TranslateModule } from './translate/translate.module';
import { UserModule } from './user/user.module';
import { ListenModule } from './listen/listen.module';
import { AuthModule } from './auth/auth.module';
import { BullModule } from '@nestjs/bull';
// import {BullBoardModule} from '@bull-board/nestjs';
// import { ExpressAdapter } from '@nestjs/platform-express';
import { ChunkModule } from './chunk/chunk.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://ycong5547:cong19980912@cluster0.irwpbiq.mongodb.net/glossary_db?retryWrites=true&w=majority&appName=Cluster0'),
    GlossaryModule,
    TranslateModule,
    UserModule,
    ListenModule,
    AuthModule,

    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || 'localhost', // 或用 process.env.REDIS_HOST
        port: 6379,
        lazyConnect: false,
        maxRetriesPerRequest: null,
        // keepAlive: 30000,
      },
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
      settings: {
        stalledInterval: 30 * 1000, // 30秒检查一次停滞的任务
        maxStalledCount: 1, // 最大停滞次数
      }
    }),

    BullModule.registerQueue({
      name: 'listen-processing',
      defaultJobOptions: {
        removeOnComplete: 5,
        removeOnFail: 10,
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
      },
    }),

    ChunkModule,

    // settings: {
    //   stalledInterval: 30 * 1000,    // 30秒检查一次停滞的任务
    //   maxStalledCount: 1,            // 最大停滞次数
    // },

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
