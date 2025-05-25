import { Injectable } from '@nestjs/common';
import { ParsedRow } from 'src/telegram/exel/exel.types';

@Injectable()
export class StockStorage {
  private stockData: any[] = [];

  getData(): ParsedRow[] {
    return this.stockData as ParsedRow[];
  }

  setData(data: ParsedRow[]) {
    this.stockData = data;
  }
}
