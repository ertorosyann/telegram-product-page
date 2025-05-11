//

import { Injectable } from '@nestjs/common';
import { InjectBot, Start, Help, On, Ctx, Update } from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Context } from 'src/types/context.interface';
import { StartHandler } from './handlers/start.handler';
import { CallbackHandler } from './handlers/callback.handler';
import { TextHandler } from './handlers/text.handler';
import { HelpHandler } from './handlers/help.handler';
import { YandexDiskService } from './yandex-disk.service';
import { HttpService } from '@nestjs/axios';

@Injectable()
@Update()
export class TelegramService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly yandexDiskService: YandexDiskService,
    private readonly httpService: HttpService,
    private readonly startHandler: StartHandler,
    private readonly callbackHandler: CallbackHandler,
    private readonly textHandler: TextHandler,
    private readonly helpHandler: HelpHandler,
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.startHandler.handle(ctx);
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await this.helpHandler.handle(ctx);
  }

  @On('callback_query')
  async onCallback(@Ctx() ctx: Context) {
    await this.callbackHandler.handle(ctx);
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    await this.textHandler.handle(ctx);
  }
}
