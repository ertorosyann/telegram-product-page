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
  const result: ScrapedProduct = {
    shop: SOURCE_WEBPAGE_KEYS.seltex,
    found: false,
  };

  try {
    const { data } = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(data);

    const row = $('.table tbody tr').eq(1); // 2-я строка
    if (!row.length) return result;

    const tds = row.find('td');
    if (tds.length < 3) return result;

    const nameCell = tds.eq(1);
    nameCell.find('a').remove();
    const name = nameCell.text().trim().replace(/\s+/g, ' ');
    if (!name) return result;

    const brandMatch = BRANDS.find((b) =>
      name.toLowerCase().includes(b.toLowerCase()),
    );
    if (!brandMatch) return result;

    const rawPrice = tds.eq(2).text().trim();
    result.name = name;
    result.price =
      rawPrice && !isNaN(+rawPrice) ? rawPrice : BASICS.empotyString;
    result.found = true;

    return result;
  } catch {
    return result;
  }
}
