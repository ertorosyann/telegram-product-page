import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  BASICS,
  BRANDS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeSeltex(
  productNumber: string,
): Promise<ScrapedProduct> {
  const url = `${SOURCE_URLS.seltex}${productNumber}`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data as string);

    //‑‑‑ объект‑ответ по умолчанию
    const result: ScrapedProduct = {
      shop: SOURCE_WEBPAGE_KEYS.seltex,
      found: false,
    };

    /* 1️⃣  Берём ровно вторую строку (индекс 1) из tbody.
           Если её нет, cheerio вернёт пустой set -> length === 0  */
    const secondRow = $('.table tbody tr').eq(1);
    if (secondRow.length === 0) return result; // строки нет → found остаётся false

    /* 2️⃣  Парсим ячейки в найденной строке */
    const tds = secondRow.find('td');
    if (tds.length < 3) return result; // на всякий случай проверка

    // убираем <a> из названия
    tds.eq(1).find('a').remove();
    const nameText = tds.eq(1).text().trim().replace(/\s+/g, ' ');
    if (nameText.length === 0) return result;

    // 3️⃣  Проверяем бренд
    const matchedBrand = BRANDS.find((brand) =>
      nameText.toLowerCase().includes(brand.toLowerCase()),
    );
    if (!matchedBrand) return result;

    /* 4️⃣  Заполняем результат */
    const rawPrice = tds.eq(2).text().trim();
    const priceIsNumber = rawPrice !== '' && !isNaN(+rawPrice);

    result.name = nameText;
    result.price = priceIsNumber ? rawPrice : BASICS.empotyString; // ✔ fixed typo
    result.found = true;

    return result;
  } catch (error: unknown) {
    console.error(`${SOURCE_WEBPAGE_KEYS.seltex} Error:`, error);
    return { shop: SOURCE_WEBPAGE_KEYS.seltex, found: false };
  }
}
