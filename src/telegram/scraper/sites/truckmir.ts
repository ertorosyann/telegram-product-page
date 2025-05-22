import puppeteer, { HTTPResponse, Page } from 'puppeteer';
import { ScrapedProduct } from 'src/types/context.interface';
import { BASICS, SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';

async function waitForSearchResponse(page: Page, urlPart: string) {
  return new Promise<void>((resolve) => {
    function onResponse(response: HTTPResponse) {
      if (response.url().includes(urlPart) && response.status() === 200) {
        page.off('response', onResponse);
        resolve();
      }
    }
    page.on('response', onResponse);
  });
}

export async function scrapeTruckmir(
  productNumber: string,
): Promise<ScrapedProduct> {
  const start = performance.now();

  const myBrands = [
    'CAT',
    'Cummins',
    'Deutz',
    'John Deere',
    'Perkins',
    'Volvo',
    'Komatsu',
    'Scania',
  ];
  const url = 'https://truckmir.ru/';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const result: ScrapedProduct = {
    shop: SOURCE_WEBPAGE_KEYS.truckmir,
    found: false,
    price: BASICS.zero,
    name: BASICS.empotyString,
  };

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Type product number and press Enter to trigger search
    await page.type('input[name="article"]', productNumber);

    await Promise.all([
      page.keyboard.press('Enter'),
      waitForSearchResponse(page, 'search'), // Wait for search API response (no timeout)
    ]);

    // Wait for the table rows to be visible, timeout increased to 60s to avoid premature timeout
    await page.waitForSelector(
      '.table.table-condensed.table-striped tbody tr',
      {
        visible: true,
        timeout: 60000,
      },
    );

    // Find all result rows
    const rows = await page.$$('.table.table-condensed.table-striped tbody tr');
    if (rows.length === 0) {
      await browser.close();
      return result;
    }

    // Evaluate rows to find a matching brand, and click it
    const matched = await page.evaluate((brands) => {
      const rows = document.querySelectorAll(
        '.table.table-condensed.table-striped tbody tr',
      );
      for (const row of rows) {
        const brand = row.children[0]?.textContent?.trim();
        if (
          brand &&
          brands.map((b) => b.toUpperCase()).includes(brand.toUpperCase())
        ) {
          (row.children[0] as HTMLElement).click();
          return true;
        }
      }
      return false;
    }, myBrands);

    if (!matched) {
      await browser.close();
      return result;
    }

    // Wait for navigation to product page
    await page.waitForNavigation({
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Scrape product title
    const title = await page.$eval(
      '.card-title, .page-title',
      (el) => el.textContent?.trim() || '',
    );

    // Scrape product price
    const priceText = await page.$eval(
      '.td_price span',
      (el) => el.textContent?.trim() || '0',
    );
    const price = parseFloat(priceText.replace(/[^\d.]/g, ''));

    await browser.close();

    return {
      shop: SOURCE_WEBPAGE_KEYS.truckmir,
      found: true,
      name: title,
      price: isNaN(price) ? BASICS.zero : price,
    };
  } catch (error) {
    console.error(`${SOURCE_WEBPAGE_KEYS.truckmir} Error:`, error);
    await browser.close();
    return result;
  }
}
