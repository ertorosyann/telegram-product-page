import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';
import { getMainMenuKeyboard } from '../utils/manu';

import { Markup } from 'telegraf';
import { UsersService } from '../authorization/users.service';
@Injectable()
export class StartHandler {
  private readonly templateLink = process.env.YANDEX_LINK || '';
  private readonly adminUsername = 'Romiksar';

  constructor(private readonly userService: UsersService) {}
  async handle(ctx: Context) {
    const telegramUsername = ctx.from?.username;
    if (!telegramUsername) {
      await ctx.reply('❌ Не удалось определить ваш Telegram username.');
      return;
    }
    const text = [
      '👋 *Добро пожаловать в бота по поиску цен на запчасти\\!*',
      '',
      'Выберите, с чего хотите начать:',
    ].join('\n');

    const buttons = [
      [Markup.button.url('📥 Скачать шаблон Excel', this.templateLink)],
      [
        Markup.button.callback(
          '📝 Запрос одной запчасти',
          'single_part_request',
        ),
      ],
      [Markup.button.callback('📂 Загрузить файл', 'document')],
    ];
    const isAdmin = await this.userService.isAdmin(ctx.from?.username || '');
    if (isAdmin) {
      buttons.push([
        Markup.button.callback('➕ Добавить пользователя', 'add_user'),
        Markup.button.callback('➕ Видеть пользователя', 'all_users'),
        Markup.button.callback('➕ Удалить пользователя', 'delete_user'),
      ]);
    } else {
      const isAllowed = await this.userService.isUserAllowed(telegramUsername);

      if (!isAllowed) {
        await ctx.reply('❌ У вас нет доступа к этому боту.');
        return;
      }
    }

    await ctx.reply(text, {
      parse_mode: 'MarkdownV2',
      ...getMainMenuKeyboard(),
      ...Markup.inlineKeyboard(buttons),
    });
  }
}
