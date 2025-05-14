import puppeteer from 'puppeteer';

export async function scrapeIMachinery(
  name: string,
  count: string,
  brand: string,
): Promise<string> {
  const url = `https://imachinery.ru/search/?q=${encodeURIComponent(name)}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const elementExists = await page.$('.red-marker');
    if (!elementExists) {
      await browser.close();
      return `❌ [iMachinery]"${name}" не найдено или отсутствует на складе.`;
    }

    const result = await page.evaluate(
      (name, brand) => {
        const items = document.querySelectorAll('li');
        // console.log(brand);

        for (const item of items) {
          const title = item.querySelector('b')?.textContent?.trim() || '';

          const price =
            item.querySelector('.pric')?.textContent?.trim() || 'Не указана';

          const brand = item.querySelector('.texte')?.textContent?.trim() || '';

          const available = parseInt(price.replace(/\D/g, '')) || 0;

          if (title.toLowerCase().includes(name.toLowerCase())) {
            return `✅ Найдено на imachinery.ru\nНазвание: ${title}\n Brand: ${brand} \nЦена: ${price}\nВ наличии: ${available} шт.`;
          }
        }

        return `❌ [iMachinery] Товар "${name}" не найден.`;
      },
      name,
      brand,
    );

    await browser.close();
    return result;
  } catch (error: any) {
    await browser.close();
    return `❌ Ошибка при обращении к iMachinery: ${error.message}`;
  }
}
