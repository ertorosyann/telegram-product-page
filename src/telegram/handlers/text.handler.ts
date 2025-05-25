import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';
// import { scrapeAll } from '../scraper';
import { Message } from 'telegraf/typings/core/types/typegram';
import { getMainMenuKeyboard } from '../utils/manu';
import { normalizeInput } from '../utils/validator';
import { UsersService } from '../authorization/users.service';
import { readExcelFromYandexDisk } from '../exel/parse.and.read';
import { ParsedRow, ResultRow } from '../exel/exel.types';
import { compareItems } from '../exel/comparator.exelFiles';

@Injectable()
export class TextHandler {
  constructor(private readonly usersService: UsersService) {}

  async handle(ctx: Context) {
    if (ctx.session.step === 'single_part_request') {
      const start = performance.now();
      const message = ctx.message as Message.TextMessage;
      const textMessage = message?.text?.trim();

      if (!textMessage) {
        await ctx.reply('❌ Пожалуйста, отправьте текстовое сообщение.');
        return;
      }

      await ctx.reply(
        '🔄 Запрос принят! Ищем информацию, пожалуйста, подождите...',
      );

      const nameItem = normalizeInput(textMessage);

      try {
        /* ─────────────── изменено: now scrapeAll returns ScrapedProduct[] ─────────────── */
        // const products: ScrapedProduct[] = await scrapeAll([nameItem]);
        const skladItems: ParsedRow[] = await readExcelFromYandexDisk(
          'https://disk.yandex.ru/i/FE5LjEWujhR0Xg',
        );

        const { rows } = await compareItems(
          [
            {
              '№': '1',
              'кат.номер': nameItem.trim(),
            },
          ],
          skladItems,
        );
        /* ──────────────────────────────────────────────────────────────────────────────── */
        const msg = formatResults(rows);

        await ctx.reply(msg);
      } catch (error) {
        console.error('Ошибка при запросе цены и наличия:', error);
        await ctx.reply(
          '❌ Произошла ошибка при получении информации о товаре. Попробуйте снова позже.',
        );
      }
      ctx.session.step = undefined;
      console.log(performance.now() - start, '----verjnakan text------');
      await ctx.reply('Отправьте текст или Excel-файл, и мы его обработаем');
    } else if (ctx.session.step == 'add_user') {
      const message = ctx.message as Message.TextMessage;
      const textMessage = message?.text?.trim();

      if (!textMessage) {
        await ctx.reply('❌ Пожалуйста, введите ID пользователя.');
        return;
      }

      await this.usersService.addUser({ telegramUsername: textMessage });
      await ctx.reply('✅ Пользователь добавлен в базу данных.');
      ctx.session.step = undefined;
      await ctx.reply(
        'Пожалуйста, выберите, что вы хотите сделать:\n— ✍️ Написать сообщение пользователю\n— 📎 Отправить файл пользователю\n— 👥 Работать с несколькими пользователями',
        {
          parse_mode: 'MarkdownV2',
          ...(await getMainMenuKeyboard(
            ctx.from?.username || '',
            this.usersService,
          )),
        },
      );
      await ctx.reply('Отправьте текст или Excel-файл, и мы его обработаем');
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
      await ctx.reply(
        'Пожалуйста, выберите, что вы хотите сделать:\n— ✍️ Написать сообщение пользователю\n— 📎 Отправить файл пользователю\n— 👥 Работать с несколькими пользователями',
        {
          parse_mode: 'MarkdownV2',
          ...(await getMainMenuKeyboard(
            ctx.from?.username || '',
            this.usersService,
          )),
        },
      );
      await ctx.reply('Отправьте текст или Excel-файл, и мы его обработаем');
    }
  }
}

// util/format-result.ts
function formatResults(results: ResultRow[]): string {
  if (!results.length) {
    return '❌ Ничего не найдено.';
  }

  const row = results[0]; // обрабатываем только первую строку

  const excludeKeys = [
    'name',
    'kalichestvo',
    'luchshayaCena',
    'summa',
    'luchshiyPostavshik',
  ];

  const prices: { shop: string; price: number }[] = Object.entries(row)
    .filter(
      ([key, value]) =>
        !excludeKeys.includes(key) && typeof value === 'number' && value > 0,
    )
    .map(([shop, price]) => ({
      shop,
      price: Number(price), // Явное преобразование к числу
    }));

  if (!prices.length) {
    return '❌ Цены не найдены.';
  }

  const best = prices.reduce((min, cur) => (cur.price < min.price ? cur : min));

  return `✅ *Лучшая цена найдена!*\n\n🏬 Магазин: *${best.shop}*\n🔧 Деталь: _${row.name}_\n💰 Цена: *${best.price}*`;
}
