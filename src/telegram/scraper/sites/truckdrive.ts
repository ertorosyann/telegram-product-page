import * as puppeteer from 'puppeteer';

export async function scrapeTruckdrive(
  name: string,
  count: string,
  brand: string,
): Promise<string> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://truckdrive.ru/', {
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

    await browser.close();
    return `📦 Product: ${title || 'Not found'}\n💰 Price: ${price || 'Not found'}`;
  } catch (err) {
    await browser.close();
    console.error('Scraping error:', (err as Error).message);
    return '❌ Could not retrieve product info from truckdrive.ru.';
  }
}
