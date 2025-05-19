import puppeteer from 'puppeteer';
import { BRANDS, SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';

export async function scrapeVoltag(productNumber: string) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://voltag.ru', { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('#header_search_input');
    await page.type('#header_search_input', productNumber);

    await Promise.all([
      page.click('#header_search_button'),
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
    ]);

    const productUrl = await page.$eval(
      'a[href*="/price/group/"]',
      (el) => el.href,
    );

    console.log('✅ Product URL:', productUrl);

    await page.goto(productUrl, { waitUntil: 'domcontentloaded' });

    await page.waitForFunction(
      () => {
        const tbody = document.querySelector('tbody[aria-live="polite"]');
        return tbody && tbody.querySelectorAll('tr').length > 0;
      },
      { timeout: 50000 },
    );

    const matchedProduct = await page.evaluate((brands) => {
      const tbody = document.querySelector('tbody[aria-live="polite"]');
      if (!tbody) return null;

      const rows = Array.from(tbody.querySelectorAll('tr'));

      for (const row of rows) {
        const brandCell = row.querySelector('td');
        if (!brandCell) continue;

        const brand = brandCell.textContent?.trim() || '';
        if (brands.includes(brand)) {
          const priceCell = row.querySelectorAll('td')[6]; // փոփոխիր ինդեքսը ըստ իրական դասավորվածության
          const price = priceCell?.textContent?.trim() || null;
          return { brand, price };
        }
      }

      return null;
    }, BRANDS);

    await browser.close();

    if (matchedProduct) {
      console.log('✅ Found matching product:', matchedProduct);
      return {
        shop: 'voltag',
        found: true,
        brand: matchedProduct.brand,
        price: matchedProduct.price,
      };
    } else {
      return {
        shop: 'voltag',
        found: false,
      };
    }
  } catch (error) {
    console.error(`${SOURCE_WEBPAGE_KEYS.voltag} Error:`, error);
    return { shop: SOURCE_WEBPAGE_KEYS.voltag, found: false };
  }
}
