import puppeteer from 'puppeteer';
import {
  BASICS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeShtren(name: string): Promise<ScrapedProduct> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const result: ScrapedProduct = {
    shop: SOURCE_WEBPAGE_KEYS.shtern,
    found: false,
    price: BASICS.zero,
  };
  try {
    await page.goto(SOURCE_URLS.shtern, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Ввод артикула в поиск
    await page.type('.aws-search-field', name);
    await page.keyboard.press('Enter');

    // Вместо этого — ждём появления таблицы с результатами
    await page.waitForSelector('.summary', { timeout: 15000 });

    const evaluationResult = await page.evaluate(
      (name, BRANDS, BASICS) => {
        const result = {
          found: false,
          name: BASICS.empotyString,
          price: BASICS.zero,
        };

        const item = document.querySelector('.summary');
        if (!item) return result;

        const title =
          item.querySelector('h1')?.textContent?.trim() || BASICS.empotyString;
        const price =
          item
            .querySelector('.price span')
            ?.textContent?.trim()
            ?.replace(/\s|₽/g, '')
            .replace(',', '.') || BASICS.zero;

        const brandInPAge =
          item.querySelector('.posted_in a')?.textContent?.trim() ||
          BASICS.empotyString;

        const matchBrand = BRANDS.find((brand) =>
          brandInPAge.toLowerCase().includes(brand.toLowerCase()),
        );

        if (matchBrand && title.toLowerCase().includes(name.toLowerCase())) {
          result.found = true;
          result.name = title;
          result.price = price;
        }

        return result;
      },
      name,
      BRANDS,
      BASICS,
    );

    Object.assign(result, evaluationResult);

    await browser.close();
    return result;
  } catch (error: any) {
    await browser.close();
    console.error(`${SOURCE_WEBPAGE_KEYS.shtern} Error:`, error);
    return { shop: SOURCE_WEBPAGE_KEYS.shtern, found: false };
  }
}
