// src/telegram/scraper/sites/impart.ts
import puppeteer, { Page } from 'puppeteer';
import {
  BASICS,
  BRANDS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';
// esi error uni
export async function scrapeImpart(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const productNumber = productNumbers[0];
  const browser = await puppeteer.launch({ headless: true });
  const page: Page = await browser.newPage();
  const start = performance.now();
  const query = encodeURIComponent(productNumber);
  const url = `${SOURCE_URLS.impart}${query}`;

  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    const result: ScrapedProduct = await page.evaluate(
      (
        productNumber_: string,
        BRANDS_: string[],
        BASICS_: typeof BASICS,
        KEYS_: typeof SOURCE_WEBPAGE_KEYS,
      ) => {
        const parsePrice = (priceStr: string): number | string => {
          const cleaned = priceStr.replace(/[\s ]+/g, '').replace(',', '.');
          const num = parseFloat(cleaned);
          return Number.isFinite(num) ? num : BASICS_.zero;
        };

        const rows = Array.from(
          document.querySelectorAll('tbody tr.search-result-table-item'),
        );

        // Try to find exact match with our brands
        for (const row of rows) {
          const article =
            row
              .querySelector(
                'td.search-result-table-addit .search-result-table-article',
              )
              ?.textContent?.trim() || '';

          const brandMobile =
            row
              .querySelector(
                'td.search-result-table-addit .search-result-table-brand.d-inline.d-xxl-none',
              )
              ?.textContent?.trim() || '';

          const brandDesktop =
            row
              .querySelector('td.search-result-table-brand.d-none.d-xxl-block')
              ?.textContent?.trim() || '';

          const brand = brandDesktop || brandMobile || '';

          if (article !== productNumber_) {
            continue;
          }

          const matchedBrand = BRANDS_.find(
            (b) =>
              brand.toLowerCase().includes(b.toLowerCase()) ||
              article.toLowerCase().includes(b.toLowerCase()),
          );

          if (matchedBrand) {
            const nameCell = row.querySelector(
              'td.search-result-table-name a .search-result-table-text',
            );
            const name = nameCell?.textContent?.trim() || '';
            const fallbackName = brand || '';

            const priceCell = row.querySelector(
              'td .search-result-table-price > div:first-child',
            );
            const rawPrice = priceCell?.textContent?.trim() || '';
            const price = parsePrice(rawPrice);

            return {
              name: name || fallbackName,
              price,
              shop: KEYS_.impart,
              found: true,
            };
          }
        }

        // No brand match found – fallback to first or last row
        const fallbackRow = rows[0] || rows[rows.length - 1];
        if (fallbackRow) {
          const article =
            fallbackRow
              .querySelector(
                'td.search-result-table-addit .search-result-table-article',
              )
              ?.textContent?.trim() || '';

          const brandMobile =
            fallbackRow
              .querySelector(
                'td.search-result-table-addit .search-result-table-brand.d-inline.d-xxl-none',
              )
              ?.textContent?.trim() || '';

          const brandDesktop =
            fallbackRow
              .querySelector('td.search-result-table-brand.d-none.d-xxl-block')
              ?.textContent?.trim() || '';

          const brand = brandDesktop || brandMobile || '';

          const nameCell = fallbackRow.querySelector(
            'td.search-result-table-name a .search-result-table-text',
          );
          const name = nameCell?.textContent?.trim() || '';
          const fallbackName = brand || '';

          const priceCell = fallbackRow.querySelector(
            'td .search-result-table-price > div:first-child',
          );
          const rawPrice = priceCell?.textContent?.trim() || '';
          const price = parsePrice(rawPrice);

          return {
            name: name,
            price,
            shop: KEYS_.impart,
            found: true,
            brand: fallbackName,
          };
        }

        // No products at all
        return {
          shop: KEYS_.impart,
          found: false,
        };
      },
      productNumber,
      BRANDS,
      BASICS,
      SOURCE_WEBPAGE_KEYS,
    );

    console.log(result, performance.now() - start);
    return [result];
  } catch (error) {
    console.error(`${SOURCE_WEBPAGE_KEYS.impart} Error:`, error);
    return [
      {
        shop: SOURCE_WEBPAGE_KEYS.impart,
        found: false,
      },
    ];
  }
}
