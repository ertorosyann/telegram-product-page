import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';
import { scrapeAll } from '../scraper';
import { Message } from 'telegraf/typings/core/types/typegram';

@Injectable()
export class TextHandler {
  async handle(ctx: Context) {
    if (ctx.session.step === 'single_part_request') {
      const message = ctx.message as Message.TextMessage;
      const textMessage = message?.text?.trim();
      if (!textMessage) {
        await ctx.reply('❌ Пожалуйста, отправьте текстовое сообщение.');
        return;
      }

      // const validation = validatePartInfo(textMessage);
      // if (!validation.isValid) {
      //   await ctx.reply(validation.errorMessage);
      //   return;
      // }

      await ctx.reply('✅ Your request has been successfully processed!');
      const [nameItem] = textMessage.split(',');
      if (!nameItem) {
        await ctx.reply(
          '❌ Неверный формат данных. Пожалуйста, укажите номер детали, количество и бренд через запятую.',
        );
        return;
      }

      try {
        // Отправляем запрос на получение информации с нескольких сайтов
        const result = await scrapeAll(nameItem.trim());
        console.log(result, 'texthandler');

        // Ответ с результатом
        // await ctx.reply(result);
      } catch (error) {
        console.error('Ошибка при запросе цены и наличия:', error);
        await ctx.reply(
          '❌ Произошла ошибка при получении информации о товаре. Попробуйте снова позже.',
        );
      }
      ctx.session.step = undefined;
    }
  }
}
