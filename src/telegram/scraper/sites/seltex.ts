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

        const rows = $('.table tbody tr');
        if (rows.length === 0) {
          results.push(result);
          return;
        }

        let matchedRow: cheerio.Cheerio | null = null;
        let fallbackRow: cheerio.Cheerio | null = null;
        let brandMatched: string | null = null;

        rows.slice(1).each((_, rowElem) => {
          const row = $(rowElem);
          const tds = row.find('td');
          if (tds.length < 3) return;

          const nameCell = tds.eq(1);
          nameCell.find('a').remove();
          const name = nameCell.text().trim().replace(/\s+/g, ' ');
          if (!name) return;
          const splitName = name.split(' ');
          const matched = BRANDS.find((b) =>
            splitName.some((n) => n.toLowerCase() === b.toLowerCase()),
          );
          if (!fallbackRow) {
            fallbackRow = row;
          }

          if (matched) {
            matchedRow = row;
            brandMatched = matched;
            return false;
          }
        });

        const finalRow = matchedRow || fallbackRow!;
        const finalTds = finalRow.find('td');

        if (finalTds.length < 3) {
          results.push(result);
          return;
        }
        const nameCell = finalTds.eq(1);
        nameCell.find('a').remove();
        result.name = nameCell.text().trim().replace(/\s+/g, ' ');

        const rawPrice = finalTds.eq(2).text().trim();
        result.price = rawPrice && !isNaN(+rawPrice) ? rawPrice : BASICS.zero;

        result.found = true;

        if (brandMatched) {
          result.brand = brandMatched;
          results.push(result);
        }
      } catch {
        results.push(result);
      } finally {
        console.log('res = ', result);

        console.log(
          `Search time for "${productNumbers[0]} in Seltex":`,
          performance.now() - start,
        );
      }
    }),
  );

  return results;
}
