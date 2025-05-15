import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';

export async function scrapeTruckmir(
  nameItem: string,
  count: string,
  brand: string,
): Promise<string> {
  const searchUrl = `https://truckmir.ru/parts/${brand}/${nameItem}`;

  let browser: Browser | null = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });

    const page: Page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0');

    await page.goto(searchUrl, {
      waitUntil: 'networkidle2',
    });

    // ⏳ Ждём, пока пропадёт индикатор загрузки (или 10 сек)
    await page.waitForFunction(
      () => {
        const el = document.querySelector('.processing_indicator p');
        return !el || el.textContent?.includes('не найдены') === false;
      },
      { timeout: 20000 },
    );

    const content: string = await page.content();
    const $ = cheerio.load(content);

    const product = $('.all_table_products tbody tr').eq(1);

    const title = product.find('.td_name span').text().trim() || '';
    const price = product.find('.td_price span').text().trim() || '';
    const availability =
      product.find('.td_exist span').text().trim() || 'Нет информации';
    const srok = product.find('.td_time_to_exe span').text().trim() || '';
    const sklad = product.find('.short_name_td').text().trim() || '';

    // if (!title && !price) {
    //   return `❌ [Truckmir] Товар "${nameItem}" не найден.`;
    // }

    return `✅ Найдено на truckmir.ru\nНазвание: ${title}\nБренд: ${brand}\nЦена: ${price}\nНаличие: ${availability}\nСрок: ${srok}\nСклад: ${sklad}`;
  } catch (error: unknown) {
    return `❌ Ошибка при обращении к Truckmir: ${
      error instanceof Error ? error.message : 'Неизвестная'
    }`;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
