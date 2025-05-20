import axios from 'axios';
import * as cheerio from 'cheerio';
import {
  SOURCE_URLS,
  SOURCE_WEBPAGE_KEYS,
  BRANDS,
  BASICS,
} from 'src/constants/constants';
import { ScrapedProduct } from 'src/types/context.interface';

export async function scrapeMirDiesel(name: string): Promise<ScrapedProduct> {
  const result: ScrapedProduct = {
    name: BASICS.empotyString,
    price: BASICS.zero,
    found: false,
    shop: SOURCE_WEBPAGE_KEYS.mirdiesel,
    brand: BASICS.empotyString,
  };

  try {
    const searchQuery = name.trim().replace(/\s+/g, '+');
    const searchUrl = `${SOURCE_URLS.mirdiesel}catalog/?q=${searchQuery}`;

    const searchResponse = await axios.get(searchUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const $search = cheerio.load(searchResponse.data);

    // Get product link from search results
    const productLink = $search('table.list_item')
      .first()
      .find('a.thumb')
      .attr('href');
    if (!productLink) {
      return result;
    }

    const productUrl = `${SOURCE_URLS.mirdiesel.replace(/\/$/, '')}${productLink}`;

    console.log(productUrl);

    // Load product page
    const productResponse = await axios.get(productUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    const $ = cheerio.load(productResponse.data);

    const priceBlockText = $('div[class*="price"]').first().text().trim();
    console.log(priceBlockText, 'price');

    const priceMatch = priceBlockText.match(/(\d[\d\s]*)\s*₽/);
    const parsedPriceText = priceMatch
      ? priceMatch[1].replace(/\s/g, '')
      : null;

    let foundBrands = false;
    $('ul[id^="bx_"][id*="_prop_490_list"] li').each((_, el) => {
      const brandText: string = $(el).find('span.cnt').text().trim();

      if (BRANDS.includes(brandText)) {
        foundBrands = true;
        result.brand = brandText;
      }
    });

    const title = $('#pagetitle').text().trim();
    const russianWords =
      title.match(/[А-Яа-яЁё]+/g)?.join() || BASICS.empotyString;

    if (foundBrands) {
      result.name = russianWords;
      result.found = true;
      result.price = parsedPriceText;
      result.shop = SOURCE_WEBPAGE_KEYS.mirdiesel;
    }

    return result;
  } catch (error) {
    console.error(`${SOURCE_WEBPAGE_KEYS.mirdiesel} Error:`, error);
    return result;
  }
}
