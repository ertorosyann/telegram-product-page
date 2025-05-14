import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapePcaGroup(
  name: string,
  count: string,
  brand: string,
): Promise<string> {
  try {
    // Заменяем пробелы на `+`, но НЕ кодируем `+`
    const searchQuery = name.trim().replace(/\s+/g, '+');
    const searchUrl = `https://pcagroup.ru/search/?search=${searchQuery}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(response.data);

    const product = $('.card');
    console.log(product.length);

    if (!product.length || product.length !== 1) {
      return `❌ [PCA Group] Товар "${name}" не найден.`;
    }

    const title = product.find('.card__info .card__title').text().trim() || '';

    const price = product.find(' .price').text().trim() || '';

    const foundBrand =
      product.find('.card__info .card__brand').text().trim() ||
      'Бренд не указан';

    const availability =
      product.find('.card__status').text().trim() || 'Нет информации';

    if (!title && !price) {
      return `❌ [PCA Group] Товар "${name}" не найден.`;
    } else {
      return `✅  Найдено на pcagroup.ru\nНазвание: ${title}\nБренд: ${foundBrand}\nЦена: ${price}\nНаличие: ${availability}`;
    }
  } catch (error: any) {
    return `❌ Ошибка при обращении к PCA Group: ${error.message}`;
  }
}
