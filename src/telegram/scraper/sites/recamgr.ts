import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  BASICS,
  BRANDS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeRecamgr(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const results: ScrapedProduct[] = [];

  for (const name of productNumbers) {
    const start = performance.now();

    const result: ScrapedProduct = {
      shop: SOURCE_WEBPAGE_KEYS.recamgr,
      found: false,
      name, // Որ անունը հետադարձվի, հարմար կլինի հետք ունենալ
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
      if (!check) {
        results.push(result);
        continue;
      }

      const product = $('.goods__item').first();
      if (!product.length) {
        results.push(result);
        continue;
      }

      const title = product.find(' .lnk').text().trim() || 'Без названия';
      const matchBrand = BRANDS.find((brand) =>
        title.toLowerCase().includes(brand.toLowerCase()),
      );

      if (!matchBrand) {
        results.push(result);
        continue;
      }

      const rawPrice =
        product.find('.price .new_price .price__value').text().trim() ||
        BASICS.zero;
      const price = rawPrice.replace(/\s*₽$/, '');

      results.push({
        shop: SOURCE_WEBPAGE_KEYS.recamgr,
        found: true,
        name: title,
        price: price,
      });
    } catch (error: any) {
      console.error(
        `${SOURCE_WEBPAGE_KEYS.recamgr} Error for "${name}":`,
        error,
      );
      results.push(result);
    } finally {
      console.log(results);

      console.log(
        `Search time for "${productNumbers[0]} in Recmagr":`,
        performance.now() - start,
      );
    }
  }

  return results;
}
