import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';
import { getMainMenuKeyboard } from '../utils/manu';
import { UsersService } from '../authorization/users.service';
@Injectable()
export class StartHandler {
  private readonly templateLink = process.env.YANDEX_LINK || '';

  constructor(private readonly userService: UsersService) {}
  async handle(ctx: Context) {
    const telegramUsername = ctx.from?.username;
    if (!telegramUsername) {
      await ctx.reply('❌ Не удалось определить ваш Telegram username.');
      return;
    }
    const isAdmin = await this.userService.isAdmin(telegramUsername);
    if (!isAdmin) {
      await ctx.reply('');
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

    await ctx.reply(
      '📄 Отправьте текст или Excel-файл, и мы его обработаем.\n\n' +
        '📌 Также можете отправить вручную в одном из следующих форматов:\n\n' +
        '✅ Полный формат: 12345, 1, CAT\n' +
        '✅ Без бренда: 12345, 1\n' +
        '✅ Без количества: 12345, CAT\n' +
        '✅ Только артикул: 12345\n\n' +
        '🔁 Порядок: артикул, количество, бренд\n' +
        '❗️ Разделяйте значения запятой и соблюдайте порядок.',
    );
  }
}
