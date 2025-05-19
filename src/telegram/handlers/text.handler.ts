import { Injectable } from '@nestjs/common';
import { Context, ScrapedProduct } from 'src/types/context.interface';
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
        /* ─────────────── изменено: now scrapeAll returns ScrapedProduct[] ─────────────── */
        const products: ScrapedProduct[] = await scrapeAll(nameItem.trim());
        /* ──────────────────────────────────────────────────────────────────────────────── */

        // Берём только успешно выполненные
        // const fulfilledProducts: ScrapedProduct[] = settled
        //   .filter(
        //     (r): r is PromiseFulfilledResult<ScrapedProduct> =>
        //       r.status === 'fulfilled',
        //   )
        //   .map((r) => r.value);

        // Можно также залогировать ошибки:
        // settled
        //   .filter((r) => r.status === 'rejected')
        //   .forEach((r) => console.warn('🛑 Scraper error:', r.reason));

        /* ─────────────── используем products напрямую ─────────────── */
        const msg = formatResults(products);
        /* ───────────────────────────────────────────────────────────── */

        await ctx.reply(msg || '❌ Ничего не найдено.', {
          parse_mode: 'Markdown',
        });
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

// util/format-result.ts
export function formatResults(results: ScrapedProduct[]): string {
  if (!results.length) {
    return '❌ Ничего не найдено.';
  }

  return results
    .map((r) => {
      // console.log(r);

      const status = r.found ? '✅ Найдено' : '❌ Не найдено';
      const priceLine = r.found ? `💰 Цена: *${r.price}₽*` : '';
      return [
        `🏬 Магазин: *${r.shop}*`,
        `🔧 Деталь: _${r.name}_`,
        status,
        priceLine,
      ]
        .filter(Boolean) // убираем пустые строки, если found = false
        .join('\n');
    })
    .join('\n\n'); // пустая строка между позициями
}
