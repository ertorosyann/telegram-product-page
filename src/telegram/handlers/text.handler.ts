import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';
// import { scrapeAll } from '../scraper';
import { Message } from 'telegraf/typings/core/types/typegram';
import { getMainMenuKeyboard } from '../utils/manu';
import { UsersService } from '../authorization/users.service';
import { StockService } from 'src/stock/stock.service';
// import { ResultRow } from '../exel/exel.types';
// import { compareItems } from '../exel/comparator.exelFiles';
import { normalizeInput } from '../utils/validator';
import {
  compareItemTextHandler,
  InputText,
} from '../textMsg/comparator.textMsg';

@Injectable()
export class TextHandler {
  constructor(
    private readonly usersService: UsersService,
    private readonly stockService: StockService,
  ) {}

  async handle(ctx: Context) {
    if (ctx.session.step === 'single_part_request') {
      const start = performance.now();
      const message = ctx.message as Message.TextMessage;
      const textMessage = message?.text?.trim();

      if (!textMessage) {
        await ctx.reply('❌ Пожалуйста, отправьте текстовое сообщение.');
        return;
      }

      console.log('text =', textMessage); // Пример: 1979322 , 1, CAT

      const parts = textMessage.split(',').map((part) => part.trim());

      let artikul = '';
      let qtyStr = '1'; // по умолчанию 1
      let brand = '';

      if (parts.length === 3) {
        [artikul, qtyStr, brand] = parts;
        // const num = Number(qtyStr);
        // if (!isNaN(num) && isFinite(num) && num > 0) {
        //   await ctx.reply('❌ Неверный формат. Пример: 1979322, 1, CAT');
        // }
      } else if (parts.length === 2) {
        let second: string;
        [artikul, second] = parts;
        if (!isNaN(Number(second))) {
          qtyStr = second;
        } else {
          brand = second;
        }
      } else if (parts.length === 1) {
        artikul = parts[0];
      } else {
        await ctx.reply('❌ Неверный формат. Пример: 1979322, 1, CAT');
        return;
      }

      const qty = Number(qtyStr);

      if (!artikul || isNaN(qty) || qty < 1) {
        await ctx.reply('❌ Неверные данные. Пример: 1979322, 1, CAT');
        return;
      }

      await ctx.reply(
        '🔄 Запрос принят! Ищем информацию, пожалуйста, подождите...',
      );

      const nameItem = normalizeInput(artikul);
      console.log(nameItem, qty, brand, ' = userna poisk twe');

      const checkItem: InputText = { name: nameItem, qty, brand };

      try {
        /* ─────────────── изменено: now scrapeAll returns ScrapedProduct[] ─────────────── */

        const skladItems = this.stockService.getStock();
        console.log(
          skladItems.length > 0 ? 'sklad is done !' : 'sklad dont loaded',
        );

        // const { rows } = await compareItems(
        //   [
        //     {
        //       '№': '1',
        //       'кат.номер': nameItem.trim(),
        //     },
        //   ],
        //   skladItems,
        // );

        const { messages } = await compareItemTextHandler(
          checkItem,
          skladItems,
        );
        console.log(message, '+++!!!!');

        /* ──────────────────────────────────────────────────────────────────────────────── */
        // const msg = formatResults(rows);

        await ctx.reply(messages);
        const durationSec = ((performance.now() - start) / 1000).toFixed(2);
        await ctx.reply(`⏱ Операция заняла ${durationSec} секунд.`);
      } catch (error) {
        console.error('Ошибка при запросе цены и наличия:', error);
        await ctx.reply(
          '❌ Произошла ошибка при получении информации о товаре. Попробуйте снова позже.',
        );
      }
      ctx.session.step = undefined;
      console.log(performance.now() - start, '----verjnakan text------');
      await ctx.reply(
        '📄 Отправьте текст или Excel-файл, и мы его обработаем.\n\n' +
          '📌 Также можете отправить вручную в одном из следующих форматов:\n\n' +
          '✅ Полный формат: 12345, 1, CAT\n' +
          '✅ Без бренда: 12345, 1\n' +
          '✅ Без количества: 12345, CAT\n' +
          '✅ Только артикул: 12345\n\n' +
          '🔁 Порядок: артикул, количество, бренд\n' +
          '❗️ Разделяйте значения запятой и соблюдайте порядок.',
      );
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
      await ctx.reply(
        '📄 Отправьте текст или Excel-файл, и мы его обработаем.\n\n' +
          '📌 Также можете отправить вручную в одном из следующих форматов:\n\n' +
          '✅ Полный формат: 12345, 1, CAT\n' +
          '✅ Без бренда: 12345, 1\n' +
          '✅ Без количества: 12345, CAT\n' +
          '✅ Только артикул: 12345\n\n' +
          '🔁 Порядок: артикул, количество, бренд\n' +
          '❗️ Разделяйте значения запятой и соблюдайте порядок.',
      );
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
      await ctx.reply(
        '📄 Отправьте текст или Excel-файл, и мы его обработаем.\n\n' +
          '📌 Также можете отправить вручную в одном из следующих форматов:\n\n' +
          '✅ Полный формат: 12345, 1, CAT\n' +
          '✅ Без бренда: 12345, 1\n' +
          '✅ Без количества: 12345, CAT\n' +
          '✅ Только артикул: 12345\n\n' +
          '🔁 Порядок: артикул, количество, бренд\n' +
          '❗️ Разделяйте значения запятой и соблюдайте порядок.',
      );
    }
  }
}

// util/format-result.ts
// function formatResults(results: ResultRow[]): string {
//   if (!results.length) {
//     return '❌ Ничего не найдено.';
//   }

//   const row = results[0]; // обрабатываем только первую строку

//   const excludeKeys = [
//     'name',
//     'kalichestvo',
//     'luchshayaCena',
//     'summa',
//     'luchshiyPostavshik',
//   ];

//   const prices: { shop: string; price: number }[] = Object.entries(row)
//     .filter(
//       ([key, value]) =>
//         !excludeKeys.includes(key) && typeof value === 'number' && value > 0,
//     )
//     .map(([shop, price]) => ({
//       shop,
//       price: Number(price), // Явное преобразование к числу
//     }));

//   if (!prices.length) {
//     return '❌ Цены не найдены.';
//   }

//   const best = prices.reduce((min, cur) => (cur.price < min.price ? cur : min));

//   return `✅ *Лучшая цена найдена!*\n\n🏬 Магазин: *${best.shop}*\n🔧 Деталь: _${row.name}_\n💰 Цена: *${best.price}*`;
// }
