import {
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';
import { Page } from 'puppeteer';

export async function scrapeIxora(
  productNumber: string,
  page: Page,
): Promise<ScrapedProduct> {
  const start = performance.now();
  const result: ScrapedProduct = {
    found: false,
    shop: SOURCE_WEBPAGE_KEYS.ixora,
  };

  try {
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      if (['image', 'stylesheet', 'font'].includes(req.resourceType())) {
        req.abort();
      } else {
        req.continue();
      }
    });
    await page.goto(SOURCE_URLS.ixora, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    console.log(performance.now() - start);

    await page.type('#searchField', productNumber);
    await page.keyboard.press('Enter');

    await page.waitForSelector('.SearchResultTableRetail', { timeout: 15000 });
    console.log(performance.now() - start);

    const scraped = await page.evaluate(
      (productNumber, BRANDS) => {
        const item = document.querySelector('.SearchResultTableRetail');
        if (!item) return { shop: 'ixora', found: false };

        const firstRow = item.querySelector('tbody tr.O');
        if (!firstRow) return { shop: 'ixora', found: false };

        const title =
          firstRow
            .querySelector('.DetailName')
            ?.textContent?.trim()
            .replace(/\n/g, '')
            .replace(/\s+/g, ' ') || '';
        const price =
          firstRow
            .querySelector('.PriceDiscount')
            ?.textContent?.trim()
            .replace(/\D/g, '') || '0';
        const isMatchBrand = BRANDS.find((brand) =>
          title.toLowerCase().includes(brand),
        );
        if (
          !title.toLowerCase().includes(productNumber.toLowerCase()) ||
          !isMatchBrand
        ) {
          return { shop: 'ixora', found: false };
        }
        return {
          shop: 'ixora',
          found: true,
          name: title,
          price: price,
        };
      },
      productNumber,
      BRANDS,
    );
    console.log(scraped);

    return scraped;
  } catch (error: any) {
    console.error(`${SOURCE_WEBPAGE_KEYS.ixora} Error:`, error);
    return { shop: SOURCE_WEBPAGE_KEYS.ixora, found: false };
  }
}
