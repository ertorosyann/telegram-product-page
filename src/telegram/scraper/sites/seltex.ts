import axios, { AxiosError } from 'axios';
import * as cheerio from 'cheerio';
import { BRANDS } from 'src/constants/brends';

export async function scrapeSeltex(
  productNumber: string,
): Promise<{ name?: string; price?: string; shop?: string }> {
  const url = `https://www.seltex.ru/catalog/${productNumber}`;

  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data as string);

    const result: { name?: string; price?: string; shop: string } = {
      shop: 'seltex',
    };

    $('tbody tr').each((_, row) => {
      const tds = $(row).find('td');
      if (tds.length < 6) return;

      // clean up name cell (remove "Подробнее" <a>)
      tds.eq(1).find('a').remove();
      const nameText = tds.eq(1).text().trim().replace(/\s+/g, ' ');

      const matchedBrand = BRANDS.find((brand) =>
        nameText.toLowerCase().includes(brand.toLowerCase()),
      );

      if (matchedBrand) {
        const price = tds.eq(2).text().trim();
        // result = { name: nameText, price };
        result.name = nameText;
        result.price = price;
        return false; // break the loop
      }
    });

    return result;
  } catch (err: unknown) {
    const message =
      err instanceof AxiosError && err.message
        ? err.message
        : 'Unknown error on Seltex';
    console.error(`❌ [Seltex] Error: ${message}`);
    return {};
  }
}
