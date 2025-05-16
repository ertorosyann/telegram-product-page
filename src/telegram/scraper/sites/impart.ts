import puppeteer from 'puppeteer';
import { BRANDS } from 'src/constants/brends';

export async function scrapeImpart(
  productNumber: string,
): Promise<{ name?: string; price?: string }> {
  const query = encodeURIComponent(productNumber);
  const url = `https://impart.online/catalog/search/?q=${query}`;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 60000,
    });

    const result = await page.evaluate(
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

            return {
              name: name || fallbackName,
              price,
            };
          }
        }

        return {};
      },
      productNumber,
      BRANDS,
    );

    await browser.close();
    // console.log(result);

    return result;
  } catch (error: any) {
    await browser.close();
    console.error(`❌ [Impart] Puppeteer Error: ${error.message}`);
    return {};
  }
}
