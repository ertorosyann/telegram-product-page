import puppeteer from 'puppeteer';
import { BRANDS, SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeVoltag(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const start = performance.now();
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const results: ScrapedProduct[] = [];

  for (const productNumber of productNumbers) {
    try {
      await page.goto('https://voltag.ru', { waitUntil: 'domcontentloaded' });

      await page.waitForSelector('#header_search_input');
      await page.type('#header_search_input', productNumber);

      await Promise.all([
        page.click('#header_search_button'),
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      ]);

      const linkElement = await page.$('a[href*="/price/group/"]');
      if (!linkElement) {
        results.push({
          shop: 'voltag',
          found: false,
          name: productNumber,
        });
        continue;
      }

      const productUrl = await page.evaluate((el) => el.href, linkElement);

      await page.goto(productUrl, { waitUntil: 'domcontentloaded' });

      await page.waitForFunction(
        () => {
          const tbody = document.querySelector('tbody[aria-live="polite"]');
          return tbody && tbody.querySelectorAll('tr').length > 0;
        },
        { timeout: 5000 },
      );

      const matchedProduct = await page.evaluate((brands) => {
        const tbody = document.querySelector('tbody[aria-live="polite"]');
        if (!tbody) return null;

        const rows = Array.from(tbody.querySelectorAll('tr'));

        for (const row of rows) {
          const brandCell = row.querySelector('td');
          if (!brandCell) continue;

          const brand = brandCell.textContent?.trim() || '';
          if (brands.includes(brand.toUpperCase())) {
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
          name: productNumber,
        });
      } else {
        results.push({
          shop: 'voltag',
          found: false,
          name: productNumber,
        });
      }
    } catch (error) {
      console.error(`${SOURCE_WEBPAGE_KEYS.voltag} Error:`, error);
      results.push({
        shop: SOURCE_WEBPAGE_KEYS.voltag,
        found: false,
        name: productNumber,
      });
    } finally {
      console.log(results);
      console.log(
        `Search time for "${productNumbers[0]} in Seltex":`,
        performance.now() - start,
      );
    }
  }

  await browser.close();
  return results;
}
