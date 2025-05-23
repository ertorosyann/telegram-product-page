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
import { UserHandler } from './handlers/user.handleer';
import { getMainMenuKeyboard } from './utils/manu';

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
    private readonly userHandler: UserHandler,

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

  @On('message')
  async onMessage(@Ctx() ctx: Context) {
    const message = ctx.message;

    if (!message) {
      await ctx.reply('⚠️ Не удалось прочитать сообщение.');
      return;
    }
    if (ctx.session.step === 'add_user' || ctx.session.step === 'delete_user') {
      await ctx.sendChatAction('typing');
      await ctx.reply('⌛ Пожалуйста, подождите, идет обработка...');
      await this.textHandler.handle(ctx);
      return;
    }

    if ('document' in message) {
      ctx.session.step = 'document';
      await ctx.reply(
        '📂 Вы отправили файл. Пожалуйста, подождите, идет обработка...',
      );
      await this.documentHandler.handle(ctx);
    } else if ('text' in message) {
      ctx.session.step = 'single_part_request';
      await ctx.reply(
        '✉️ Вы отправили текст. Пожалуйста, подождите, идет обработка...',
      );
      await this.textHandler.handle(ctx);
    } else {
      await ctx.reply('⚠️ Неподдерживаемый тип сообщения.');
    }
  }

  @Action('add_user')
  async onAddUser(@Ctx() ctx: Context) {
    ctx.session.step = 'add_user';
    await ctx.answerCbQuery();
    await ctx.reply('Пожалуйста, введите Username(James123) пользователя.');
  }
  @Action('delete_user')
  async onDeleteUser(@Ctx() ctx: Context) {
    ctx.session.step = 'delete_user';
    await ctx.answerCbQuery();
    await ctx.reply('Пожалуйста, введите Username(James123)  пользователя.');
  }

  @Action('all_users')
  async onAllUsers(@Ctx() ctx: Context) {
    await this.userHandler.handle(ctx);
    await ctx.reply(
      'Пожалуйста, выберите, что вы хотите сделать:\n— ✍️ Написать сообщение пользователю\n— 📎 Отправить файл пользователю\n— 👥 Работать с несколькими пользователями',
      {
        parse_mode: 'MarkdownV2',
        ...(await getMainMenuKeyboard(
          ctx.from?.username || '',
          this.usersService,
        )),
      },
    );
  }
}
