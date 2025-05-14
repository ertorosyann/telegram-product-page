import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeRecamgr(
  name: string,
  count: string,
  brand: string,
): Promise<string> {
  try {
    const searchUrl = `https://recamgr.ru/products/?search=${encodeURIComponent(name)}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(response.data);

    const product = $('.goods__item').first(); // Первый товар в списке

    if (!product.length) {
      return `❌ [Recamgr] Товар "${name}" не найден.`;
    }

    const title = product.find(' .lnk').text().trim() || 'Без названия';

    const price =
      product.find('.price .new_price .price__value').text().trim() ||
      'Цена не указана';

    const availability =
      product.find('.product-list__stock').text().trim() || 'Нет информации';

    const foundBrand =
      product.find('.product-list__brand').text().trim() || 'Бренд не указан';

    // Фильтрация по бренду (если передан)
    // if (brand && !foundBrand.toLowerCase().includes(brand.toLowerCase())) {
    //   return `⚠️ Найден товар, но бренд "${foundBrand}" не соответствует запрошенному "${brand}".`;
    // }

    return `🔍 Найдено на Recamgr\nНазвание: ${title}\nБренд: ${foundBrand}\nЦена: ${price}\nНаличие: ${availability}`;
  } catch (error: any) {
    return `❌ Ошибка при обращении к Recamgr: ${error.message}`;
  }
}
