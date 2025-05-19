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
    const searchQuery = name.trim().replace(/\s+/g, '+');
    const searchUrl = `${SOURCE_URLS.pcagroup}${searchQuery}`;

    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $ = cheerio.load(response.data);
    const productLink = $('.card__image').attr('href');

    if (!productLink) {
      return { shop: SOURCE_WEBPAGE_KEYS.pcagroup, found: false };
    }

    //product detail page
    const productPage = await axios.get(productLink, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
      },
    });

    const $$ = cheerio.load(productPage.data);

    const brand = $$('li:has(span:contains("Производитель")) span')
      .last()
      .text()
      .trim();
    const title = $$('h1.product__title').text().trim();
    const priceText = $$('.product_price_wr .product_price ') // is not true
      .text()
      .trim()
      .replace(/\s|₽/g, '')
      .replace(',', '.');

    // check brand
    const isBrandValid = BRANDS.some((b) =>
      brand.toLowerCase().includes(b.toLowerCase()),
    );
    if (!isBrandValid) {
      return {
        shop: SOURCE_WEBPAGE_KEYS.pcagroup,
        found: false,
      };
    }
    console.log(
      'finded price ',
      priceText,
      'nan check  = ',
      !isNaN(+priceText),
    );
    const price = !isNaN(+priceText) ? priceText : BASICS.zero;
    return {
      shop: SOURCE_WEBPAGE_KEYS.pcagroup,
      found: true,
      name: title,
      price,
    };
  } catch (error: any) {
    console.error(`${SOURCE_WEBPAGE_KEYS.pcagroup} Error:`, error);
    return { shop: SOURCE_WEBPAGE_KEYS.pcagroup, found: false };
  }
}
