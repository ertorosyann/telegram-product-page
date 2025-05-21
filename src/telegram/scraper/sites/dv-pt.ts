import puppeteer from 'puppeteer';
import {
  BASICS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeDvPt(name: string): Promise<ScrapedProduct> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const result: ScrapedProduct = {
    price: BASICS.zero,
    name: BASICS.empotyString,
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

    // Type into the search input
    await page.type('#search_form_input', name);

    // Click the search button
    await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes('/search') && response.status() === 200,
        {
          timeout: 10000,
        },
      ),
      await page.click('input[type="submit"][title="Искать"]'),
    ]);

    // Wait for search result (here are products)
    await page.waitForSelector('.goods', { timeout: 10000 });
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

    const res = await page.evaluate(() => {
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
      const brandMatch = [
        'CAT',
        'Cummins',
        'Deutz',
        'John Deere',
        'Perkins',
        'Volvo',
        'Komatsu',
        'Scania',
      ].find((brand) => searchedProductBrand.toLowerCase().includes(brand));
      if (!brandMatch) {
        return {
          found: false,
          name: '',
          shop: 'dvpt',
          price: '',
        };
      }
      return {
        found: true,
        name: title,
        shop: 'dvpt',
        price,
      };
    });
    Object.assign(result, res);
    await browser.close();
    return result;
  } catch (error: unknown) {
    await browser.close();
    console.error(`${SOURCE_WEBPAGE_KEYS.dvpt} Error:`, error);
    return { shop: SOURCE_WEBPAGE_KEYS.dvpt, found: false };
  }
}
