import axios, { AxiosResponse } from 'axios';
import * as cheerio from 'cheerio';
import {
  BASICS,
  BRANDS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeSeltex(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const results: ScrapedProduct[] = [];
  await Promise.all(
    productNumbers.map(async (productNumber) => {
      const cleaanProductNumber = productNumber.replace(/\//g, '');

      const start = performance.now();
      const url = `${SOURCE_URLS.seltex}${cleaanProductNumber}`;
      const result: ScrapedProduct = {
        shop: SOURCE_WEBPAGE_KEYS.seltex,
        found: false,
      };

      try {
        const response: AxiosResponse<string> = await axios.get(url, {
          timeout: 5000,
        });
        const data = response.data;
        const $ = cheerio.load(data);

        const row = $('.table tbody tr').eq(1); // 2-րդ տողը
        if (!row.length) {
          results.push(result);
          return;
        }

        const tds = row.find('td');
        if (tds.length < 3) {
          results.push(result);
          return;
        }

        const nameCell = tds.eq(1);
        nameCell.find('a').remove();
        const name = nameCell.text().trim().replace(/\s+/g, ' ');
        if (!name) {
          results.push(result);
          return;
        }

        const brandMatch = BRANDS.find((b) =>
          name.toLowerCase().includes(b.toLowerCase()),
        );
        if (!brandMatch) {
          results.push(result);
          return;
        }

        const rawPrice = tds.eq(2).text().trim();
        result.name = name;
        result.price = rawPrice && !isNaN(+rawPrice) ? rawPrice : BASICS.zero;
        console.log(result.price);

        result.found = true;

        results.push(result);
      } catch {
        results.push(result);
      } finally {
        console.log(results);
        console.log(
          `Search time for "${productNumbers[0]} in Seltex":`,
          performance.now() - start,
        );
      }
    }),
  );

  return results;
}
