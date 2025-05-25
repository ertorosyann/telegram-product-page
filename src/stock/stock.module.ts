import { Module } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockStorage } from './stock.storage';

@Module({
  providers: [StockService, StockStorage],
  exports: [StockService, StockStorage],
})
export class StockModule {}
