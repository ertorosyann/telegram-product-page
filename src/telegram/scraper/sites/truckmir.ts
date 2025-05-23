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
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const myBrands = [
    'CAT',
    'Cummins',
    'Deutz',
    'John Deere',
    'Perkins',
    'Volvo',
    'Komatsu',
    'Scania',
    'FEBI',
  ];
  const url = 'https://truckmir.ru/';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const results: ScrapedProduct[] = [];

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    for (const productNumber of productNumbers) {
      const result: ScrapedProduct = {
        shop: SOURCE_WEBPAGE_KEYS.truckmir,
        found: false,
        price: BASICS.zero,
        name: BASICS.empotyString,
      };

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        await page.type('input[name="article"]', productNumber);
        await Promise.all([
          page.keyboard.press('Enter'),
          waitForSearchResponse(page, 'search'),
        ]);

        await page.waitForSelector(
          '.table.table-condensed.table-striped tbody tr',
          { visible: true, timeout: 60000 },
        );

        const rows = await page.$$(
          '.table.table-condensed.table-striped tbody tr',
        );
        if (rows.length === 0) {
          results.push(result);
          continue;
        }

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
          results.push(result);
          continue;
        }

        await page.waitForNavigation({
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });

        const title = await page.$eval(
          '.card-title, .page-title',
          (el) => el.textContent?.trim() || '',
        );

        const priceText = await page.$eval(
          '.td_price span',
          (el) => el.textContent?.trim() || '0',
        );
        const price = parseFloat(priceText.replace(/[^\d.]/g, ''));

        result.found = true;
        result.name = title;
        result.price = isNaN(price) ? BASICS.zero : price;
      } catch (err) {
        console.error(`Error while scraping product ${productNumber}:`, err);
      }

      results.push(result);
    }

    await browser.close();
    return results;
  } catch (error) {
    console.error(`${SOURCE_WEBPAGE_KEYS.truckmir} General Error:`, error);
    await browser.close();
    return productNumbers.map(() => ({
      shop: SOURCE_WEBPAGE_KEYS.truckmir,
      found: false,
      price: BASICS.zero,
      name: BASICS.empotyString,
    }));
  }
}
