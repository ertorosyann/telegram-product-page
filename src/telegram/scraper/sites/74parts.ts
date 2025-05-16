import puppeteer from 'puppeteer';
import { BRANDS } from 'src/constants/brends';

export async function scrape74Parts(
  name: string,
): Promise<{ name?: string; price?: string }> {
  const url = `https://74parts.ru/catalog/?q=${encodeURIComponent(name)}`;
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const elementExists = await page.$('.list_item_wrapp');
    if (!elementExists) {
      await browser.close();
      return {};
    }

    const result = await page.evaluate(
      (name, BRANDS) => {
        const items = document.querySelectorAll('.list_item_wrapp');
        for (const item of items) {
          const title =
            item.querySelector('.item-title')?.textContent?.trim() || '';
          const price = item.querySelector('.price')?.textContent?.trim() || '';

          const lowerTitle = title.toLowerCase();

          if (lowerTitle.includes(name.toLowerCase())) {
            const matchedBrand = BRANDS.find((brand) =>
              lowerTitle.includes(brand.toLowerCase()),
            );

            if (matchedBrand) {
              return {
                name: title,
                price,
              };
            }
          }
        }

        return {};
      },
      name,
      BRANDS,
    );

    await browser.close();
    return result;
  } catch (error: any) {
    await browser.close();
    console.error(`❌ [74parts] Error: ${error.message}`);
    return {};
  }
}
