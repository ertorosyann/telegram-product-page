import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';
import { UsersService } from '../authorization/users.service';

@Injectable()
export class UserHandler {
  constructor(private readonly userService: UsersService) {} // ԱՅՍՏԵՂ ԱՎԵԼԱՑՐԵԼ
  async handle(ctx: Context) {

    const users = await this.userService.getAllUsers();

    if (!users.length) {
      await ctx.reply('ℹ️ Пока нет зарегистрированных пользователей.');
    } else {
      const message = users
        .map(
          (u, i) =>
            `${i + 1}. 🆔 ${u.telegramUsername}` +
            (u.telegramUsername ? ` | 👤 @${u.telegramUsername}` : ''),
        )

        .join('\n');

      await ctx.reply(`📋 Зарегистрированные пользователи:\n\n${message}`);
    }

    ctx.session.step = undefined;
  }
}
