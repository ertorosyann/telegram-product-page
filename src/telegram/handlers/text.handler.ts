import { Injectable } from '@nestjs/common';
import { Context, ScrapedProduct } from 'src/types/context.interface';
import { scrapeAll } from '../scraper';
import { Message } from 'telegraf/typings/core/types/typegram';
import { getMainMenuKeyboard } from '../utils/manu';
import { normalizeInput } from '../utils/validator';
import { UsersService } from '../authorization/users.service';

@Injectable()
export class TextHandler {
  constructor(private readonly usersService: UsersService) {} // ԱՅՍՏԵՂ ԱՎԵԼԱՑՐԵԼ

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

      await ctx.reply(
        '🔄 Запрос принят! Ищем информацию, пожалуйста, подождите...',
      );
      let [nameItem] = textMessage.split(',');
      if (!nameItem) {
        await ctx.reply(
          '❌ Неверный формат данных. Пожалуйста, укажите номер детали, количество и бренд через запятую.',
        );
        return;
      }

      nameItem = normalizeInput(nameItem);

      try {
        /* ─────────────── изменено: now scrapeAll returns ScrapedProduct[] ─────────────── */
        const products: ScrapedProduct[] = await scrapeAll(nameItem.trim());

        /* ──────────────────────────────────────────────────────────────────────────────── */

        const msg = formatResults(products);

        await ctx.reply(msg);
      } catch (error) {
        console.error('Ошибка при запросе цены и наличия:', error);
        await ctx.reply(
          '❌ Произошла ошибка при получении информации о товаре. Попробуйте снова позже.',
        );
      }

      ctx.session.step = undefined;
      await ctx.reply('👇 Выберите, что хотите сделать дальше:', {
        parse_mode: 'MarkdownV2',
        ...getMainMenuKeyboard(),
      });
    } else if (ctx.session.step === 'add_user') {
      //when admin type username after click add user this function caled
      const message = ctx.message as Message.TextMessage;

      const textMessage = message?.text?.trim();

      if (!textMessage) {
        await ctx.reply('❌ Пожалуйста, введите ID пользователя.');
        return;
      }

      await this.usersService.addUser({ telegramUsername: textMessage });
      await ctx.reply('✅ Пользователь добавлен в базу данных.');
      ctx.session.step = undefined;
    } else if (ctx.session.step === 'delete_user') {
      const message = ctx.message as Message.TextMessage;

      const textMessage = message?.text?.trim();

      if (!textMessage) {
        await ctx.reply('❌ Пожалуйста, введите ID пользователя.');
        return;
      }
      const resultOfDelate = await this.usersService.deleteUser({
        telegramUsername: textMessage,
      });
      await ctx.reply(resultOfDelate);
      ctx.session.step = undefined;
    }
  }
}

// util/format-result.ts
function formatResults(results: ScrapedProduct[]): string {
  if (!results.length) {
    return '❌ Ничего не найдено.';
  }

  const validResults = results
    .filter((result) => result.found && result.price)
    .sort((a, b) => a.price - b.price);

  if (!validResults.length) {
    return '❌ Ничего не найдено.';
  }

  const best = validResults[0];

  return `✅ *Лучшая цена найдена!*\n\n🏬 Магазин: *${best.shop}*\n🔧 Деталь: _${best.name}_\n💰 Цена: *${best.price}*`;
}
