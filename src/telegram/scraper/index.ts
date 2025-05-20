import { ScrapedProduct } from 'src/types/context.interface';

import { scrapeSeltex } from './sites/seltex'; // done 100% ++++++++++++++++++
import { scrapeIMachinery } from './sites/imachinery'; // done 100% ++++++++++++++++++
import { scrape74Parts } from './sites/74parts'; // done 100% ++++++++++++++++++
import { scrapeImpart } from './sites/impart'; // done 100% ++++++++++++++++++
import { scrapePcaGroup } from './sites/pcagroup'; // done 100% ++++++++++++++++++
import { scrapeCamsParts } from './sites/camsparts'; // done 100% ++++++++++++++++++
import { scrapeRecamgr } from './sites/recamgr'; // done 100% ++++++++++++++++++  38872,86 misht esa het tali wonor
import { scrapeIstkDeutz } from './sites/istk-deutz'; // done 100% ++++++++++++++++++
import { intertrek } from './sites/intertrek.info'; // done 100% ++++++++++++++++++
import { scrapeIxora } from './sites/ixora'; // done 100% ++++++++++++++++++  hamapatasxanox brand chka
import { udtTechnika } from './sites/udt-technika';

// import { scrapeShtren } from './sites/shtren'; // done 100% ++++++++++++++++++   miqich dandaxacnuma
// import { scrapeMirDiesel } from './sites/mirdiesel'; // not work
// import { scrapeDvPt } from './sites/dv-pt'; // piti nayvi mejy  if (label === 'Бренд:') { ban ka grac u misht chi gtnum artikul - WA100M-8
// import { scrapeVoltag } from './sites/voltag'; // mihat mer brendin hamapatasxanox artikulov kporces
// import { scrapeTruckdrive } from './sites/truckdrive';  //piti nayvi errora qcum u chisht artikul dnenq
// import { scrapeTruckmir } from './sites/truckmir'; // dandax

// import { scrapeVipBlumaq } from './sites/vipBlumaq'; //need a  registrations
// import { scrapeZiptehOnline } from './sites/ziptehOnline'; // need a registrations
//   https://kta50.ru/catalog/, dont work
//    https://solid-t.ru/catalog/  empty

const scrapers = [
  { name: 'Seltex', fn: scrapeSeltex },
  { name: 'Imachinery', fn: scrapeIMachinery },
  { name: '74Parts', fn: scrape74Parts },
  { name: 'Impart', fn: scrapeImpart },
  { name: 'Pcagroup', fn: scrapePcaGroup },
  { name: 'Spb.camsparts', fn: scrapeCamsParts },
  // { name: 'Shtren', fn: scrapeShtren },
  { name: 'Recamgr', fn: scrapeRecamgr },
  { name: 'istk-deutz', fn: scrapeIstkDeutz },
  { name: 'Intertrek.info', fn: intertrek },
  { name: 'b2b.ixora-auto', fn: scrapeIxora },
  { udtTechnika: 'udtTechnika', fn: udtTechnika },

  // { name: 'Mirdiesel', fn: scrapeMirDiesel },
  // { name: 'Dv-Pt', fn: scrapeDvPt },
  // { name: 'Voltag', fn: scrapeVoltag },
  // { name: 'Truckdrive', fn: scrapeTruckdrive }, //
  // { name: 'Truckmir', fn: scrapeTruckmir },

  // dont work
  // { name: 'Vip.blumaq', fn: scrapeVipBlumaq },
  // { name: 'Zipteh.online', fn: scrapeZiptehOnline },
  // https://solid-t.ru/catalog/
  // https://kta50.ru/catalog/
];
// b2b.ixora-auto.ru

// export async function scrapeAll(
//   nameItem: string,
// ): Promise<PromiseSettledResult<ScrapedProduct>[]> {
//   const results = await Promise.allSettled(scrapers.map((s) => s.fn(nameItem)));
//   return results;
// }
// если любой скрапер завершится с ошибкой – функция упадёт в catch выше по стеку
export async function scrapeAll(nameItem: string): Promise<ScrapedProduct[]> {
  const results = await Promise.all(scrapers.map((s) => s.fn(nameItem)));
  return results;
}
