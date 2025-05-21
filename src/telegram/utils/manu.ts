import { Markup } from 'telegraf';
import { UsersService } from '../authorization/users.service';

export async function getMainMenuKeyboard(
  username: string,
  usersService: UsersService,
) {
  const templateLink = process.env.YANDEX_LINK || '';
  const buttons = [
    [Markup.button.url('📥 Скачать шаблон Excel', templateLink)],
    [Markup.button.callback('📝 Запрос одной запчасти', 'single_part_request')],
    [Markup.button.callback('📂 Загрузить файл', 'document')],
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
