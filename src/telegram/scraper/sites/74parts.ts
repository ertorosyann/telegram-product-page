import puppeteer from 'puppeteer';
import {
  BASICS,
  BRANDS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrape74Parts(
  productNumber: string,
): Promise<ScrapedProduct> {
  const url = `${SOURCE_URLS.parts74}${encodeURIComponent(productNumber)}`;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const result: ScrapedProduct = await page.$$eval(
      '.list_item_wrapp:first-of-type',
      ([item], BRANDS, EMPTY): ScrapedProduct => {
        if (!item) return { shop: 'parts74', found: false };

        const title =
          item
            .querySelector('.description_wrapp .item-title a')
            ?.textContent?.trim() ?? '';

        const matched = BRANDS.some((b) =>
          title.toLowerCase().includes(b.toLowerCase()),
        );
        if (!matched) return { shop: 'parts74', found: false };

        const price =
          item
            .querySelector('.information_wrapp .price .price_value')
            ?.textContent?.trim() || EMPTY;

        return {
          name: title,
          price,
          shop: 'parts74',
          found: true,
        };
      },
      BRANDS, // ← 1‑й внешний аргумент
      BASICS.empotyString, // ← 2‑й внешний аргумент
    );

    // console.log(result);

    await browser.close();
    return result;
  } catch (e) {
    await browser.close();
    console.error(`${SOURCE_WEBPAGE_KEYS.parts74} error:`, e);
    return { shop: SOURCE_WEBPAGE_KEYS.parts74, found: false };
  }
}
