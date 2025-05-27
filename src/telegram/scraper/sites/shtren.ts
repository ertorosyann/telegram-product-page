import puppeteer, { ElementHandle } from 'puppeteer';
import {
  BASICS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeShtren(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const results: ScrapedProduct[] = [];

  const start = performance.now();
  try {
    for (const name of productNumbers) {
      const result: ScrapedProduct = {
        shop: SOURCE_WEBPAGE_KEYS.shtern,
        found: false,
      };

      try {
        await page.setRequestInterception(true);
        await page.setJavaScriptEnabled(false);
        page.on('request', (req) => {
          const resourceType = req.resourceType();
          if (
            ['image', 'stylesheet', 'font', 'media', 'script'].includes(
              resourceType,
            )
          ) {
            req.abort();
          } else {
            req.continue();
          }
        });
        await page.goto(SOURCE_URLS.shtern, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });

        await page.type('.aws-search-field', name);
        await page.keyboard.press('Enter');
        let summaryElement: ElementHandle | null = null;
        try {
          summaryElement = await page.waitForSelector(
            '.woocommerce-breadcrumb',
            {
              timeout: 3000,
            },
          );
        } catch {
          console.log('Limit ended');
        }
        if (!summaryElement) {
          continue;
        }

        const evaluationResult = await page.evaluate(
          (name, BRANDS, BASICS) => {
            const result: ScrapedProduct = {
              found: false,
              shop: 'shtern',
            };

            const item = document.querySelector('.summary');
            if (!item) return result;

            const title =
              item.querySelector('h1')?.textContent?.trim() ||
              BASICS.empotyString;
            const price =
              item
                .querySelector('.price span')
                ?.textContent?.trim()
                ?.replace(/\s|₽/g, '')
                .replace(',', '.') || BASICS.zero;

            const brandInPage =
              item.querySelector('.posted_in a')?.textContent?.trim() ||
              BASICS.empotyString;

            // const matchBrand = BRANDS.find((brand) =>
            //   brandInPage.toLowerCase().includes(brand.toLowerCase()),
            // );

            // if (
            //   matchBrand &&
            //   title.toLowerCase().includes(name.toLowerCase())
            // ) {
            result.found = true;
            result.name = title;
            result.price = price;
            result.brand = brandInPage;
            // }

            return result;
          },
          name,
          BRANDS,
          BASICS,
        );

        Object.assign(result, evaluationResult);
      } catch (error: any) {
        console.error(
          `${SOURCE_WEBPAGE_KEYS.shtern} Error for "${name}":`,
          error,
        );
      }

      results.push(result);
    }
  } finally {
    console.log(results);
    console.log(
      `Search time for "${productNumbers[0]} in shtren":`,
      performance.now() - start,
    );
    await browser.close();
  }

  return results;
}
