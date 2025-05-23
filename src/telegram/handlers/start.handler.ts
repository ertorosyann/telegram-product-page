import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';
import { getMainMenuKeyboard } from '../utils/manu';
import { UsersService } from '../authorization/users.service';
@Injectable()
export class StartHandler {
  private readonly templateLink = process.env.YANDEX_LINK || '';
  private readonly adminUsername = 'torosyann1';

  constructor(private readonly userService: UsersService) {}
  async handle(ctx: Context) {
    const telegramUsername = ctx.from?.username;
    if (!telegramUsername) {
      await ctx.reply('❌ Не удалось определить ваш Telegram username.');
      return;
    }

    const x = await getMainMenuKeyboard(
      ctx.from?.username || '',
      this.userService,
    );

    await ctx.reply(
      '👋 *Добро пожаловать в бота по поиску цен на запчасти\\!*',
      {
        parse_mode: 'MarkdownV2',
        ...x,
      },
    );

    await ctx.reply('Отправьте текст или Excel-файл, и мы его обработаем');
  }
}
