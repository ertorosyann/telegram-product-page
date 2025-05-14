import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
  imports: [TelegramModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
