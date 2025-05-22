import * as puppeteer from 'puppeteer';
import { ScrapedProduct } from 'src/types/context.interface';
import {
  BASICS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
} from 'src/constants/constants';

export async function scrapeTruckdrive(name: string): Promise<any> {
  const start = performance.now();

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const result: ScrapedProduct = {
    shop: SOURCE_WEBPAGE_KEYS.truckdrive,
    found: false,
    price: BASICS.zero,
    name: BASICS.empotyString,
  };
  try {
    await page.goto(SOURCE_URLS.truckdrive, {
      waitUntil: 'domcontentloaded',
    });

    // Type into search box and press Enter
    await page.type('#inputsearch_searchstring', name);
    await page.keyboard.press('Enter');

    // Wait for product results to load
    await page.waitForSelector('.offer__product-price span', {
      timeout: 10000,
    });

    // Extract product name
    const title = await page.$eval(
      '.product-name__decor-uppercase',
      (el: Element) => el.textContent?.trim() ?? '',
    );

    // Extract price
    const price = await page.$eval(
      '.offer__product-price span',
      (el: Element) => el.textContent?.trim() ?? '',
    );
    const brandName = await page.$eval(
      '.catalog-products-table__product-brand',
      (el: Element) => el.textContent?.trim() ?? '',
    );
    const matchedBrand = BRANDS.find((brand) =>
      brandName.toLowerCase().includes(brand.toLowerCase()),
    );
    if (!matchedBrand) {
      return result;
    }
    result.name = title;
    result.price = price;
    await browser.close();

    return result;
  } catch (error) {
    console.error(`${SOURCE_WEBPAGE_KEYS.truckdrive} Error:`, error);
    return { shop: SOURCE_WEBPAGE_KEYS.truckdrive, found: false };
  }
}
