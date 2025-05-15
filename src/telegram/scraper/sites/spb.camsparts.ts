import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeCamsParts(
  name: string,
  count: string,
  brand: string,
): Promise<string> {
  try {
    const searchQuery = name.trim().replace(/\s+/g, '+');
    const searchUrl = `https://spb.camsparts.ru/katalog-cummins/?search=${searchQuery}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(response.data);

    const product = $('.product_wrap').first(); // зависит от структуры

    if (!product.length) {
      return `❌ [CamsParts] Товар "${name}" не найден.`;
    }

    const title =
      product.find('.product .product__info .product__title').text().trim() ||
      'Без названия';
    const price =
      product
        .find('.product .product__info .price .price__new ')
        .text()
        .trim() || 'Цена не указана';
    const availability =
      product.find('.product .product__info .quantity').text().trim() ||
      'Нет данных';

    return `✅ Найдено на spb.camsparts.ru\nНазвание: ${title}\nБренд: ${brand}\nЦена: ${price}\nНаличие: ${availability}`;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return `❌ Ошибка при обращении к CamsParts: ${error.message}`;
    }
    return `❌ Неизвестная ошибка при обращении к CamsParts`;
  }
}
