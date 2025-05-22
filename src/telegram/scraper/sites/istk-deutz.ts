import { Page } from 'puppeteer';
import { SOURCE_URLS, SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeIstkDeutz(
  name: string,
  page: Page,
): Promise<ScrapedProduct> {
  const start = performance.now();

  const results: ScrapedProduct = {
    shop: SOURCE_WEBPAGE_KEYS.istk,
    found: false,
  };

  try {
    await page.goto(SOURCE_URLS.istk, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    await page.type('#title-search-input', name);

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }),
      page.keyboard.press('Enter'),
    ]);
    console.log(page.url());

    const productLinkElement = await page.$(
      'tbody tr .arrivals_product_title a',
    );

    if (!productLinkElement) {
      return { shop: SOURCE_WEBPAGE_KEYS.istk, found: false };
    }
    const productHref = await page.$eval(
      'tbody tr .arrivals_product_title a',
      (el) => el.getAttribute('href') || '',
    );

    if (!productHref) {
      throw new Error('Product link not found in search results');
    }

    const productUrl = new URL(productHref, 'https://istk-deutz.ru').toString();
    await page.goto(productUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    const productTitle = await page.$eval(
      'div.title h1',
      (el) => el.textContent?.trim() || 'No title found',
    );

    const priceText = await page.$eval(
      'div.price',
      (el) => el.textContent?.trim() || '',
    );

    const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;

    results.name = productTitle;
    results.price = price;
    results.found = true;

    console.log(
      'scrapeIstkDeutz',
      results,
      `${Math.round(performance.now() - start)}ms`,
    );

    return results;
  } catch (error) {
    console.error(`${SOURCE_WEBPAGE_KEYS.istk} Error:`, error);
    return { shop: SOURCE_WEBPAGE_KEYS.istk, found: false };
  }
}
