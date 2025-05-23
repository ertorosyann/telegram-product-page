import puppeteer from 'puppeteer';
import { BRANDS, SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';

interface VoltagResult {
  shop: string;
  found: boolean;
  brand?: string;
  price?: string | null;
  productNumber: string;
}

export async function scrapeVoltag(
  productNumbers: string[],
): Promise<VoltagResult[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const results: VoltagResult[] = [];

  for (const productNumber of productNumbers) {
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
            const priceCell = row.querySelectorAll('td')[6]; // փոփոխիր ըստ իրական դասավորության
            const price = priceCell?.textContent?.trim() || null;
            return { brand, price };
          }
        }

        return null;
      }, BRANDS);

      if (matchedProduct) {
        results.push({
          shop: 'voltag',
          found: true,
          brand: matchedProduct.brand,
          price: matchedProduct.price,
          productNumber,
        });
      } else {
        results.push({
          shop: 'voltag',
          found: false,
          productNumber,
        });
      }
    } catch (error) {
      console.error(`${SOURCE_WEBPAGE_KEYS.voltag} Error:`, error);
      results.push({
        shop: SOURCE_WEBPAGE_KEYS.voltag,
        found: false,
        productNumber,
      });
    }
  }

  await browser.close();
  return results;
}
