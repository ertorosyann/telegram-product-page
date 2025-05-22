import puppeteer from 'puppeteer';
import {
  BRANDS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeDvPt(name: string): Promise<ScrapedProduct> {
  const start = performance.now();
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  let result: ScrapedProduct = {
    found: false,
    shop: SOURCE_WEBPAGE_KEYS.dvpt,
  };
  const page = await browser.newPage();

  // Set user-agent and viewport to mimic a real browser
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  );

  await page.setViewport({ width: 1280, height: 800 });

  try {
    await page.goto(SOURCE_URLS.dvpt, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    console.log(performance.now() - start);

    // Type into the search input
    await page.type('#search_form_input', name);

    // Click the search button
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
      page.click('input[type="submit"][title="Искать"]'),
    ]);

    // Wait for search result (here are products)

    // Current product

    const productExists = await page.$('.goods a[itemprop="url"]');

    if (!productExists) {
      await browser.close();
      return result;
    }

    const firstProductLinkSelector = '.goods a[itemprop="url"]';

    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click(firstProductLinkSelector),
    ]);
    await page.waitForSelector('h1', { timeout: 10000 });

    result = await page.evaluate((BRANDS) => {
      const title = document.querySelector('h1')?.textContent?.trim() || '';

      const priceText =
        document.querySelector('.price')?.textContent?.trim() ||
        document.querySelector('.catalog_group_price')?.textContent?.trim() ||
        '0';
      const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;

      let searchedProductBrand = '';
      document.querySelectorAll('.item').forEach((item) => {
        const label = item.querySelector('.title span')?.textContent?.trim();
        if (label === 'Бренд:') {
          searchedProductBrand =
            item.querySelector('.values span')?.textContent?.trim() ||
            searchedProductBrand;
        }
      });
      const brandMatch = BRANDS.find((brand) =>
        searchedProductBrand.toLowerCase().includes(brand.toLowerCase()),
      );
      if (!brandMatch) {
        return {
          found: false,
          shop: 'dvpt',
        };
      }

      return {
        found: true,
        name: title,
        shop: 'dvpt',
        price,
      };
    }, BRANDS);
    console.log(result);

    // Object.assign(result, res);
    await browser.close();
    return result;
  } catch (error) {
    await browser.close();
    console.error(`${SOURCE_WEBPAGE_KEYS.dvpt} Error:`, error);
    return { shop: SOURCE_WEBPAGE_KEYS.dvpt, found: false };
  }
}
