import axios from 'axios';
import * as cheerio from 'cheerio';
import { title } from 'process';
import {
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  // BRANDS,
  BASICS,
} from 'src/constants/constants';

import { ScrapedProduct } from 'src/types/context.interface';
export async function scrapeCamsParts(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const start = performance.now();
  const results: ScrapedProduct[] = [];

  for (const name of productNumbers) {
    try {
      const searchQuery = name.trim().replace(/\s+/g, '+');
      const searchUrl = `${SOURCE_URLS.camsparts}${searchQuery}`;

      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      const $ = cheerio.load(response.data);
      const firstProduct = $('.product__list .product').first();

      const relativeLink = firstProduct.find('a.product__img').attr('href');
      if (!relativeLink) {
        results.push({
          shop: SOURCE_WEBPAGE_KEYS.camsparts,
          found: false,
          name,
        });
        continue;
      }

      const productUrl = `https://camsparts.ru${relativeLink}`;
      const productPage = await axios.get(productUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });

      const $$ = cheerio.load(productPage.data);

      // const fullTitle = $$('.shop_product__title[itemprop="name"]')
      // .text()
      // .trim();
      // const titleArray = fullTitle.split(' ');

      // let matchedBrand: boolean | string | undefined = BRANDS.find((brand) => {
      //   const regex = new RegExp(`\\b${brand}\\b`, 'i'); // \b ensures whole word match
      //   return regex.test(fullTitle);
      // });
      // if (!matchedBrand) {
      //   for (const word of titleArray) {
      //     if (
      //       BRANDS.some((brand) => brand.toLowerCase() === word.toLowerCase())
      //     ) {
      //       matchedBrand = true;
      //       break;
      //     }
      //   }
      // }

      // const matchedBrand = BRANDS.find((brand) => {});
      const brendOfProduct = title.match(/(\b\w+)\s*\/\s*/);

      if (!brendOfProduct) {
        results.push({
          shop: SOURCE_WEBPAGE_KEYS.camsparts,
          found: false,
          name,
        });
        continue;
      }

      const breadcrumbItems = $$('.breadcrumb__item span[itemprop="name"]');
      const nameFromBreadcrumb = breadcrumbItems.last().text().trim();
      const priceText =
        $$('.price__new[itemprop="offers"] span[itemprop="price"]').attr(
          'content',
        ) || $$('.price__new[itemprop="offers"] span[itemprop="price"]').text();
      const price = priceText ? priceText.replace(/[^\d]/g, '') : BASICS.zero;

      results.push({
        shop: SOURCE_WEBPAGE_KEYS.camsparts,
        found: true,
        name: nameFromBreadcrumb,
        price,
        brand: brendOfProduct[1],
      });
    } catch (error) {
      console.error(
        `${SOURCE_WEBPAGE_KEYS.camsparts} Error for "${name}":`,
        error,
      );
      results.push({
        shop: SOURCE_WEBPAGE_KEYS.camsparts,
        found: false,
        name,
      });
    } finally {
      console.log(results);

      console.log(
        `Search time for "${productNumbers[0]} in camsparts":`,
        performance.now() - start,
      );
    }
  }

  return results;
}
