import puppeteer from 'puppeteer';
import { SOURCE_URLS, SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeIstkDeutz(
  productNumbers: string[],
  // page: Page,
): Promise<ScrapedProduct[]> {
  const results: ScrapedProduct[] = [];
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  for (const name of productNumbers) {
    const start = performance.now();

    const result: ScrapedProduct = {
      shop: SOURCE_WEBPAGE_KEYS.istk,
      found: false,
    };

    try {
      await page.goto(SOURCE_URLS.istk, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      await page.type('#title-search-input', name);

      await Promise.all([
        page.waitForNavigation({
          waitUntil: 'domcontentloaded',
          timeout: 15000,
        }),
        page.keyboard.press('Enter'),
      ]);
      // ✅ Check if "not found" message is present
      const notFoundTextExists = await page
        .$eval('p font.notetext', (el) =>
          el.textContent?.includes(
            'К сожалению, на ваш поисковый запрос ничего не найдено.',
          ),
        )
        .catch(() => false); // If the element is not found, safely return false

      if (notFoundTextExists) {
        results.push(result); // result.found is already false
        continue;
      }
      const productLinkElement = await page.$(
        'tbody tr .arrivals_product_title a',
      );

      if (!productLinkElement) {
        results.push(result);
        continue;
      }

      const productHref = await page.$eval(
        'tbody tr .arrivals_product_title a',
        (el) => el.getAttribute('href') || '',
      );

      if (!productHref) {
        throw new Error('Product link not found in search results');
      }

      const productUrl = new URL(
        productHref,
        'https://istk-deutz.ru',
      ).toString();
      await page.goto(productUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      const productTitle = await page.$eval(
        'div.title h1',
        (el) => el.textContent?.trim() || 'No title found',
      );

      let priceText = '';

      const priceElement =
        (await page.$('.price_noauth .price')) || (await page.$('div.price'));

      if (priceElement) {
        priceText = await page.evaluate(
          (el) => el.textContent?.trim() || '',
          priceElement,
        );
      }

      const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;

      result.name = productTitle;
      result.price = price;
      result.found = true;

      results.push(result);
      console.log(results);
      console.log(
        `Search time for "${productNumbers[0]} in istk":`,
        performance.now() - start,
      );
    } catch (error) {
      console.error(`${SOURCE_WEBPAGE_KEYS.istk} Error:`, error);
      results.push(result);
    }
  }

  return results;
}
