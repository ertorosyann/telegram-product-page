import puppeteer from 'puppeteer';

export async function scrapeImpartWithPuppeteer(
  name: string,
  count: string,
  brand: string,
): Promise<string> {
  const url = `https://impart.online/catalog/search/?q=${encodeURIComponent(name)}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, {
      waitUntil: 'networkidle2', // Ждём полной загрузки
      timeout: 60000,
    });

    // Проверяем, есть ли товар
    const elementExists = await page.$('.search-result-table-item');
    if (!elementExists) {
      return `❌ [Impart] "${name}" не найдено или отсутствует на складе.`;
    }

    // Выполняем скрипт на клиенте
    const result = await page.evaluate(
      (name, count) => {
        const items = document.querySelectorAll('.search-result-table-item');
        for (const item of items) {
          const title =
            item
              .querySelector('.search-result-table-text')
              ?.textContent?.trim() || '';

          const nowQuantity =
            item
              .querySelector('.search-result-table-quantity')
              ?.textContent?.trim() || '';

          const discountPrice = item.querySelector(
            '.search-result-table-price .text-black',
          );
          const fullPrice = item.querySelector('.search-result-table-price');

          const price = discountPrice
            ? discountPrice.textContent?.trim()
            : fullPrice?.textContent?.trim() || 'Не указана';

          const available = parseInt(nowQuantity.replace(/\D/g, '')) || 0;
          const requested = parseInt(count) || 0;

          if (
            title.toLowerCase().includes(name.toLowerCase()) &&
            available >= requested
          ) {
            return `✅ Найдено на impart.online\nНазвание: ${title}\nЦена: ${price}\nНа складе: ${available} шт.\nВы запросили: ${requested} шт.`;
          }
        }
        return `❌ [Impart] Product "${name}" not found.`;
      },
      name,
      count,
    );

    await browser.close();
    return result;
  } catch (error: any) {
    await browser.close();
    return `❌ Ошибка при обращении к Impart: ${error.message}`;
  }
}
