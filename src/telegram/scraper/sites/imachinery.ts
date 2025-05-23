import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  BASICS,
  BRANDS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeIMachinery(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const start = performance.now();
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  };

  const tasks = productNumbers.map(async (productNumber) => {
    const url = `${SOURCE_URLS.imachinery}${encodeURIComponent(productNumber)}`;
    try {
      const response = await axios.get(url, { headers });
      const $ = cheerio.load(response.data as string);

      const result: ScrapedProduct = {
        shop: SOURCE_WEBPAGE_KEYS.imachinery,
        found: false,
      };

      $('.result-item li').each((_, el) => {
        const name = $(el).find('b').first().text().trim();
        const priceText = $(el).find('b.pric').text().trim();
        const price = priceText.replace(/^Цена:\s*/i, '').replace(/\D/g, '');

        const matchedBrand = BRANDS.find((brand) =>
          name.toLowerCase().includes(brand.toLowerCase()),
        );

        if (matchedBrand) {
          result.name = name;
          result.price =
            price.trim() !== '' && !isNaN(+price) ? price : BASICS.zero;
          result.found = true;
          return false; // break .each
        }
      });

      return result;
    } catch (error: unknown) {
      console.error(`${SOURCE_WEBPAGE_KEYS.imachinery} Error:`, error);
      return { shop: SOURCE_WEBPAGE_KEYS.imachinery, found: false };
    }
  });

  const settledResults = await Promise.allSettled(tasks);

  const res = settledResults.map((res) => {
    if (res.status === 'fulfilled') {
      return res.value;
    } else {
      return { shop: SOURCE_WEBPAGE_KEYS.imachinery, found: false };
    }
  });
  console.log(res);

  console.log(
    `Search time for "${productNumbers[0]} in imachinery":`,
    performance.now() - start,
  );
  return res;
}
