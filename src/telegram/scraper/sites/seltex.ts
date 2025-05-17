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

    const result: ScrapedProduct = {
      shop: SOURCE_WEBPAGE_KEYS.seltex,
      found: false,
    };

    $('tbody tr').each((_, row) => {
      const tds = $(row).find('td');
      if (tds.length < 6) return;
      //in text is button cleaning that button
      tds.eq(1).find('a').remove();
      const nameText = tds.eq(1).text().trim().replace(/\s+/g, ' ');
      const isProduct = nameText.length > 1 ? true : false;

      const matchedBrand = BRANDS.find((brand) =>
        nameText.toLowerCase().includes(brand.toLowerCase()),
      );

      if (matchedBrand) {
        const price = tds.eq(2).text().trim();
        result.name = nameText;
        result.price =
          price.trim() !== '' && !isNaN(+price) ? BASICS.empotyStrin : price;
        result.found = isProduct;
        return false; // break the loop
      }
    });

    return result;
  } catch (error: unknown) {
    console.error(`${SOURCE_WEBPAGE_KEYS.seltex} Error:`, error);
    return { shop: SOURCE_WEBPAGE_KEYS.seltex, found: false };
  }
}
