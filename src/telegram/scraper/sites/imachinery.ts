import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { BRANDS } from 'src/constants/brends';
export async function scrapeIMachinery(
  productNumber: string,
): Promise<{ name?: string; price?: string; shop?: string }> {
  const url = `https://imachinery.ru/search/?q=${encodeURIComponent(productNumber)}`;
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
  };

  try {
    const response = await axios.get(url, { headers });
    const $ = cheerio.load(response.data as string);

    let foundProduct: { name: string; price: string; shop: string } | undefined;

    $('.result-item li').each((_, el) => {
      const name = $(el).find('b').first().text().trim();
      const priceText = $(el).find('b.pric').text().trim();
      const price = priceText.replace(/^Цена:\s*/, '');
      // console.log(name, priceText, price);

      const matchedBrand = BRANDS.find((brand) =>
        name.toLowerCase().includes(brand.toLowerCase()),
      );

      if (matchedBrand) {
        foundProduct = { name, price, shop: 'imachinery' };
        return false; // break .each
      }
    });
    // console.log(foundProduct);

    return foundProduct ?? {};
  } catch (err: unknown) {
    const message =
      err instanceof AxiosError && err.message
        ? err.message
        : 'Unknown error on imachinery.ru';
    console.error(`❌ [IMachinery] Error: ${message}`);
    return {};
  }
}
