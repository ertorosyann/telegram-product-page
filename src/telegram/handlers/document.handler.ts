import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';
import { Message } from 'telegraf/typings/core/types/typegram';
import { parseExcelFromTelegram, readLocalExcel } from '../exel/parse.and.read';
import { compareItems } from '../exel/comparator.exelFiles';
import { createResultExcelBuffer } from '../exel/generator.createResultExcel';
import { InputExelFile, ParsedRow } from '../exel/exel.types';

@Injectable()
export class DocumentHandler {
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

      const skladItems: ParsedRow[] = readLocalExcel(
        '/Users/picsartacademy/Desktop/sklad2.xlsx',
      );

      const { messages, rows } = await compareItems(inputItems, skladItems);

      const resultBuffer = createResultExcelBuffer(rows);

      for (const msg of messages) await ctx.reply(msg);

      await ctx.reply('Файл сформирован, отправляю…');

      await ctx.replyWithDocument({
        source: resultBuffer,
        filename: 'result.xlsx',
      });

      ctx.session.step = undefined;
    } catch (err) {
      console.error('Ошибка при обработке Excel:', err);
      await ctx.reply('❌ Не удалось обработать файл.');
    }
  }
}
