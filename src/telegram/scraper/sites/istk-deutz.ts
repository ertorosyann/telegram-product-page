import puppeteer from 'puppeteer';
import {
  BASICS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeIstkDeutz(name: string): Promise<ScrapedProduct> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const results: ScrapedProduct = {
    shop: SOURCE_WEBPAGE_KEYS.istk,
    found: false,
    price: BASICS.zero,
  };
  try {
    await page.goto(SOURCE_URLS.istk, {
      waitUntil: 'domcontentloaded',
    });

    // Type product name into search input
    await page.type('#title-search-input', name);

    // Press Enter and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.keyboard.press('Enter'),
    ]);

    // Wait for first product link in search results
    await page.waitForSelector('tbody tr .arrivals_product_title a', {
      timeout: 10000,
    });

    // Get href of first product link
    const productHref = await page.$eval(
      'tbody tr .arrivals_product_title a',
      (el) => el.getAttribute('href') || '',
    );

    if (!productHref) {
      throw new Error('Product link not found in search results');
    }

    // Go to product page
    const productUrl = new URL(productHref, 'https://istk-deutz.ru').toString();
    await page.goto(productUrl, { waitUntil: 'domcontentloaded' });

    // Wait for price and title elements to load
    await page.waitForSelector('div.price', { timeout: 10000 });
    await page.waitForSelector('div.title h1', { timeout: 10000 });

    // Extract product title
    const productTitle = await page.$eval(
      'div.title h1',
      (el) => el.textContent?.trim() || 'No title found',
    );

    // Extract price text
    const priceText = await page.$eval(
      'div.price',
      (el) => el.textContent?.trim() || '',
    );
    const price = parseInt(priceText.replace(/[^\d]/g, ''), 10); // 352776

    results.name = productTitle;
    results.price = price;
    await browser.close();
    results.found = true;
    return results;
  } catch (error) {
    await browser.close();
    console.error(`${SOURCE_WEBPAGE_KEYS.seltex} Error:`, error);
    return { shop: SOURCE_WEBPAGE_KEYS.seltex, found: false };
  }
}
