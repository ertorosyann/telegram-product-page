import { Injectable } from '@nestjs/common';
import {
  InjectBot,
  Start,
  Help,
  On,
  Ctx,
  Update,
  Action,
} from 'nestjs-telegraf';
import { Telegraf } from 'telegraf';
import { Context } from 'src/types/context.interface';
import { StartHandler } from './handlers/start.handler';
import { TextHandler } from './handlers/text.handler';
import { HelpHandler } from './handlers/help.handler';
import { YandexDiskService } from '../yandex/yandex-disk.service';
import { HttpService } from '@nestjs/axios';
import { DocumentHandler } from './handlers/document.handler';
import { UsersService } from './authorization/users.service';

@Injectable()
@Update()
export class TelegramService {
  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly yandexDiskService: YandexDiskService,
    private readonly httpService: HttpService,
    private readonly startHandler: StartHandler,
    private readonly textHandler: TextHandler,
    private readonly helpHandler: HelpHandler,
    private readonly documentHandler: DocumentHandler,
    private readonly usersService: UsersService, // ✅ inject it
  ) {}

  @Start()
  async onStart(@Ctx() ctx: Context) {
    await this.startHandler.handle(ctx);
  }

  @Help()
  async onHelp(@Ctx() ctx: Context) {
    await this.helpHandler.handle(ctx);
  }

  @On('document')
  async onDocument(@Ctx() ctx: Context) {
    if (ctx.session.step === 'document') {
      await this.documentHandler.handle(ctx);
    } else {
      await ctx.reply(
        '❗ Пожалуйста, сначала выберите "📂 Загрузить файл" в меню ниже.',
      );
      await this.startHandler.handle(ctx); // повторно показываем меню
    }
  }

  @On('text')
  async onText(@Ctx() ctx: Context) {
    if (
      ctx.session.step === 'single_part_request' ||
      ctx.session.step === 'add_user'
    ) {
      await this.textHandler.handle(ctx); // обрабатываем ввод
    } else {
      await ctx.reply(
        '❗ Пожалуйста, сначала выберите "📝 Запрос одной запчасти" в меню ниже.',
      );
      await this.startHandler.handle(ctx); // повторно показываем меню
    }
  }

  // Обработчик для кнопки '📝 Single Part'
  @Action('single_part_request')
  async onSingle(@Ctx() ctx: Context) {
    ctx.session.step = 'single_part_request'; // Устанавливаем текущий шаг сессии
    await ctx.answerCbQuery(); // Убираем "loading" у кнопки
    await ctx.reply('Введите номер детали для поиска:');
  }
  @Action('add_user')
  async addUser(@Ctx() ctx: Context) {
    ctx.session.step = 'add_user';
    await ctx.answerCbQuery();
    await ctx.reply('Пожалуйста, введите ID пользователя.');
  }

  // Обработчик для кнопки '📂 Upload File'
  @Action('document')
  async onFile(@Ctx() ctx: Context) {
    ctx.session.step = 'document'; // Устанавливаем шаг сессии для загрузки файла
    await ctx.answerCbQuery(); // Убираем "loading" у кнопки
    await ctx.reply('Пожалуйста, отправьте Excel файл.');
  }
}
