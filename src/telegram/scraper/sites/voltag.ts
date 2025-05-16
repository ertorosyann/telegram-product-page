import puppeteer from 'puppeteer';

export async function scrapeVoltag(
  name: string,
  count: string,
  brand: string,
): Promise<string> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://voltag.ru/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Ввод артикула в поиск
    await page.type('#header_search_input', name);
    await page.keyboard.press('Enter');

    // ❗ НЕ ЖДИ НАВИГАЦИЮ
    // Вместо этого — ждём появления таблицы с результатами
    const time1 = performance.now();
    await page.waitForSelector('.catalog_group', { timeout: 15000 });

    const result = await page.evaluate(
      (name, count, brand) => {
        const firstRow = document.querySelector('.catalog_group');
        if (!firstRow) return '❌  [Voltag] Ничего не найдено.';

        const title =
          document.querySelector('header h1')?.textContent?.trim() ||
          'Неизвестно';

        const brandElement =
          document.querySelector('td.mnfr')?.textContent?.trim() ||
          'Неизвестно';

        const price =
          firstRow.querySelector('.catalog_group_price')?.textContent?.trim() ||
          'Не указана';

        const quantity =
          firstRow
            .querySelector('catalog_group_quantity')
            ?.textContent?.trim() || '0';

        if (title.toLowerCase().includes(name.toLowerCase())) {
          //   if (!brand || findBrand.toLowerCase().includes(brand.toLowerCase())) {
          // if (available >= requested) {
          return `🔍 Найдено на b2b.ixora-auto.ru\nCatalog Number:${name}\nНазвание: ${title}\nБренд: ${brandElement}\nЦена: ${price}\nНа складе: ${quantity} шт.`;
          // } else {
          //   return `✅ Найдено на Ixora, но количество недостаточно\nНазвание: ${title}\nБренд: ${findBrand}\nЦена: ${price}\nНа складе: ${available} шт.`;
          // }
          //   }
        }

        return `❌ [Voltag] Товар "${name}" не найден или не соответствует бренду.`;
      },
      name,
      count,
      brand,
    );
    // console.log(performance.now() - time1);

    await browser.close();
    return result;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return `❌ Ошибка при обращении к Voltag: ${error.message}`;
    }
    return `❌ Неизвестная ошибка при обращении к Voltag`;
  }
}
