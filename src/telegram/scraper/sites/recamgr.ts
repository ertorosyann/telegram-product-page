import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  BASICS,
  BRANDS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeRecamgr(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const results: ScrapedProduct[] = [];

  for (const name of productNumbers) {
    const start = performance.now();

    const fallbackResult: ScrapedProduct = {
      shop: SOURCE_WEBPAGE_KEYS.recamgr,
      found: false,
    };

    try {
      const searchUrl = `${SOURCE_URLS.recamgr}${encodeURIComponent(name)}`;

      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      const $ = cheerio.load(response.data);

      const searchLength = $('.text.search-legend');
      const searchLengthText = searchLength.text().trim();
      const matches = searchLengthText.match(/\d+/g);
      const foundedProductCount = matches
        ? parseInt(matches[matches.length - 1], 10)
        : null;

      if (!foundedProductCount) {
        results.push(fallbackResult);
        continue;
      }

      const products = $('.goods__item');
      if (!products.length) {
        results.push(fallbackResult);
        continue;
      }
      const productsArray = products.toArray();

      let matchedProduct: ScrapedProduct | null = null;

      for (const el of productsArray) {
        const product = $(el);
        const title = product.find('.lnk').text().trim() || 'Без названия';

        const words = title
          .replace(/[()]/g, '')
          .split(/\s+/)
          .map((word) => word.toLowerCase());

        const matchBrand = BRANDS.find((brand) => {
          const brandLower = brand.toLowerCase();

          return words.some((word) => word === brandLower);
        });

        const rawPrice =
          product.find('.price .new_price .price__value').text().trim() ||
          BASICS.zero;
        const price = rawPrice.replace(/\s*₽$/, '');

        if (matchBrand) {
          matchedProduct = {
            shop: SOURCE_WEBPAGE_KEYS.recamgr,
            found: true,
            name: title,
            price: price,
            brand: matchBrand,
          };
          break; // այստեղ կանգ ենք առնում, երբ գտնում ենք առաջինը
        }
      }

      if (matchedProduct) {
        results.push(matchedProduct);
      } else {
        const firstProduct = products.first();
        const title = firstProduct.find('.lnk').text().trim() || 'Без названия';
        const rawPrice =
          firstProduct.find('.price .new_price .price__value').text().trim() ||
          BASICS.zero;
        const price = rawPrice.replace(/\s*₽$/, '');
        const words = title
          .replace(/[()]/g, '')
          .split(/\s+/)
          .map((word) => word.toLowerCase());
        const matchBrand = BRANDS.find((brand) => {
          const brandLower = brand.toLowerCase();

          return words.some((word) => word === brandLower);
        });
        let brendOfFirstProduct = matchBrand;
        if (!brendOfFirstProduct) {
          brendOfFirstProduct = title;
        }
        results.push({
          shop: SOURCE_WEBPAGE_KEYS.recamgr,
          found: true,
          name: title,
          price: price,
          brand: brendOfFirstProduct,
        });
      }
    } catch (error: any) {
      console.error(
        `${SOURCE_WEBPAGE_KEYS.recamgr} Error for "${name}":`,
        error,
      );
      results.push(fallbackResult);
    } finally {
      console.log(results);

      console.log(
        `Search time for "${name} in Recmagr":`,
        performance.now() - start,
      );
    }
  }

  return results;
}
