import puppeteer from 'puppeteer';

export async function scrapeIxora(
  name: string,
  count: string,
  brand: string,
): Promise<string> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://b2b.ixora-auto.ru/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Ввод артикула в поиск
    await page.type('#searchField', name);
    await page.keyboard.press('Enter');

    // Вместо этого — ждём появления таблицы с результатами
    await page.waitForSelector('.SearchResultTableRetail', { timeout: 15000 });

    const result = await page.evaluate(
      (name, count, brand) => {
        const item = document.querySelector('.SearchResultTableRetail');
        if (!item) return '❌ [Ixora] Ничего не найдено.';

        const firstRow = item.querySelector('tbody tr.O');
        if (!firstRow) return '❌  [Ixora] Ничего не найдено.';

        const title =
          firstRow.querySelector('.DetailName')?.textContent?.trim() ||
          'Неизвестно';

        const findBrand = title.indexOf(brand);

        const price =
          firstRow.querySelector('.PriceDiscount')?.textContent?.trim() ||
          'Не указана';

        const quantity =
          firstRow.querySelector('td:nth-child(2)')?.textContent?.trim() || '0';

        const available = parseInt(quantity.replace(/\D/g, '')) || 0;
        // const requested = parseInt(count) || 1;

        if (title.toLowerCase().includes(name.toLowerCase())) {
          //   if (!brand || findBrand.toLowerCase().includes(brand.toLowerCase())) {
          // if (available >= requested) {
          return `🔍 Найдено на b2b.ixora-auto.ru\nНазвание: ${title}\nБренд: ${findBrand !== -1 ? brand : 'Неизвестно'}\nЦена: ${price}\nНа складе: ${available} шт.`;
          // } else {
          //   return `✅ Найдено на Ixora, но количество недостаточно\nНазвание: ${title}\nБренд: ${findBrand}\nЦена: ${price}\nНа складе: ${available} шт.`;
          // }
          //   }
        }

        return `❌ [Ixora] Товар "${name}" не найден или не соответствует бренду.`;
      },
      name,
      count,
      brand,
    );

    await browser.close();
    return result;
  } catch (error: any) {
    await browser.close();
    return `❌ Ошибка при обращении к Ixora: ${error.message}`;
  }
}
