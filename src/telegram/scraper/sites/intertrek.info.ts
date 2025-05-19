import axios from 'axios';
import * as cheerio from 'cheerio';
import { BRANDS, SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function intertrek(productCode: string): Promise<ScrapedProduct> {
  const searchUrl = `http://intertrek.info/search?search=${productCode}`;

  /* базовый шаблон результата */
  const result: ScrapedProduct = {
    shop: SOURCE_WEBPAGE_KEYS.intertrek,
    found: false,
  };

  try {
    /* --- поиск --- */
    const { data: searchHtml } = await axios.get<string>(searchUrl);
    const $ = cheerio.load(searchHtml);

    const firstProductAnchor = $(
      'tr[itemprop="itemListElement"] a[itemprop="item"]',
    ).first();
    if (!firstProductAnchor.length) return result;

    const relativeLink = firstProductAnchor.attr('href');
    if (!relativeLink) return result;

    /* --- карточка товара --- */
    const productUrl = `http://intertrek.info${relativeLink}`;
    const { data: productHtml } = await axios.get<string>(productUrl);
    const $$ = cheerio.load(productHtml);

    const productName = $$('.dl-horizontal dd').eq(1).text().trim();
    const rawPrice = $$('td[style*="white-space:nowrap"] p')
      .first()
      .text()
      .trim();

    /* --- проверяем бренд --- */
    const matchedBrand = BRANDS.find((b) =>
      productName.toLowerCase().includes(b.toLowerCase()),
    );
    if (!productName || !rawPrice || !matchedBrand) return result;

    /* --- нормализуем цену (убираем пробелы, «руб.», запятую → точка) --- */
    const priceNumber = parseFloat(
      rawPrice.replace(/\s|руб\.?/gi, '').replace(',', '.'),
    );

    return {
      shop: SOURCE_WEBPAGE_KEYS.zipteh,
      found: true,
      name: productName,
      price: priceNumber,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown error occurred.';
    console.error(`❗ [ZiptehOnline] Error: ${message}`);
    return result; // found: false
  }
}
