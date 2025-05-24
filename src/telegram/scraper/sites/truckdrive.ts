import { ScrapedProduct } from 'src/types/context.interface';
import {
  BASICS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
} from 'src/constants/constants';
import puppeteer from 'puppeteer';

export async function scrapeTruckdrive(
  productNames: string[],
): Promise<ScrapedProduct[]> {
  const browser = await puppeteer.launch({ headless: true });
  const results: ScrapedProduct[] = [];
  const start = performance.now();
  try {
    const page = await browser.newPage();

    for (const name of productNames) {
      const result: ScrapedProduct = {
        shop: SOURCE_WEBPAGE_KEYS.truckdrive,
        found: false,
        price: BASICS.zero,
        name: BASICS.empotyString,
      };

      try {
        await page.setRequestInterception(true);
        page.on('request', (req) => {
          if (
            ['image', 'stylesheet', 'font', 'media'].includes(
              req.resourceType(),
            )
          ) {
            req.abort();
          } else {
            req.continue();
          }
        });
        await page.goto(SOURCE_URLS.truckdrive, {
          waitUntil: 'domcontentloaded',
        });

        // Очистить поисковое поле (если нужно)
        await page.evaluate(() => {
          const input = document.querySelector(
            '#inputsearch_searchstring',
          ) as HTMLInputElement;
          if (input) input.value = '';
        });

        // Ввести имя в поле поиска и нажать Enter
        await page.type('#inputsearch_searchstring', name);
        await page.keyboard.press('Enter');
        try {
          await page.waitForSelector('.search-without-results', {
            timeout: 2000,
          });
          // Եթե հասավ այստեղ՝ կա արդյունք չգտնելու ինդիկատորը
          results.push({
            shop: SOURCE_WEBPAGE_KEYS.truckdrive,
            found: false,
            price: BASICS.zero,
            name: BASICS.empotyString,
          });

          continue;
        } catch {
          console.log('product found');

          await page.waitForSelector('#search-result-clarify');

          const matchingHref: string | null = await page.$$eval(
            '#search-result-clarify a',
            (links, BRANDS: string[]) => {
              let fallbackHref: string | null = null;

              for (const link of links as HTMLElement[]) {
                const brandDiv = link.querySelector(
                  '.search-result__clarify-brand',
                );
                const brand = brandDiv?.textContent?.trim();

                if (!fallbackHref) {
                  fallbackHref = (link as HTMLAnchorElement).href;
                }

                if (brand && BRANDS.includes(brand)) {
                  return (link as HTMLAnchorElement).href;
                }
              }

              return fallbackHref;
            },
            BRANDS,
          );
          if (matchingHref) {
            await page.goto(matchingHref, { waitUntil: 'domcontentloaded' });
          } else {
            continue;
          }
          await page.waitForSelector('.catalog-products-table__product-item');

          const productData = await page.evaluate(() => {
            const productItem = document.querySelector(
              '.catalog-products-table__product-item',
            );

            if (!productItem) return null;
            const brandEl: HTMLAnchorElement | null = productItem.querySelector(
              '.catalog-products-table__product-brand-desc',
            );
            const brand = brandEl
              ? brandEl.innerText.replace('Бренд:', '').trim()
              : null;

            const titleEl: HTMLAnchorElement | null = productItem.querySelector(
              '.catalog-products-table__product-name span',
            );
            const title = titleEl ? titleEl.innerText.trim() : null;

            const priceEl: HTMLAnchorElement | null = productItem.querySelector(
              '.offer__product-price span',
            );

            const price = priceEl ? priceEl.innerText.trim() : null;

            return { title, price, brand };
          });

          result.name = productData?.title || '';
          result.price = productData?.price || '-';
          result.found = true;

          results.push(result);
        }
      } catch (innerError) {
        console.error(
          `${SOURCE_WEBPAGE_KEYS.truckdrive} Error for "${name}":`,
          innerError,
        );
        results.push(result);
      }
    }
  } catch (error) {
    console.error(`${SOURCE_WEBPAGE_KEYS.truckdrive} Unexpected Error:`, error);
  } finally {
    console.log(
      `Search time for "${productNames[0]}":`,
      performance.now() - start,
      results,
    );
    await browser.close();
  }

  return results;
}
