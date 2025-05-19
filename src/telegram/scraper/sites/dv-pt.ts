import puppeteer from 'puppeteer';
import {
  BASICS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeDvPt(name: string): Promise<ScrapedProduct> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const result: ScrapedProduct = {
    price: BASICS.zero,
    name: BASICS.empotyString,
    found: false,
    shop: SOURCE_WEBPAGE_KEYS.dvpt,
  };

  const page = await browser.newPage();

  /* 1. — перехватываем логи из браузера, чтобы видеть их в терминале */
  page.on('console', (msg) => {
    // выводим только строки, чтобы не мешали объекты‑preview
    if (msg.type() === 'log') console.log(`[page] ${msg.text()}`);
  });

  // 2. — маскируемся под обычный браузер
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  );
  await page.setViewport({ width: 1280, height: 800 });

  try {
    /* 3. — поиск по сайту */
    await page.goto(SOURCE_URLS.dvpt, {
      waitUntil: 'domcontentloaded',
      timeout: 30_000,
    });
    await page.type('#search_form_input', name);

    await Promise.all([
      page.waitForResponse(
        (r) => r.url().includes('/search') && r.status() === 200,
        { timeout: 10_000 },
      ),
      page.click('input[type="submit"][title="Искать"]'),
    ]);

    /* 4. — проверяем, есть ли результаты */
    await page.waitForSelector('.goods', { timeout: 10_000 });
    const productExists = await page.$('.goods a[itemprop="url"]');
    if (!productExists) {
      await browser.close();
      return result;
    }

    /* 5. — переходим на карточку первого товара */
    const firstProductLinkSelector = '.goods a[itemprop="url"]';
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click(firstProductLinkSelector),
    ]);

    await page.waitForSelector('h1', { timeout: 10_000 });

    /* 6. — оцениваем данные, передавая BRANDS внутрь */
    const res = await page.evaluate((brands) => {
      const title = document.querySelector('h1')?.textContent?.trim() || '';
      console.log('title =', title);

      const priceText =
        document.querySelector('.price')?.textContent?.trim() ||
        document.querySelector('.catalog_group_price')?.textContent?.trim() ||
        '0';
      const price = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;

      /* --- определяем бренд --- */
      let searchedProductBrand = '';
      document.querySelectorAll('.item').forEach((item) => {
        const label = item.querySelector('.title span')?.textContent?.trim();
        if (label === 'Бренд:') {
          searchedProductBrand =
            item.querySelector('.values span')?.textContent?.trim() ||
            searchedProductBrand;
        }
      });

      const brandMatch = brands.find((b) =>
        searchedProductBrand.toLowerCase().includes(b),
      );

      if (!brandMatch) {
        return { found: false, name: '', shop: 'dvpt', price: 0 };
      }

      return { found: true, name: title, shop: 'dvpt', price };
    }, BRANDS /* ← передаём массив в браузер */);

    Object.assign(result, res);
    await browser.close();
    return result;
  } catch (error) {
    console.error(`${SOURCE_WEBPAGE_KEYS.dvpt} Error:`, error);
    await browser.close();
    return { shop: SOURCE_WEBPAGE_KEYS.dvpt, found: false };
  }
}
