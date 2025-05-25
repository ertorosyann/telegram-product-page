import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  BASICS,
  BRANDS,
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeIMachinery(
  productNumbers: string[],
): Promise<ScrapedProduct[]> {
  const start = performance.now();
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  };

  const tasks = productNumbers.map(async (productNumber) => {
    const url = `${SOURCE_URLS.imachinery}${encodeURIComponent(productNumber)}`;
    try {
      const response = await axios.get(url, { headers });
      const $ = cheerio.load(response.data as string);

      const result: ScrapedProduct = {
        shop: SOURCE_WEBPAGE_KEYS.imachinery,
        found: false,
      };

      const bTag = $('b')
        .filter((_, el) => $(el).text().includes('из'))
        .first();

      const matchB = $(bTag)
        .text()
        .match(/\d+\s*из\s*(\d+)/);
      const countOfproduct = matchB ? parseInt(matchB[1], 10) : 0;

      let fallbackProduct: ScrapedProduct | null = null;

      $('.result-item .red-marker li')
        .slice(0, countOfproduct)
        .each((i, el) => {
          const name = $(el).find('b').first().text().trim();
          const splitedName = name.split(' ');
          const matchName = splitedName.find(
            (e) => e.toLowerCase() === productNumber.toLowerCase(),
          );
          if (!matchName) {
            return false;
          }

          const priceText = $(el).find('b.pric').text().trim();
          const price = priceText.replace(/^Цена:\s*/i, '').replace(/\D/g, '');

          const productionInfo = $('.texte span')
            .filter((_, el) => $(el).text().includes('Производство'))
            .first()
            .text()
            .trim();

          const brandMatch = productionInfo.match(/Производство\s*-\s*(\w+)/);
          const brandName = brandMatch ? brandMatch[1] : null;

          // Սահմանենք fallback եթե առաջին ապրանքն է
          if (i === 0 && brandName) {
            fallbackProduct = {
              shop: SOURCE_WEBPAGE_KEYS.imachinery,
              name,
              price:
                price.trim() !== '' && !isNaN(+price) ? price : BASICS.zero,
              found: true,
              brand: brandName,
            };
          }

          // Եթե բրենդը չի գտնվել կամ դատարկ է
          if (!brandName || !brandName.trim() || !name) {
            return;
          }

          const matchedBrand = BRANDS.find((brand) => brandName === brand);
          if (matchedBrand) {
            result.name = name;
            result.price =
              price.trim() !== '' && !isNaN(+price) ? price : BASICS.zero;
            result.found = true;
            result.brand = brandName;
            return false; // break .each
          }
        });

      // Եթե որևէ բրենդ չի գտնվել, օգտագործի fallback
      if (!result.found && fallbackProduct) {
        return fallbackProduct;
      }

      return result;
    } catch (error: unknown) {
      console.error(`${SOURCE_WEBPAGE_KEYS.imachinery} Error:`, error);
      return { shop: SOURCE_WEBPAGE_KEYS.imachinery, found: false };
    }
  });

  const settledResults = await Promise.allSettled(tasks);

  const res = settledResults.map((res) => {
    if (res.status === 'fulfilled') {
      return res.value;
    } else {
      return { shop: SOURCE_WEBPAGE_KEYS.imachinery, found: false };
    }
  });

  console.log(res);
  console.log(
    `Search time for "${productNumbers[0]} in imachinery":`,
    performance.now() - start,
  );
  return res;
}
