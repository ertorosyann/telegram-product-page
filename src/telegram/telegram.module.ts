import { Module } from '@nestjs/common';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';
import { TelegramService } from './telegram.service';
import { HttpModule } from '@nestjs/axios';
import { StartHandler } from './handlers/start.handler';
import { TextHandler } from './handlers/text.handler';
import { HelpHandler } from './handlers/help.handler';
import { DocumentHandler } from './handlers/document.handler';
import { UsersService } from './authorization/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './authorization/schema/schema';
import { UserHandler } from './handlers/user.handleer';
import { StockModule } from 'src/stock/stock.module';

@Module({
  imports: [
    StockModule,
    TelegrafModule.forRootAsync({
      useFactory: () => ({
        token: '7630393603:AAHVgFXYaTVFdO462YdeOaQInRzBTfmAEVg',
        middlewares: [session()],
      }),
    }),
    HttpModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), // ✅
  ],
  providers: [
    StockModule,
    TelegramService,
    StartHandler,
    HelpHandler,
    TextHandler,
    DocumentHandler,
    UserHandler,
    UsersService,
  ],
})
export class TelegramModule {}
