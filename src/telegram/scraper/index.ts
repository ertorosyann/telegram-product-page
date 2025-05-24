import { ScrapedProduct } from 'src/types/context.interface';
import { Cluster } from 'puppeteer-cluster';

import { scrapeSeltex } from './sites/seltex'; // done 100% ++++++++++++++++++
import { scrapeIMachinery } from './sites/imachinery'; // done 100% ++++++++++++++++++
import { scrape74Parts } from './sites/74parts'; // done 100% ++++++++++++++++++
import { scrapePcaGroup } from './sites/pcagroup'; // done 100% ++++++++++++++++++
import { scrapeCamsParts } from './sites/camsparts'; // done 100% ++++++++++++++++++
import { scrapeRecamgr } from './sites/recamgr'; // done 100% ++++++++++++++++++
import { scrapeIstkDeutz } from './sites/istk-deutz'; // done 100% ++++++++++++++++++
import { intertrek } from './sites/intertrek.info'; // done 100% ++++++++++++++++++
import { scrapeIxora } from './sites/ixora'; // done 100% ++++++++++++++++++  hamapatasxanox brand chka
import { scrapeDvPt } from './sites/dv-pt'; //
import { scrapeVoltag } from './sites/voltag'; //
import { scrapeTruckdrive } from './sites/truckdrive'; //piti nayvi errora qcum u chisht artikul dnenq toshni chi
import { scrapeShtren } from './sites/shtren'; // done 100% ++++++++++++++++++   miqich dandaxacnuma
import { udtTechnika } from './sites/udtTechnika';
import { scrapeImpart } from './sites/impart'; // done 100% ++++++++++++++++++

// Scrapers config
const scrapers: {
  name: string;
  fn: (productNames: string[], page?: any) => Promise<ScrapedProduct[]>;
  usePuppeteer: boolean;
}[] = [
  { name: 'Seltex', fn: scrapeSeltex, usePuppeteer: false }, //+ fast
  { name: 'Pcagroup', fn: scrapePcaGroup, usePuppeteer: false }, // + fast
  { name: 'Imachinery', fn: scrapeIMachinery, usePuppeteer: false }, //+ fast
  { name: 'Recamgr', fn: scrapeRecamgr, usePuppeteer: false }, // + fast
  { name: 'Spb.camsparts', fn: scrapeCamsParts, usePuppeteer: false }, // + fast
  { name: 'Shtren', fn: scrapeShtren, usePuppeteer: false }, // + dandax 5000
  { name: 'Voltag', fn: scrapeVoltag, usePuppeteer: false }, // + dandax
  { name: 'udtTechnika', fn: udtTechnika, usePuppeteer: false }, // +  dandax
  { name: '74Parts', fn: scrape74Parts, usePuppeteer: false }, // + dandax
  { name: 'Dv-Pt', fn: scrapeDvPt, usePuppeteer: false }, // + dandax
  { name: 'b2b.ixora-auto', fn: scrapeIxora, usePuppeteer: false },
  { name: 'Intertrek.info', fn: intertrek, usePuppeteer: false }, //
  { name: 'istk-deutz', fn: scrapeIstkDeutz, usePuppeteer: false }, //
  { name: 'Truckdrive', fn: scrapeTruckdrive, usePuppeteer: false }, // anelu ban ka
  { name: 'Impart', fn: scrapeImpart, usePuppeteer: false }, // anelu ban ka

  // { name: 'Mirdiesel', fn: scrapeMirDiesel, usePuppeteer: false }, // dont work empty page
  // { name: 'Truckmir', fn: scrapeTruckmir, usePuppeteer: false }, //
];

export async function scrapeAll(
  productNames: string[],
): Promise<ScrapedProduct[]> {
  const puppeteerScrapers = scrapers.filter((s) => s.usePuppeteer);
  const axiosScrapers = scrapers.filter((s) => !s.usePuppeteer);

  const puppeteerResults: ScrapedProduct[] = [];

  if (puppeteerScrapers.length) {
    const cluster = await Cluster.launch({
      concurrency: Cluster.CONCURRENCY_PAGE,
      maxConcurrency: 8,
      puppeteerOptions: {
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
    });

    // Define cluster task
    await cluster.task(async ({ page, data }) => {
      const { fn, productNames } = data;
      return fn(productNames, page);
    });

    // Execute all puppeteer scrapers concurrently
    const results = await Promise.all(
      puppeteerScrapers.map(async (scraper) => {
        try {
          return await cluster.execute({
            fn: scraper.fn,
            productNames,
          });
        } catch (err) {
          console.error(`❌ ${scraper.name} failed`, err);
          return [{ shop: scraper.name, found: false }];
        }
      }),
    );

    puppeteerResults.push(...results.flat());

    await cluster.idle();
    await cluster.close();
  }

  // Run axios scrapers normally
  const axiosResults = (
    await Promise.all(
      axiosScrapers.map(async (scraper) => {
        try {
          return await scraper.fn(productNames);
        } catch (err) {
          console.error(
            `❌ Axios scraper failed: ${scraper.name}`,
            err.message,
          );
          return [{ shop: scraper.name, found: false }];
        }
      }),
    )
  ).flat();

  const allResults = [...puppeteerResults, ...axiosResults];
  console.log(allResults);

  return allResults;
  // const results = await Promise.all(scrapers.map((s) => s.fn(productNames)));

  // const res = results.map((i) => i[0]);
  // console.log(' = res', res);

  // return res;
}
