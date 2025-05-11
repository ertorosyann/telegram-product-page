import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf'; // ✅ import session middleware
import { TelegramService } from './telegram.service';
import { YandexDiskService } from './yandex-disk.service';
import { HttpModule } from '@nestjs/axios';
import { StartHandler } from './handlers/start.handler';
import { TextHandler } from './handlers/text.handler';
import { HelpHandler } from './handlers/help.handler';
import { CallbackHandler } from './handlers/callback.handler';

@Module({
  imports: [
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        token: '8044191482:AAFNH5xxTVwsPsCByJI86MZ5w0R0Pmc6Jv4',
        middlewares: [session()], // keep session
      }),
    }),
    HttpModule,
  ],
  providers: [
    TelegramService,
    StartHandler,
    CallbackHandler,
    TextHandler,
    HelpHandler,
    YandexDiskService,
  ],
})
export class TelegramModule {}
