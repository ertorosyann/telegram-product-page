import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';
import { Message } from 'telegraf/typings/core/types/typegram';
import { parseExcelFromTelegram, readLocalExcel } from '../exel/parse.and.read';
import { compareItems } from '../exel/comparator.exelFiles';
import { appendToResultExcel } from '../exel/generator.createResultExcel';
import { InputExelFile, ParsedRow } from '../exel/exel.types';

@Injectable()
export class DocumentHandler {
  async handle(ctx: Context) {
    if (ctx.session.step !== 'document') return;

    const message = ctx.message;
    if (!message || !('document' in message)) {
      await ctx.reply('❌ Пожалуйста, отправьте Excel-файл.');
      return;
    }

    const documentMessage = message as Message.DocumentMessage;
    const { document } = documentMessage;
    const fileName = document.file_name;

    if (
      !fileName ||
      (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls'))
    ) {
      await ctx.reply(
        '❌ Загрузите Excel файл с расширением `.xlsx` или `.xls`',
      );
      return;
    }

    try {
      await ctx.reply('🔍 Идёт проверка по складу...');

      const inputItems: InputExelFile[] = await parseExcelFromTelegram(
        document.file_id,
        ctx.telegram,
      );
      console.log(inputItems);

      const skladItems: ParsedRow[] = readLocalExcel(
        '/Users/picsartacademy/Desktop/sklad2.xlsx',
      );

      const { messages, rows } = compareItems(inputItems, skladItems);
      // in this place

      const resultFilePath = '/Users/picsartacademy/Desktop/result.xlsx';
      appendToResultExcel(resultFilePath, rows);

      for (const msg of messages) {
        await ctx.reply(msg);
      }

      await ctx.reply('Файл сформирован, сейчас отправлю...');
      await ctx.replyWithDocument({ source: resultFilePath });
      ctx.session.step = undefined;
    } catch (err) {
      console.error('Ошибка при обработке Excel:', err);
      await ctx.reply('❌ Не удалось обработать файл.');
    }
  }
}
