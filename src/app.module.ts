import { Module } from '@nestjs/common';
import { TelegramModule } from './telegram/telegram.module';
import * as dotenv from 'dotenv';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './telegram/authorization/schema/schema';

dotenv.config();

@Module({
  imports: [
    // 'mongodb+srv://eriktoros:210621Er$@bot.jrpaust.mongodb.net/?retryWrites=true&w=majority&appName=bot',
    MongooseModule.forRoot('mongodb://localhost:27017/telegram-auth'),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    TelegramModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
