// src/telegram/scraper/sites/impart.ts
import { Page } from 'puppeteer';
import {
  BASICS,
  BRANDS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

/**
 * Парсит цены на impart‑shop.ru.
 * @param page – puppeteer Cluster-ի էջ
 * @param productNumber – артикул, который ищем
 * @returns объект ScrapedProduct
 */
export async function scrapeImpart(
  page: Page,
  productNumber: string,
): Promise<ScrapedProduct> {
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

        const rows = document.querySelectorAll(
          'tbody tr.search-result-table-item',
        );

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

          if (!article.toLowerCase().includes(productNumber_.toLowerCase())) {
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
            const fallbackName = article + (brand ? ` ${brand}` : '');

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
    return result;
  } catch (error) {
    console.error(`${SOURCE_WEBPAGE_KEYS.impart} Error:`, error);
    return {
      shop: SOURCE_WEBPAGE_KEYS.impart,
      found: false,
      price: BASICS.zero,
    };
  }
}
export async function retryScrape(
  page: Page,
  productNumber: string,
  retries = 3,
): Promise<ScrapedProduct> {
  for (let i = 0; i < retries; i++) {
    try {
      return await scrapeImpart(page, productNumber);
    } catch (e) {
      console.error(`Փորձը ${i + 1} ձախողվեց․`, e);
    }
  }
  return {
    shop: SOURCE_WEBPAGE_KEYS.impart,
    found: false,
    price: BASICS.zero,
  };
}
