import { Markup } from 'telegraf';

export function getMainMenuKeyboard() {
  const templateLink = process.env.YANDEX_LINK || '';

  return Markup.inlineKeyboard([
    [Markup.button.url('📥 Скачать шаблон Excel', templateLink)],
    [Markup.button.callback('📝 Запрос одной запчасти', 'single_part_request')],
    [Markup.button.callback('📂 Загрузить файл', 'document')],
  ]);
}
