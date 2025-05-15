import puppeteer from 'puppeteer';

export async function scrapeShtren(
  name: string,
  count: string,
  brand: string,
): Promise<string> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://xn--e1aqig3a.com/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Ввод артикула в поиск
    await page.type('.aws-search-field', name);
    await page.keyboard.press('Enter');

    // Вместо этого — ждём появления таблицы с результатами
    await page.waitForSelector('.summary', { timeout: 15000 });

    const result = await page.evaluate(
      (name, count, brand) => {
        const item = document.querySelector('.summary');
        if (!item) return '❌ [Shtren] Ничего не найдено.';

        const title =
          item.querySelector('h1')?.textContent?.trim() || 'Неизвестно';

        // const findBrand = title.indexOf(brand);

        const price =
          item.querySelector('.price span')?.textContent?.trim() ||
          'Не указана';

        const quantity = 'Неизвестно';

        // const requested = parseInt(count) || 1;

        if (title.toLowerCase().includes(name.toLowerCase())) {
          //   if (!brand || findBrand.toLowerCase().includes(brand.toLowerCase())) {
          // if (available >= requested) {
          return `🔍 Найдено на b2b.Shtren-auto.ru\nНазвание: ${title}\nБренд: ${'Неизвестно'}\nЦена: ${price}\nНа складе: ${quantity} шт.`;
          // } else {
          //   return `✅ Найдено на Shtren, но количество недостаточно\nНазвание: ${title}\nБренд: ${findBrand}\nЦена: ${price}\nНа складе: ${available} шт.`;
          // }
          //   }
        }

        return `❌ [Shtren] Товар "${name}" не найден или не соответствует бренду.`;
      },
      name,
      count,
      brand,
    );

    await browser.close();
    return result;
  } catch (error: any) {
    await browser.close();
    return `❌ Ошибка при обращении к Shtren: ${error.message}`;
  }
}
