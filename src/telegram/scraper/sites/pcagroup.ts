import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
  BASICS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapePcaGroup(name: string): Promise<ScrapedProduct> {
  try {
    const start = performance.now();
    const searchQuery = name.trim().replace(/\s+/g, '+');
    const searchUrl = `${SOURCE_URLS.pcagroup}${searchQuery}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(response.data);

    const productCard = $('.card').first(); // վերցնում ենք առաջին արդյունքը
    console.log(productCard.length);

    if (!productCard.length) {
      return {
        shop: SOURCE_WEBPAGE_KEYS.pcagroup,
        found: false,
      };
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
        return {
          shop: SOURCE_WEBPAGE_KEYS.pcagroup,
          found: false,
        };
      }
    }
    console.log(performance.now() - start, 'pcagroup');

    return {
      shop: SOURCE_WEBPAGE_KEYS.pcagroup,
      found: true,
      name: title,
      price: price || BASICS.zero,
    };
  } catch (error: any) {
    console.error(`${SOURCE_WEBPAGE_KEYS.pcagroup} Error:`, error);
    return { shop: SOURCE_WEBPAGE_KEYS.pcagroup, found: false };
  }
}
