import puppeteer from 'puppeteer';
import { SOURCE_URLS, SOURCE_WEBPAGE_KEYS } from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeIxora(
  productNumber: string,
): Promise<ScrapedProduct> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(SOURCE_URLS.ixora, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // write in search
    await page.type('#searchField', productNumber);
    await page.keyboard.press('Enter');

    // wating result
    await page.waitForSelector('.SearchResultTableRetail', { timeout: 15000 });

    const result = await page.evaluate(() => {
      const item = document.querySelector('.SearchResultTableRetail');
      // console.log(item);
      // if (!item) return { shop: SOURCE_WEBPAGE_KEYS.ixora, found: false };
      // const firstRow = item.querySelector('tbody tr.O');
      // if (!firstRow) return { shop: SOURCE_WEBPAGE_KEYS.ixora, found: false };
      // const title =
      //   firstRow.querySelector('.DetailName')?.textContent?.trim() ||
      //   'Неизвестно';
      // console.log(title);

      // const price =
      //   firstRow.querySelector('.PriceDiscount')?.textContent?.trim() ||
      //   'Не указана';

      // const quantity =
      //   firstRow.querySelector('td:nth-child(2)')?.textContent?.trim() || '0';

      // const available = parseInt(quantity.replace(/\D/g, '')) || 0;

      // if (title.toLowerCase().includes(name.toLowerCase())) {
      // }

      if (!item) return { shop: SOURCE_WEBPAGE_KEYS.ixora, found: false };
      return {
        shop: SOURCE_WEBPAGE_KEYS.ixora,
        found: true,
        name: 'exim',
        price: 'chka',
      };
    });

    await browser.close();
    return result;
  } catch (error: any) {
    await browser.close();
    console.error(`${SOURCE_WEBPAGE_KEYS.ixora} Error:`, error);
    return { shop: SOURCE_WEBPAGE_KEYS.ixora, found: false };
  }
}
