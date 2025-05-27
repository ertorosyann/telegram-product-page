import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';
import { Message } from 'telegraf/typings/core/types/typegram';
import { parseExcelFromTelegram } from '../exel/parse.and.read';
import { compareItems } from '../exel/comparator.exelFiles';
import { createResultExcelBuffer } from '../exel/generator.createResultExcel';
import { InputExelFile, ParsedRow } from '../exel/exel.types';
import { getMainMenuKeyboard } from '../utils/manu';
import { UsersService } from '../authorization/users.service';
import { StockService } from 'src/stock/stock.service';

@Injectable()
export class DocumentHandler {
  // stockService: ParsedRow[];
  constructor(
    private readonly userService: UsersService,
    private readonly stockService: StockService,
  ) {}

  async handle(ctx: Context) {
    const message = ctx.message;
    if (!message || !('document' in message)) {
      return ctx.reply('❌ Пожалуйста, отправьте Excel‑файл.');
    }

    const { document } = message as Message.DocumentMessage;
    const fileName = document.file_name ?? '';

    if (!/\.xlsx?$/.test(fileName)) {
      return ctx.reply('❌ Загрузите файл с расширением `.xlsx` или `.xls`');
    }

    try {
      await ctx.reply('🔍 Идёт проверка по складу...');

      const inputItems: InputExelFile[] = await parseExcelFromTelegram(
        document.file_id,
        ctx.telegram,
      );

      if (!inputItems.length) {
        return ctx.reply('Ваш файл Excel пустой.');
      }

      const skladItems: ParsedRow[] = this.stockService.getStock();

      console.log(
        skladItems.length > 0 ? 'sklad is done !' : 'sklad dont loaded',
      );

      await ctx.reply(
        '🌐 Идёт поиск по сайтам поставщиков. Пожалуйста, подождите...',
      );

      const start = performance.now();
      const { messages, rows } = await compareItems(inputItems, skladItems);

      const durationSec = ((performance.now() - start) / 1000).toFixed(2);
      const resultBuffer = createResultExcelBuffer(rows);
      await ctx.reply(`⏱ Операция заняла ${durationSec} секунд.`);

      // for (const msg of messages) await ctx.reply(msg);

      await ctx.replyWithDocument({
        source: resultBuffer,
        filename: 'result.xlsx',
      });

      ctx.session.step = undefined;
      const x = await getMainMenuKeyboard(
        ctx.from?.username || '',
        this.userService,
      );
      // x);

      await ctx.reply('👇 Выберите, что хотите сделать дальше:', {
        parse_mode: 'MarkdownV2',
        ...x,
      });
    } catch (err) {
      console.error('Ошибка при обработке Excel:', err);
      await ctx.reply('❌ Не удалось обработать файл.');
    }
  }
}
