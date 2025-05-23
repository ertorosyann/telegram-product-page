import puppeteer from 'puppeteer';
import {
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';
export async function scrapeIxora(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const results: ScrapedProduct[] = [];

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

    for (const productNumber of productNumbers) {
      try {
        await page.type('#searchField', productNumber);
        await page.keyboard.press('Enter');

        await page.waitForSelector('.SearchResultTableRetail', {
          timeout: 15000,
        });

        const scraped: ScrapedProduct = await page.evaluate(
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

        results.push(scraped);

        // Clear search field before next search
        await page.evaluate(() => {
          const field =
            document.querySelector<HTMLInputElement>('#searchField');
          if (field) field.value = '';
        });
      } catch (err) {
        console.error(`Error scraping product ${productNumber}:`, err);
        results.push({ shop: SOURCE_WEBPAGE_KEYS.ixora, found: false });
      }
    }
  } catch (error) {
    console.error(`${SOURCE_WEBPAGE_KEYS.ixora} Global Error:`, error);
    return productNumbers.map(() => ({
      shop: SOURCE_WEBPAGE_KEYS.ixora,
      found: false,
    }));
  }

  return results;
}
