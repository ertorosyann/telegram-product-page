import { Markup } from 'telegraf';
import { UsersService } from '../authorization/users.service';

export async function getMainMenuKeyboard(
  username: string,
  usersService: UsersService,
) {
  const buttons: any[][] = [
    [
      Markup.button.callback(
        '📥 Скачать шаблон Excel',
        'template_excel_download',
      ),
    ],
  ];
  const isAdmin = await usersService.isAdmin(username || '');

  if (isAdmin) {
    buttons.push(
      [Markup.button.callback('➕ Добавить пользователя', 'add_user')],
      [Markup.button.callback('👁️ Видеть пользователя', 'all_users')],
      [Markup.button.callback('❌ Удалить пользователя', 'delete_user')],
    );
  }
  return Markup.inlineKeyboard(buttons);
}
