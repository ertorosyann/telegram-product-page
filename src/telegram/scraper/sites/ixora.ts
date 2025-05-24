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
  const start = performance.now();
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

        const resultTableSelector = '.SearchResultTableRetail';
        const noResultsSelector = '.search-result-container__title';

        let found = false;

        try {
          await Promise.race([
            page.waitForSelector(resultTableSelector, { timeout: 7000 }),
            page.waitForSelector(noResultsSelector, { timeout: 7000 }),
          ]);

          // Check if the table appeared
          found = (await page.$(resultTableSelector)) !== null;
        } catch {
          console.log(
            'Neither table nor "no results" message appeared in time',
          );
        }

        if (!found) {
          console.log('No product found, skipping...');
          return [{ shop: SOURCE_WEBPAGE_KEYS.ixora, found: false }];
        }

        const scraped: ScrapedProduct = await page.evaluate(
          (productNumber, BRANDS) => {
            const item = document.querySelector('.SearchResultTableRetail');
            if (!item) return { shop: 'ixora', found: false, esa: 1 };

            const firstRow = item.querySelector('tbody tr.O');
            if (!firstRow) return { shop: 'ixora', found: false, esa: 2 };

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
  console.log(results);

  console.log(
    `Search time for "${productNumbers[0]} in imachinery":`,
    performance.now() - start,
  );
  return results;
}
