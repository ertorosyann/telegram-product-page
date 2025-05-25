import { Injectable, OnModuleInit } from '@nestjs/common';
import { StockStorage } from './stock.storage';
import { readExcelFromYandexDisk } from './readExcelFromYandexDisk';
import { ParsedRow } from 'src/telegram/exel/exel.types';

@Injectable()
export class StockService implements OnModuleInit {
  constructor(private readonly stockStorage: StockStorage) {}

  async onModuleInit() {
    await this.updateStock(); // запуск при старте
    setInterval(() => this.updateStock(), 24 * 60 * 60 * 1000); // каждые 24 часа
  }

  async updateStock() {
    try {
      const skladItems = await readExcelFromYandexDisk(
        'https://disk.yandex.ru/i/FE5LjEWujhR0Xg',
      );
      this.stockStorage.setData(skladItems);
      console.log(
        '[StockService] Склад обновлён:',
        skladItems.length,
        'позиций',
      );
    } catch (error) {
      console.error('[StockService] Ошибка обновления склада:', error.message);
    }
  }

  getStock(): ParsedRow[] {
    const data = this.stockStorage.getData();

    if (data instanceof Error) {
      throw data; // или обработай
    }

    return data;
  }
}
