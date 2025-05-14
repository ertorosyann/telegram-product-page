import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';
import axios from 'axios';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import { Message } from 'telegraf/typings/core/types/typegram';

interface ExcelRow {
  'part name'?: string;
  qty: string;
}

interface skladItem {
  'p/n': string;
  'part name': string;
  qty: string;
  'price, RUB': string;
  'sum, RUB': string;
}

@Injectable()
export class DocumentHandler {
  private readLocalFile(filePath: string): skladItem[] {
    const localFile = fs.readFileSync(filePath);
    const workbook = XLSX.read(localFile, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<skladItem>(worksheet);
  }

  async handle(ctx: Context) {
    if (ctx.session.step === 'document') {
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
          '❌ Пожалуйста, загрузите Excel файл с расширением `.xlsx` или `.xls`',
        );
        return;
      }

      try {
        const processingMessage = await ctx.reply(
          '🔍 Идёт поиск по складу... Пожалуйста, подождите.',
        );
        const fileLink = await ctx.telegram.getFileLink(document.file_id);
        const response = await axios.get<ArrayBuffer>(fileLink.href, {
          responseType: 'arraybuffer',
        });

        const fileBuffer = Buffer.from(response.data);
        const workbookUser = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetNameUser = workbookUser.SheetNames[0];
        const worksheetUser = workbookUser.Sheets[sheetNameUser];

        const inputFile = XLSX.utils.sheet_to_json<ExcelRow>(worksheetUser);

        const localFilePath = '/Users/picsartacademy/Desktop/sklad.xlsx'; // Путь к локальному файлу
        const sklad = this.readLocalFile(localFilePath); // Чтение данных локального склада
        const itemsNotFoundInSklad: ExcelRow[] = [];

        // Функция для сравнения товаров и их количеств
        const compareItems = (inputFile: ExcelRow[], sklad: skladItem[]) => {
          const result: string[] = [];

          // Проходим по каждому товару из файла пользователя
          inputFile.forEach((inputItem) => {
            if (!inputItem['part name'] || !inputItem.qty) return;

            const itemFound = sklad.find(
              (skladItem) => skladItem['part name'] === inputItem['part name'],
            );

            if (itemFound) {
              if (itemFound.qty >= inputItem.qty) {
                // Если на складе достаточно товара
                result.push(
                  `Товар  ${inputItem['part name']} найден! Доступное количество: ${inputItem.qty} шт.  ✅`,
                );
              } else {
                // Если на складе меньше товара, чем требуется
                result.push(
                  `Товара  ${inputItem['part name']} недостаточно! Требуется: ${inputItem.qty} шт., но на складе только ${itemFound.qty} шт. ➖`,
                );
                itemsNotFoundInSklad.push(inputItem);
              }
            } else {
              // Если товар не найден
              result.push(
                `Товар  ${inputItem['part name']} не найден на складе. ❌`,
              );
              itemsNotFoundInSklad.push(inputItem);
            }
          });

          return result;
        };
        // Уведомляем пользователя, что идёт поиск

        // Сравниваем данные пользователя с локальным складом
        const comparisonResult = compareItems(inputFile, sklad);

        const finalMessage = comparisonResult.length
          ? comparisonResult.join('\n')
          : '⚠️ Не удалось найти ни одного совпадения. Убедитесь, что данные корректны.';

        // Обновляем сообщение с результатами
        const chatId = 'chat' in message ? message.chat.id : undefined;
        if (chatId) {
          await ctx.telegram.editMessageText(
            chatId,
            processingMessage.message_id,
            undefined,
            finalMessage,
          );
        } else {
          // fallback, если chatId не удалось получить
          await ctx.reply(finalMessage);
        }
        console.log(itemsNotFoundInSklad);

        ctx.session.step = undefined; // сброс шага после успешной загрузки
        return;
      } catch (err) {
        console.error('Ошибка при обработке Excel файла:', err);
        await ctx.reply(
          '❌ Не удалось обработать файл. Убедитесь, что он доступен и корректен.',
        );
      }
    }
  }
}
