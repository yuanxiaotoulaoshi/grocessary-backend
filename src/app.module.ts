import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {MongooseModule} from '@nestjs/mongoose';
import {GlossaryModule} from './glossary/glossary.module';
import { TranslateModule } from './translate/translate.module';
import { UserModule } from './user/user.module';
import { ListenModule } from './listen/listen.module';
import { AuthModule } from './auth/auth.module';
@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://ycong5547:cong19980912@cluster0.irwpbiq.mongodb.net/glossary_db?retryWrites=true&w=majority&appName=Cluster0'),
    GlossaryModule,
    TranslateModule,
    UserModule,
    ListenModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
