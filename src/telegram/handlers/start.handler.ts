import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';

import { getMainMenuKeyboard } from '../utils/manu';

@Injectable()
export class StartHandler {
  // private readonly templateLink = process.env.YANDEX_LINK || '';

  async handle(ctx: Context) {
    const text = [
      '👋 *Добро пожаловать в бота по поиску цен на запчасти\\!*',
      '',
      'Выберите, с чего хотите начать:',
    ].join('\n');

    await ctx.reply(text, {
      parse_mode: 'MarkdownV2',
      ...getMainMenuKeyboard(),
    });
  }
}
