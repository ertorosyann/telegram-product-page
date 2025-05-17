import puppeteer from 'puppeteer';

export async function scrapeDvPt(
  name: string,
  count: string,
  brand: string,
): Promise<string> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://dv-pt.ru/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Ввод артикула
    await page.type('#search_form_input', name);
    await page.keyboard.press('Enter');

    // Ждём появления результатов
    await page.waitForSelector('.goods', { timeout: 15000 });

    // Кликаем на первый товар
    const firstProductLinkSelector = '.goods a[itemprop="url"]';

    await page.waitForSelector(firstProductLinkSelector, { timeout: 10000 });
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
      page.click(firstProductLinkSelector),
    ]);

    // Ждём заголовок или что-то уникальное на странице товара
    await page.waitForSelector('h1', { timeout: 10000 });
    // Забираем информацию
    const result = await page.evaluate(() => {
      const title =
        document.querySelector('h1')?.textContent?.trim() || 'Неизвестно';
      const price =
        document.querySelector('.price')?.textContent?.trim() ||
        document.querySelector('.catalog_group_price')?.textContent?.trim() ||
        'Цена не указана';
      const brand =
        document
          .querySelector('.brand_img')
          ?.getAttribute('style')
          ?.match(/images\/brand\/(.+?)\.jpg/)?.[1] || 'Неизвестно';
      const quantity =
        document.querySelector('.info.inStock')?.textContent?.trim() ||
        'Нет в наличии';

      return `🔍 Найдено на voltag.ru\nНазвание: ${title}\nБренд: ${brand}\nЦена: ${price}\nНаличие: ${quantity}`;
    });
    // console.log(result);
    await browser.close();
    return result;
  } catch (error: any) {
    await browser.close();
    return `❌ Ошибка при обращении к dv-pt: ${error.message}`;
  }
}
