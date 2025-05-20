import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';
import { getMainMenuKeyboard } from '../utils/manu';

import { Markup } from 'telegraf';
import { UsersService } from '../authorization/users.service';
@Injectable()
export class StartHandler {
  private readonly templateLink = process.env.YANDEX_LINK || '';
  private readonly adminId = 1055525734;

  constructor(private readonly userService: UsersService) {}
  async handle(ctx: Context) {
    const telegramId = ctx.from?.id;

    console.log(telegramId);
    if (!telegramId) {
      await ctx.reply('❌ Не удалось определить ваш Telegram ID.');
      return;
    }

    const isAdmin = telegramId === this.adminId;
    const isAllowed = await this.userService.isUserAllowed(telegramId);

    if (!isAdmin && !isAllowed) {
      await ctx.reply('❌ У вас нет доступа к этому боту.');
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

    if (isAdmin) {
      buttons.push([
        Markup.button.callback('➕ Добавить пользователя', 'add_user'),
      ]);
    }

    await ctx.reply(text, {
      parse_mode: 'MarkdownV2',
      ...getMainMenuKeyboard(),
      ...Markup.inlineKeyboard(buttons),
    });
  }
}
