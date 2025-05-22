import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { TelegramService } from './telegram.service';
import { YandexDiskService } from '../yandex/yandex-disk.service';
import { HttpModule } from '@nestjs/axios';
import { StartHandler } from './handlers/start.handler';
import { TextHandler } from './handlers/text.handler';
import { HelpHandler } from './handlers/help.handler';
import { DocumentHandler } from './handlers/document.handler';
import { UsersService } from './authorization/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './authorization/schema/schema';
import { UserHandler } from './handlers/user.handleer';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        token: '7786713557:AAFCqvTTzu-iiq9P_XYLQQuOdVkM-vbv0QA',
        middlewares: [session()],
      }),
    }),
    HttpModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // ✅
  ],
  providers: [
    TelegramService,
    StartHandler,
    HelpHandler,
    TextHandler,
    DocumentHandler,
    YandexDiskService,
    UserHandler,
    UsersService,
  ],
})
export class TelegramModule {}
