import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';

@Injectable()
export class CallbackHandler {
  async handle(ctx: Context) {
    if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
      const callbackData = ctx.callbackQuery.data;
      if (callbackData === 'SINGLE') {
        await ctx.reply(
          'Please provide the catalog number, quantity, and brand for the part.',
        );
        ctx.session.step = 'single_part_request';
      }
    }
  }
}
