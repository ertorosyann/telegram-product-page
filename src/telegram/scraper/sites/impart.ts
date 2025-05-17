import puppeteer from 'puppeteer';
import {
  BASICS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeImpart(
  productNumber: string,
): Promise<ScrapedProduct> {
  const query = encodeURIComponent(productNumber);
  const url = `${SOURCE_URLS.impart}${query}`;
  console.log(BASICS, SOURCE_URLS, SOURCE_WEBPAGE_KEYS, BRANDS);

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    const result: ScrapedProduct = await page.evaluate(
      (productNumber, BRANDS) => {
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
          //ToDo this need change oky for browser
          const brandFromMobile =
            row
              .querySelector(
                'td.search-result-table-addit .search-result-table-brand.d-inline.d-xxl-none',
              )
              ?.textContent?.trim() || '';

          const brandFromDesktop =
            row
              .querySelector('td.search-result-table-brand.d-none.d-xxl-block')
              ?.textContent?.trim() || '';

          const brand = brandFromDesktop || brandFromMobile || '';

          if (!article.toLowerCase().includes(productNumber.toLowerCase())) {
            continue;
          }

          const matchedBrand = BRANDS.find(
            (b) =>
              brand.toLowerCase().includes(b.toLowerCase()) ||
              article.toLowerCase().includes(b.toLowerCase()),
          );

          if (matchedBrand) {
            const name =
              row
                .querySelector(
                  'td.search-result-table-name a .search-result-table-text',
                )
                ?.textContent?.trim() || '';

            const fallbackName = article + (brand ? ` ${brand}` : '');

            const price =
              row
                .querySelector('td.search-result-table-price > div:first-child')
                ?.textContent?.trim() || '';
            const resPrice =
              price.trim() !== '' && !isNaN(+price)
                ? BASICS.empotyStrin
                : price;
            return {
              name: name || fallbackName,
              resPrice,
              shop: SOURCE_WEBPAGE_KEYS.impart,
              found: true,
            };
          }
        }

        return { shop: SOURCE_WEBPAGE_KEYS.impart, found: false };
      },
      productNumber,
      BRANDS,
    );

    await browser.close();

    return result;
  } catch (error: any) {
    await browser.close();
    console.error(`${SOURCE_WEBPAGE_KEYS.impart} Error:`, error);
    return { shop: SOURCE_WEBPAGE_KEYS.impart, found: false };
  }
}
