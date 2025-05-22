import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  BASICS,
  BRANDS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeRecamgr(name: string): Promise<ScrapedProduct> {
  const start = performance.now();

  const result: ScrapedProduct = {
    shop: SOURCE_WEBPAGE_KEYS.recamgr,
    found: false,
  };
  try {
    const searchUrl = `${SOURCE_URLS.recamgr}${encodeURIComponent(name)}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(response.data);

    const check = $('h1.section__title').text().trim();
    if (!check) return result;
    const product = $('.goods__item').first(); // Первый товар в списке

    if (!product.length) return result;

    const title = product.find(' .lnk').text().trim() || 'Без названия';
    const matchBrand = BRANDS.find((brand) =>
      title.toLowerCase().includes(brand.toLowerCase()),
    );
    if (!matchBrand) {
      return result;
    }
    result.name = title;
    const rawPrice =
      product.find('.price .new_price .price__value').text().trim() ||
      BASICS.zero;
    const price = rawPrice.replace(/\s*₽$/, '');

    result.price = price;
    result.found = true;
    console.log(performance.now() - start);

    return result;
  } catch (error: any) {
    console.error(`${SOURCE_WEBPAGE_KEYS.recamgr} Error:`, error);
    return { shop: SOURCE_WEBPAGE_KEYS.recamgr, found: false };
  }
}
