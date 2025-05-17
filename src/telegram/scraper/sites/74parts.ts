import puppeteer from 'puppeteer';
import {
  BASICS,
  BRANDS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrape74Parts(
  productNumber: string,
): Promise<ScrapedProduct> {
  const url = `${SOURCE_URLS.parts74}${encodeURIComponent(productNumber)}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const elementExists = await page.$('.list_item_wrapp');
    if (!elementExists) {
      await browser.close();
      return { shop: SOURCE_WEBPAGE_KEYS.parts74, found: false };
    }

    const result: ScrapedProduct = await page.evaluate(
      (
        productNumber: string,
        BRANDS: string[],
        shopKey: string,
        emptyString: string,
      ) => {
        const items = document.querySelectorAll('.list_item_wrapp');

        for (const item of items) {
          const titleEl = item.querySelector('.item-title');
          const priceEl = item.querySelector('.price');

          const titleRaw = titleEl?.textContent;
          const priceRaw = priceEl?.textContent;

          const title = typeof titleRaw === 'string' ? titleRaw.trim() : '';
          const price = typeof priceRaw === 'string' ? priceRaw.trim() : '';

          const resPrice =
            price !== '' && !Number.isNaN(Number(price)) ? emptyString : price;

          const lowerTitle = title.toLowerCase();

          if (lowerTitle.includes(productNumber.toLowerCase())) {
            const matchedBrand = BRANDS.find((brand) =>
              lowerTitle.includes(brand.toLowerCase()),
            );

            if (matchedBrand) {
              return {
                productNumber: title,
                resPrice,
                shop: shopKey,
                found: true,
              };
            }
          }
        }

        return { shop: shopKey, found: false };
      },
      productNumber,
      BRANDS,
      SOURCE_WEBPAGE_KEYS.parts74,
      BASICS.empotyStrin,
    );

    await browser.close();
    return result;
  } catch (error: unknown) {
    await browser.close();

    // Optional: add type guard if you want to log error.message safely
    if (error instanceof Error) {
      console.error(`${SOURCE_WEBPAGE_KEYS.parts74} Error:`, error.message);
    } else {
      console.error(`${SOURCE_WEBPAGE_KEYS.parts74} Unknown error:`, error);
    }

    return { shop: SOURCE_WEBPAGE_KEYS.parts74, found: false };
  }
}
