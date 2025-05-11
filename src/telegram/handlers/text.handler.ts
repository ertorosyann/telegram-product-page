import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';
// import { validatePartInfo } from '../utils/validator';
import { scrapeProductPriceAndAvailability } from '../utils/scraper';
import { Message } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class TextHandler {
  async handle(ctx: Context) {
    if (ctx.session.step === 'single_part_request') {
      const message = ctx.message as Message.TextMessage;
      const textMessage = message.text.trim();

      //   const validation = validatePartInfo(textMessage);
      //   if (!validation.isValid) {
      //     await ctx.reply(validation.errorMessage);
      //     return;
      //   }

      await ctx.reply('✅ Your request has been successfully processed!');
      const [catalogNumber, quantity, brand] = textMessage.split(',');

      const result = await scrapeProductPriceAndAvailability(
        catalogNumber.trim(),
        quantity.trim(),
        brand.trim(),
      );
      console.log(result);
      await ctx.reply(result);
      ctx.session.step = undefined;
    }
  }
}
