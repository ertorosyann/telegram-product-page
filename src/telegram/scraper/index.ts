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
import { udtTechnika } from './sites/udt-technika';
import { scrapeImpart } from './sites/impart'; // done 100% ++++++++++++++++++
import { scrapeDvPt } from './sites/dv-pt'; //
import { scrapeVoltag } from './sites/voltag'; //
import { scrapeMirDiesel } from './sites/mirdiesel'; // done 100% ++++++++++++++++++
import { scrapeTruckdrive } from './sites/truckdrive'; //piti nayvi errora qcum u chisht artikul dnenq toshni chi

import { scrapeShtren } from './sites/shtren'; // done 100% ++++++++++++++++++   miqich dandaxacnuma
import { scrapeTruckmir } from './sites/truckmir'; // dandax
import { scrapeVipBlumaq } from './sites/vipBlumaq'; //need a  registrations
import { scrapeZiptehOnline } from './sites/ziptehOnline'; // need a registrations

const scrapers = [
  { name: 'Seltex', fn: scrapeSeltex }, // fast find slow if product isnt
  { name: 'Pcagroup', fn: scrapePcaGroup }, // fast
  { name: 'Imachinery', fn: scrapeIMachinery }, //fast
  { name: '74Parts', fn: scrape74Parts }, // fast
  { name: 'Spb.camsparts', fn: scrapeCamsParts }, //fast
  { name: 'Recamgr', fn: scrapeRecamgr }, // fast
  { name: 'istk-deutz', fn: scrapeIstkDeutz }, // պրաբելները հանել ես պրոդուկտը չի բերում // 7000
  { name: 'Intertrek.info', fn: intertrek }, // դանդաղոտ կայքը դանդաղ է բեռնվում
  { name: 'Dv-Pt', fn: scrapeDvPt },
  { name: 'b2b.ixora-auto', fn: scrapeIxora },
  // { name: 'Impart', fn: xscrapeImpart },
  { name: 'Mirdiesel', fn: scrapeMirDiesel }, // dont work in current time webpage try later
  { udtTechnika: 'udtTechnika', fn: udtTechnika }, //dandax
  // { name: 'Vip.blumaq', fn: scrapeVipBlumaq },
  // { name: 'Zipteh.online', fn: scrapeZiptehOnline },

  // { name: 'Voltag', fn: scrapeVoltag },
  // { name: 'Truckdrive', fn: scrapeTruckdrive }, //
  // { name: 'Shtren', fn: scrapeShtren }, //dandaxa
  // { name: 'Truckmir', fn: scrapeTruckmir }, // dont work
];

export async function scrapeAll(
  productName: string,
): Promise<ScrapedProduct[]> {
  const start = performance.now();

  // const results = await Promise.all(scrapers.map((s) => s.fn(productName)));
  // return results;
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE,
    maxConcurrency: 8,
    puppeteerOptions: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
  });

  await cluster.task(async ({ page, data }) => {
    const { fn, productName } = data;
    return await fn(productName, page);
  });

  const promises: Promise<ScrapedProduct>[] = [];
  for (const scraper of scrapers) {
    promises.push(
      cluster.execute({
        fn: scraper.fn,
        productName,
      }),
    );
  }

  const results = await Promise.all(promises);

  await cluster.idle();
  await cluster.close();

  console.log('Total time:', performance.now() - start);
  return results;
}
