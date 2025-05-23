import * as puppeteer from 'puppeteer';

import { ScrapedProduct } from 'src/types/context.interface';
import {
  BASICS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
} from 'src/constants/constants';
import axios from 'axios';

export async function scrapeTruckdrive(
  names: string[],
): Promise<ScrapedProduct[]> {
  const vendorCode = 'FT140FLLED';
  const vendorName = 'FRISTOM';
  const results = [];
  const url = `https://truckdrive.ru/offers?vendorCode=${vendorCode}&vendorName=${vendorName}&withCrosses=true`;

  const response = await axios.get(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      Accept: 'application/json',
    },
  });

  // const browser = await puppeteer.launch({ headless: true });
  // const results: ScrapedProduct[] = [];

  // try {
  //   const page = await browser.newPage();

  //   for (const name of names) {
  //     const start = performance.now();

  //     const result: ScrapedProduct = {
  //       shop: SOURCE_WEBPAGE_KEYS.truckdrive,
  //       found: false,
  //       price: BASICS.zero,
  //       name: BASICS.empotyString,
  //     };

  //     try {
  //       await page.goto(SOURCE_URLS.truckdrive, {
  //         waitUntil: 'domcontentloaded',
  //       });

  //       // Очистить поисковое поле (если нужно)
  //       await page.evaluate(() => {
  //         const input = document.querySelector(
  //           '#inputsearch_searchstring',
  //         ) as HTMLInputElement;
  //         if (input) input.value = '';
  //       });

  //       // Ввести имя в поле поиска и нажать Enter
  //       await page.type('#inputsearch_searchstring', name);
  //       await page.keyboard.press('Enter');
  //       try {
  //         // Սպասում ենք մինչև 2 վրկ, որ .search-without-results հայտնվի (դիվը կա, արդյունք չկա)
  //         await page.waitForSelector('.search-without-results', {
  //           timeout: 2000,
  //         });
  //         // Եթե հասավ այստեղ՝ կա արդյունք չգտնելու ինդիկատորը
  //         results.push({
  //           shop: SOURCE_WEBPAGE_KEYS.truckdrive,
  //           found: false,
  //           price: BASICS.zero,
  //           name: BASICS.empotyString,
  //         });
  //         continue;
  //       } catch (e) {
  //         console.log('es qu');
  //       }

  //       console.log('steaxa');

  //       // if (noResults) {
  //       //   // Արդյունքներ չկան, վերադարձնել անմիջապես false
  //       //   results.push({
  //       //     shop: SOURCE_WEBPAGE_KEYS.truckdrive,
  //       //     found: false,
  //       //     price: BASICS.zero,
  //       //     name: BASICS.empotyString,
  //       //   });
  //       // }
  //       // Ждать загрузки результата

  //       try {
  //         // Սպասում ենք մինչև 2 վրկ, որ .search-without-results հայտնվի (դիվը կա, արդյունք չկա)
  //         await page.waitForSelector('.offer__product-price span', {
  //           timeout: 10000,
  //         });
  //         // Եթե հասավ այստեղ՝ կա արդյունք չգտնելու ինդիկատորը
  //         results.push({
  //           shop: SOURCE_WEBPAGE_KEYS.truckdrive,
  //           found: false,
  //           price: BASICS.zero,
  //           name: BASICS.empotyString,
  //         });
  //         continue;
  //       } catch (e) {
  //         console.log('es qu');
  //       }
  //       // Извлечь данные
  //       const title = await page.$eval(
  //         '.product-name__decor-uppercase',
  //         (el) => el.textContent?.trim() ?? '',
  //       );
  //       const priceRaw = await page.$eval(
  //         '.offer__product-price span',
  //         (el) => el.textContent?.trim() ?? '',
  //       );
  //       const brandName = await page.$eval(
  //         '.catalog-products-table__product-brand',
  //         (el) => el.textContent?.trim() ?? '',
  //       );

  //       // Проверка бренда
  //       const matchedBrand = BRANDS.find((brand) =>
  //         brandName.toLowerCase().includes(brand.toLowerCase()),
  //       );
  //       if (!matchedBrand) {
  //         results.push(result);
  //         continue;
  //       }

  //       result.name = title;
  //       result.price = priceRaw;
  //       result.found = true;

  //       console.log(`Search time for "${name}":`, performance.now() - start);
  //       results.push(result);
  //     } catch (innerError) {
  //       console.error(
  //         `${SOURCE_WEBPAGE_KEYS.truckdrive} Error for "${name}":`,
  //         innerError,
  //       );
  //       results.push(result);
  //     }
  //   }
  // } catch (error) {
  //   console.error(`${SOURCE_WEBPAGE_KEYS.truckdrive} Unexpected Error:`, error);
  // } finally {
  //   await browser.close();
  // }

  return results;
}
