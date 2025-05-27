import puppeteer from 'puppeteer';
import {
  BASICS,
  BRANDS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrape74Parts(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const productNumber = productNumbers[0];
  const url = `${SOURCE_URLS.parts74}${encodeURIComponent(productNumber)}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const start = performance.now();
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const elementExists = await page.$('.list_item_wrapp');
    if (!elementExists) {
      await browser.close();
      return [
        {
          shop: SOURCE_WEBPAGE_KEYS.parts74,
          found: false,
        },
      ];
    }

    const result: ScrapedProduct = await page.evaluate(
      (
        productNumber: string,
        BRANDS: string[],
        shopKey: string,
        emptyString: string,
      ) => {
        const items = document.querySelectorAll('.list_item_wrapp');

        let fallback: { name: string; price: string } | null = null;

        for (const item of items) {
          const titleEl = item.querySelector('.item-title');
          const priceEl = item.querySelector('.price');

          const titleRaw = titleEl?.textContent;
          const priceRaw = priceEl?.textContent;

          const title = typeof titleRaw === 'string' ? titleRaw.trim() : '';
          const price = typeof priceRaw === 'string' ? priceRaw.trim() : '';

          const resPrice = (() => {
            if (price === '') return emptyString;
            const digitsOnly = price.replace(/\D+/g, '');
            return digitsOnly.length > 0 ? digitsOnly : emptyString;
          })();

          const lowerTitle = title.toLowerCase();
          const lowerProductNumber = productNumber.toLowerCase();

          if (lowerTitle.includes(lowerProductNumber)) {
            // Save first matched product number for fallback
            if (!fallback) {
              fallback = { name: title, price: resPrice };
            }

            const matchedBrand = BRANDS.find((brand) =>
              lowerTitle.includes(brand.toLowerCase()),
            );

            if (matchedBrand) {
              return {
                name: title,
                price: resPrice,
                shop: shopKey,
                found: true,
                brand: matchedBrand,
              };
            }
          }
        }

        if (fallback) {
          return {
            name: fallback.name,
            price: fallback.price,
            shop: shopKey,
            found: true,
            brand: '',
          };
        }

        return { shop: shopKey, found: false };
      },
      productNumber,
      BRANDS,
      SOURCE_WEBPAGE_KEYS.parts74,
      BASICS.zero,
    );

    await browser.close();
    console.log(result);
    console.log(
      `Search time for "${productNumbers[0]} in udt":`,
      performance.now() - start,
    );

    return [result];
  } catch (error: unknown) {
    await browser.close();
    console.error(`${SOURCE_WEBPAGE_KEYS.parts74} Error:`, error);
    return [{ shop: SOURCE_WEBPAGE_KEYS.parts74, found: false }];
  }
}
