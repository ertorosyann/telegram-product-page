import puppeteer from 'puppeteer';

export async function scrape74Parts(
  name: string,
  count: string,
  brand: string,
): Promise<string> {
  const url = `https://74parts.ru/catalog/?q=${encodeURIComponent(name)}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const elementExists = await page.$('.list_item_wrapp');
    if (!elementExists) {
      await browser.close();
      return `❌ [74parts] "${name}" не найдено или отсутствует на складе.`;
    }

    const result = await page.evaluate(
      (name, count, brand) => {
        const items = document.querySelectorAll('.list_item_wrapp');
        for (const item of items) {
          const title =
            item.querySelector('.item-title')?.textContent?.trim() || '';
          const price =
            item.querySelector('.price')?.textContent?.trim() ||
            'Цена не указана';

          if (title.toLowerCase().includes(name.toLowerCase())) {
            // И дополнительно — проверка бренда
            if (!brand || title.toLowerCase().includes(brand.toLowerCase())) {
              return `✅ Найдено на 74parts.ru\nНазвание: ${title}\nБренда: ${brand} \nЦена: ${price}\nНа складе: есть`;
            }
          }
        }

        return `❌ [74parts] "${name}" не найдено или отсутствует на складе.`;
      },
      name,
      count,
      brand,
    );

    await browser.close();
    return result;
  } catch (error: any) {
    await browser.close();
    return `❌ Ошибка при обращении к 74parts.ru: ${error.message}`;
  }
}
