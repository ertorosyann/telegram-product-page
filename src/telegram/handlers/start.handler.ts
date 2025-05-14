import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';
import { Markup } from 'telegraf';

@Injectable()
export class StartHandler {
  private readonly templateLink = process.env.YANDEX_LINK || '';

  async handle(ctx: Context) {
    await ctx.reply(
      `👋 *Welcome to the Spare Parts Pricing Bot!*\n\nChoose how you'd like to begin:`,
      {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
          [Markup.button.url('📥 Download Excel Template', this.templateLink)],
          [Markup.button.callback('📝 Single Part', 'single_part_request')],
          [Markup.button.callback('📂 Upload File', 'document')],
        ]),
      },
    );
  }
}
