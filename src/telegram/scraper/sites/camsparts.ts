import axios from 'axios';
import * as cheerio from 'cheerio';
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

      const brand = $$('.breadcrumb__item span[itemprop="name"]');
      const nameFromBreadcrumb = brand
        .map((i, el) => $$(el).text())
        .get()
        .join(' ');

      // Get the third word
      const words = nameFromBreadcrumb.trim().split(/\s+/);
      const thirdWord = words[2]; // 0-based index

      console.log(thirdWord); // Output: Cummins

      console.log(thirdWord);

      if (!thirdWord) {
        results.push({
          shop: SOURCE_WEBPAGE_KEYS.camsparts,
          found: false,
          name,
        });
        continue;
      }

      const priceText =
        $$('.price__new[itemprop="offers"] span[itemprop="price"]').attr(
          'content',
        ) || $$('.price__new[itemprop="offers"] span[itemprop="price"]').text();
      const price = priceText ? priceText.replace(/[^\d]/g, '') : BASICS.zero;

      results.push({
        shop: SOURCE_WEBPAGE_KEYS.camsparts,
        found: true,
        name,
        price,
        brand: thirdWord,
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
