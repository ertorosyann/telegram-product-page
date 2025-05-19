import puppeteer from 'puppeteer';
import {
  BASICS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

// Вспомогательная функция задержки
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function scrapeShtren(name: string): Promise<ScrapedProduct> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const result: ScrapedProduct = {
    shop: SOURCE_WEBPAGE_KEYS.shtern,
    found: false,
  };

  try {
    await page.goto(SOURCE_URLS.shtern, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Ввод артикула в поиск
    await page.type('.aws-search-field', name);
    await page.keyboard.press('Enter');

    // Повторное ожидание селектора с паузами
    const MAX_TRIES = 4;
    const TRY_TIMEOUT = 2500;
    const PAUSE_BETWEEN = 700;
    let foundSummary = false;

    for (let i = 0; i < MAX_TRIES; i++) {
      try {
        await page.waitForSelector('.summary', { timeout: TRY_TIMEOUT });
        foundSummary = true;
        break;
      } catch (_) {
        if (i < MAX_TRIES - 1) {
          await delay(PAUSE_BETWEEN);
        }
      }
    }

    if (!foundSummary) {
      throw new Error('Selector .summary not found after multiple tries');
    }

    // Получаем данные с сайта
    const evaluationResult = await page.evaluate(
      (name, BRANDS, BASICS) => {
        const result: ScrapedProduct = {
          found: false,
          shop: 'shtern',
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
