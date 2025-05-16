import axios from 'axios';
import cheerio from 'cheerio';

const BASE_URL = 'https://istk-deutz.ru';

export async function scrapeIstkDeutz(article: string) {
  try {
    const searchUrl = `${BASE_URL}/search/?q=${article}`;
    const response = await axios.get(searchUrl);
    const html = response.data;

    const $ = cheerio.load(html);

    const productLink = $('.arrivals_product_title a').attr('href');

    if (!productLink) {
      console.log('Товар не найден.');
      return null;
    }

    const fullProductUrl = new URL(productLink, BASE_URL).href;
    console.log('Найден товар по ссылке:', fullProductUrl);

    // return await parseProductPage(fullProductUrl);
  } catch (error: any) {
    console.error('Ошибка поиска:', error.message);
    return null;
  }
}

async function parseProductPage(url: string) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('h1').text().trim();
    const description = $('.product_content_text').text().trim();
    const breadcrumbs = $('.bread_crumbs a')
      .map((_, el) => $(el).text().trim())
      .get()
      .join(' > ');

    const result = {
      title,
      description,
      breadcrumbs,
      url,
    };

    console.log(result);
    return result;
  } catch (error: any) {
    console.error('Ошибка парсинга страницы товара:', error.message);
    return null;
  }
}

// Пример вызова:
scrapeIstkDeutz('04516789');
