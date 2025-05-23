import puppeteer, { Browser, Page } from 'puppeteer-core';
import {
  BASICS,
  BRANDS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrape74Parts(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const PART74 = SOURCE_WEBPAGE_KEYS.parts74;
  const EMPTY = BASICS.empotyString;

  // Launch browser outside of scrapeSingle to reuse for all products
  const browser = await puppeteer.launch({
    executablePath: '/path/to/your/chrome-or-chromium', // օրինակ՝ /usr/bin/google-chrome-stable կամ C:\Program Files\Google\Chrome\Application\chrome.exe
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page: Page = await browser.newPage();

  async function scrapeSingle(productNumber: string): Promise<ScrapedProduct> {
    const url = `${SOURCE_URLS.parts74}${encodeURIComponent(productNumber)}`;

    try {
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      );

      await page.setRequestInterception(true);

      page.removeAllListeners('request'); // clean listeners

      page.on('request', (req) => {
        const resourceType = req.resourceType();

        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      await page.setJavaScriptEnabled(true);

      await page.goto(url, { timeout: 30000, waitUntil: 'domcontentloaded' });

      // Your scraping logic here - for example:
      const result: ScrapedProduct = await page.$$eval(
        '.list_item_wrapp:first-of-type',
        (items, BRANDS, EMPTY, PART74) => {
          const item = items[0];
          if (!item) return { shop: PART74, found: false };

          const title =
            item
              .querySelector('.description_wrapp .item-title a')
              ?.textContent?.trim() ?? '';

          const matched = BRANDS.some((b) =>
            title.toLowerCase().includes(b.toLowerCase()),
          );
          if (!matched) return { shop: PART74, found: false };

          const price =
            item
              .querySelector('.information_wrapp .price .price_value')
              ?.textContent?.trim() || EMPTY;

          return {
            name: title,
            price,
            shop: PART74,
            found: true,
          };
        },
        BRANDS,
        EMPTY,
        PART74,
      );

      return result;
    } catch (e) {
      console.error(`${PART74} error for ${productNumber}:`, e);
      return { shop: PART74, found: false };
    }
  }

  // Scrape all product numbers sequentially (better for stability)
  const results: ScrapedProduct[] = [];
  for (const productNumber of productNumbers) {
    const res = await scrapeSingle(productNumber);
    results.push(res);
  }

  await browser.close();

  return results;
}
