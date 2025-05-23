import puppeteer from 'puppeteer';
import { ScrapedProduct } from 'src/types/context.interface';
import { SOURCE_WEBPAGE_KEYS, BRANDS } from 'src/constants/constants';

export async function udtTechnika(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const results: ScrapedProduct[] = [];

  for (const productNumber of productNumbers) {
    const result: ScrapedProduct = {
      shop: SOURCE_WEBPAGE_KEYS.udtTechnika,
      found: false,
    };

    try {
      await page.goto('https://www.udt-technika.ru/', {
        waitUntil: 'domcontentloaded',
      });

      await page.waitForSelector('#parts', { timeout: 5000 });
      await page.evaluate(() => {
        const input = document.querySelector<HTMLInputElement>('#parts');
        if (input) input.value = '';
      });

      await page.type('#parts', productNumber);
      await page.click('#button_search_1');

      await page.waitForSelector('.table-responsive', { timeout: 5000 });

      const productRow = await page.$$eval(
        '#patientTable tbody tr',
        (rows, BRANDS) => {
          for (const row of rows) {
            const cells = Array.from(row.querySelectorAll('td'));
            const name = cells[0]?.textContent?.trim() || '';
            const priceText = cells[6]?.textContent?.trim() || '';
            const brand = cells[7]?.textContent?.trim() || '';

            const priceMatch = priceText.match(/([\d\s]+) руб\./);
            const price = priceMatch
              ? parseFloat(priceMatch[1].replace(/\s/g, ''))
              : 0;

            const normalizedBrand = brand.toUpperCase();
            const match = BRANDS.find((b) =>
              normalizedBrand.includes(b.toUpperCase()),
            );

            if (match) {
              return {
                name,
                brand,
                price,
              };
            }
          }
          return null;
        },
        BRANDS,
      );

      if (productRow) {
        result.name = productRow.name;
        result.price = productRow.price;
        result.found = true;
      }
    } catch (err) {
      console.error(`Error fetching "${productNumber}":`, err);
    }

    results.push(result);
  }

  await browser.close();
  return results;
}
