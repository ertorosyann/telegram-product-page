import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
  BASICS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapePcaGroup(
  names: string[],
): Promise<ScrapedProduct[]> {
  const results: ScrapedProduct[] = [];

  for (const name of names) {
    const searchQuery = name.trim().replace(/\s+/g, '+');
    const searchUrl = `${SOURCE_URLS.pcagroup}${searchQuery}`;

    try {
      const response = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });

      const $ = cheerio.load(response.data, {
        decodeEntities: true,
        xmlMode: false,
      });
      const productCard = $('.card').first();
      const artText = $('.card__art')
        .toArray()
        .map((el) => $(el).text().trim())
        .find((text) => text.startsWith('Артикул:'));

      const article = artText?.replace('Артикул:', '').trim(); // ➜ "PBD-275"

      if (!productCard.length || name !== article) {
        results.push({
          shop: SOURCE_WEBPAGE_KEYS.pcagroup,
          found: false,
        });
        continue;
      }

      const title = productCard.find('.card__title').text().trim();
      const price = productCard.find('.price').text().trim().replace(/\D/g, '');

      let brand: string | boolean = BRANDS.some((b) => {
        if (title.toLowerCase().includes(b.toLowerCase())) {
          return b;
        }
        return false;
      });

      if (!brand) {
        const brandFromDiv = $('.card__art')
          .toArray()
          .map((el) => $(el).text().trim())
          .find((text) => text.startsWith('Производитель:'));

        if (brandFromDiv) {
          brand = brandFromDiv.replace('Производитель:', '').trim();
        } else {
          results.push({
            shop: SOURCE_WEBPAGE_KEYS.pcagroup,
            found: false,
          });
          continue;
        }
      }

      results.push({
        shop: SOURCE_WEBPAGE_KEYS.pcagroup,
        found: true,
        name: title,
        price: price || BASICS.zero,
      });
    } catch (error: any) {
      console.error(`${SOURCE_WEBPAGE_KEYS.pcagroup} Error:`, error);
      results.push({
        shop: SOURCE_WEBPAGE_KEYS.pcagroup,
        found: false,
      });
    }
  }

  return results;
}
