import puppeteer from 'puppeteer';
import {
  BASICS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeIxora(
  productNumber: string,
): Promise<ScrapedProduct> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const result: ScrapedProduct = {
    found: false,
    shop: SOURCE_WEBPAGE_KEYS.ixora,
    price: BASICS.zero,
    name: BASICS.empotyString,
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

    const resultEvaluate = await page.evaluate((productNumber) => {
      const item = document.querySelector('.SearchResultTableRetail');
      if (!item) return { shop: 'ixora', found: false, price: '0', name: '' };
      const firstRow = item.querySelector('tbody tr.O');
      if (!firstRow)
        return { shop: 'ixora', found: false, price: '0', name: '' };
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
      const brandMatch = [
        'CAT',
        'Cummins',
        'Deutz',
        'John Deere',
        'Perkins',
        'Volvo',
        'Komatsu',
        'Scania',
      ].find((brand) => title.toLowerCase().includes(brand));
      if (
        !title.toLowerCase().includes(productNumber.toLowerCase()) ||
        !brandMatch
      ) {
        return { shop: 'ixora', found: false, price: '0', name: '' };
      }

      return {
        shop: 'ixora',
        found: true,
        name: title,
        price: price,
      };
    }, productNumber);

    Object.assign(result, resultEvaluate);

    await browser.close();
    return result;
  } catch (error: any) {
    await browser.close();
    console.error(`${SOURCE_WEBPAGE_KEYS.ixora} Error:`, error);
    return { shop: SOURCE_WEBPAGE_KEYS.ixora, found: false };
  }
}
