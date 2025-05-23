import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
  BASICS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';
export async function scrapeCamsParts(
  names: string[],
): Promise<ScrapedProduct[]> {
  const results: ScrapedProduct[] = [];

  for (const name of names) {
    try {
      const start = performance.now();
      const searchQuery = name.trim().replace(/\s+/g, '+');
      const searchUrl = `${SOURCE_URLS.camsparts}${searchQuery}`;

      const response = await axios.get(searchUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      console.log(`Search time for "${name}":`, performance.now() - start);

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

      const fullTitle = $$('.shop_product__title[itemprop="name"]')
        .text()
        .trim();

      const matchedBrand = BRANDS.find((brand) =>
        fullTitle.toLowerCase().includes(brand.toLowerCase()),
      );

      if (!matchedBrand) {
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
    }
  }

  return results;
}
