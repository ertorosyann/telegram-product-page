import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeMirDiesel(name: string): Promise<ScrapedProduct> {
  const result: ScrapedProduct = {
    found: false,
    shop: SOURCE_WEBPAGE_KEYS.mirdiesel,
  };

  try {
    const searchQuery = name.trim().replace(/\s+/g, '+');
    // const searchUrl = `${SOURCE_URLS.mirdiesel}catalog/?q=${searchQuery}&s=Найти`;
    const searchUrl = `${SOURCE_URLS.mirdiesel}catalog/?q=${searchQuery}`;

    const searchResponse = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const $search = cheerio.load(searchResponse.data);

    // Get product link from search results
    const productLink = $search('.list_item')
      .first()
      .find('a.thumb')
      .attr('href');
    if (!productLink) {
      return result;
    }

    const productUrl = `${SOURCE_URLS.mirdiesel.replace(/\/$/, '')}${productLink}`;

    // Load product page
    const productResponse = await axios.get(productUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const $ = cheerio.load(productResponse.data);

    const priceBlockText = $('span[class*="price"]').first().text().trim();
    const priceMatch = priceBlockText.match(/(\d[\d\s]*)\s*₽/);
    const parsedPriceText = priceMatch
      ? priceMatch[1].replace(/\s/g, '')
      : null;

    let foundBrands = false;
    $('ul[id^="bx_"][id*="_prop_490_list"] li').each((_, el) => {
      const brandText = $(el).find('span.cnt').text().trim();

      if (BRANDS.includes(brandText)) {
        foundBrands = true;
      }
    });

    const title = $('#pagetitle').text().trim();

    if (foundBrands) {
      return {
        name: title,
        price: parsedPriceText,
        found: true,
        shop: SOURCE_WEBPAGE_KEYS.mirdiesel,
      };
    }

    return result;
  } catch (error) {
    console.error(`${SOURCE_WEBPAGE_KEYS.mirdiesel} Error:`, error);
    return result;
  }
}
