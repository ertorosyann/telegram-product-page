import puppeteer from 'puppeteer';
import {
  BRANDS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeDvPt(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const results: ScrapedProduct[] = [];
  const browser = await puppeteer.launch({ headless: true });
  const start = performance.now();
  try {
    const page = await browser.newPage();

    // Set user-agent and viewport once
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    );
    await page.setViewport({ width: 1280, height: 800 });

    for (const name of productNumbers) {
      const result: ScrapedProduct = {
        found: false,
        shop: SOURCE_WEBPAGE_KEYS.dvpt,
      };

      try {
        await page.goto(SOURCE_URLS.dvpt, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });

        // Type product name and search
        await page.type('#search_form_input', name);
        await Promise.all([
          page.waitForNavigation({
            waitUntil: 'domcontentloaded',
            timeout: 10000,
          }),
          page.click('input[type="submit"][title="Искать"]'),
        ]);

        const productExists = await page.$('.goods a[itemprop="url"]');

        if (!productExists) {
          results.push(result);
          continue;
        }

        const firstProductLinkSelector = '.goods a[itemprop="url"]';

        await Promise.all([
          page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
          page.click(firstProductLinkSelector),
        ]);

        await page.waitForSelector('h1', { timeout: 10000 });

        const productResult = await page.evaluate((BRANDS) => {
          const title = document.querySelector('h1')?.textContent?.trim() || '';

          const priceText =
            document.querySelector('.price')?.textContent?.trim() ||
            document
              .querySelector('.catalog_group_price')
              ?.textContent?.trim() ||
            '0';
          const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;

          let searchedProductBrand = '';
          document.querySelectorAll('.item').forEach((item) => {
            const label = item
              .querySelector('.title span')
              ?.textContent?.trim();
            if (label === 'Бренд:') {
              searchedProductBrand =
                item.querySelector('.values span')?.textContent?.trim() || '';
            }
          });

          // const brandMatch = BRANDS.find((brand) =>
          //   searchedProductBrand.toLowerCase().includes(brand.toLowerCase()),
          // );

          // if (!brandMatch) {
          // return { found: false, shop: 'dvpt' };
          // }

          return {
            brend: searchedProductBrand,
            found: true,
            name: title,
            shop: 'dvpt',
            price,
          };
        }, BRANDS);

        results.push(productResult);
      } catch (err) {
        console.error(`Error for product ${name}:`, err);
        results.push({
          found: false,
          shop: SOURCE_WEBPAGE_KEYS.dvpt,
        });
      }
    }

    await browser.close();
    console.log(
      `Search time for "${productNumbers[0]} in shtren":`,
      performance.now() - start,
    );
    return results;
  } catch (browserErr) {
    console.error('Failed to launch browser:', browserErr);
    return productNumbers.map(() => ({
      shop: SOURCE_WEBPAGE_KEYS.dvpt,
      found: false,
    }));
  }
}
