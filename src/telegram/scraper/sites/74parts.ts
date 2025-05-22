import { Page } from 'puppeteer';
import {
  BASICS,
  BRANDS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';
export async function scrape74Parts(
  productNumber: string,
  page: Page,
): Promise<ScrapedProduct> {
  const url = `${SOURCE_URLS.parts74}${encodeURIComponent(productNumber)}`;
  const start = performance.now();
  console.log(page);

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  );
  try {
    // Կասեցում ոչ անհրաժեշտ ռեսուրսների բեռնումից
    await page.setRequestInterception(true);
    await page.setJavaScriptEnabled(false);
    page.on('request', (req) => {
      const resourceType = req.resourceType();
      if (
        ['image', 'stylesheet', 'font', 'media', 'xhr', 'fetch'].includes(
          resourceType,
        )
      ) {
        req.abort();
      } else {
        req.continue();
      }
    });
    await Promise.all([page.goto(url, { timeout: 15000 })]);

    const result: ScrapedProduct = await page.$$eval(
      '.list_item_wrapp:first-of-type',
      ([item], BRANDS, EMPTY, PART74): ScrapedProduct => {
        if (!item) return { shop: PART74, found: false };

        const title =
          item
            .querySelector('.description_wrapp .item-title a')
            ?.textContent?.trim() ?? '';

        const matched = BRANDS.some((b) =>
          title.toLowerCase().includes(b.toLowerCase()),
        );
        if (!matched) return { shop: PART74, found: false };

        const price =
          item
            .querySelector('.information_wrapp .price .price_value')
            ?.textContent?.trim() || EMPTY;

        return {
          name: title,
          price,
          shop: PART74,
          found: true,
        };
      },
      BRANDS,
      BASICS.empotyString,
      SOURCE_WEBPAGE_KEYS.parts74,
    );

    console.log(result, `${Math.round(performance.now() - start)}ms`);
    return result;
  } catch (e) {
    console.error(`${SOURCE_WEBPAGE_KEYS.parts74} error:`, e);
    return { shop: SOURCE_WEBPAGE_KEYS.parts74, found: false };
  }
}
