import puppeteer from 'puppeteer';
import {
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeIxora(
  productNumber: string,
): Promise<ScrapedProduct> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  let result: ScrapedProduct = {
    found: false,
    shop: SOURCE_WEBPAGE_KEYS.ixora,
  };
  try {
    await page.goto(SOURCE_URLS.ixora, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // write in search
    await page.type('#searchField', productNumber);
    await page.keyboard.press('Enter');

    // wating result
    await page.waitForSelector('.SearchResultTableRetail', { timeout: 15000 });

    result = await page.evaluate(
      (productNumber, BRANDS) => {
        const item = document.querySelector('.SearchResultTableRetail');
        if (!item) return { shop: 'ixora', found: false };
        const firstRow = item.querySelector('tbody tr.O');
        if (!firstRow) return { shop: 'ixora', found: false };
        const title =
          firstRow
            .querySelector('.DetailName')
            ?.textContent?.trim()
            .replace(/\n/g, '')
            .replace(/\s+/g, ' ') || '';

        const price =
          firstRow
            .querySelector('.PriceDiscount')
            ?.textContent?.trim()
            .replace(/\D/g, '') || '0';
        BRANDS.find((brand) => title.toLowerCase().includes(brand));
        if (
          !title.toLowerCase().includes(productNumber.toLowerCase()) ||
          !BRANDS
        ) {
          return { shop: 'ixora', found: false };
        }

        return {
          shop: 'ixora',
          found: true,
          name: title,
          price: price,
        };
      },
      productNumber,
      BRANDS,
    );

    // Object.assign(result, resultEvaluate);

    await browser.close();
    return result;
  } catch {
    await browser.close();
    return { shop: SOURCE_WEBPAGE_KEYS.ixora, found: false };
  }
}
