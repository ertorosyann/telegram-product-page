import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf'; // ✅ import session middleware
import { TelegramService } from './telegram.service';
import { YandexDiskService } from '../yandex/yandex-disk.service';
import { HttpModule } from '@nestjs/axios';
import { StartHandler } from './handlers/start.handler';
import { TextHandler } from './handlers/text.handler';
import { HelpHandler } from './handlers/help.handler';
import { DocumentHandler } from './handlers/document.handler';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        token: '7559322394:AAHHLZ08o2aK7wD6gctr5RTtDEvdrsFx0HU',
        middlewares: [session()], // keep session
      }),
    }),
    HttpModule,
  ],
  providers: [
    TelegramService,
    StartHandler,
    HelpHandler,
    TextHandler,
    DocumentHandler,
    YandexDiskService,
  ],
})
export class TelegramModule {}
