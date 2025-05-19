import { ScrapedProduct } from 'src/types/context.interface';
// import { scrapeSeltex } from './sites/seltex'; // done 100% ++++++++++++++++++
// import { scrape74Parts } from './sites/74parts'; // done 100% ++++++++++++++++++
// import { scrapeIMachinery } from './sites/imachinery'; // done 100% ++++++++++++++++++
// import { scrapeImpart } from './sites/impart'; // done 100% ++++++++++++++++++
// import { scrapePcaGroup } from './sites/pcagroup'; // done 100% ++++++++++++++++++
// import { scrapeCamsParts } from './sites/camsparts'; // done 100% ++++++++++++++++++
// import { scrapeShtren } from './sites/shtren'; // done 100% ++++++++++++++++++
// import { scrapeRecamgr } from './sites/recamgr'; // done 100% ++++++++++++++++++
// import { scrapeIstkDeutz } from './sites/istk-deutz';// done 100% ++++++++++++++++++
// import { intertrek } from './sites/intertrek.info'; // done 100% ++++++++++++++++++

// import { scrapeVoltag } from './sites/voltag'; // mihat mer brendin hamapatasxanox artikulov kporces
// import { scrapeDvPt } from './sites/dv-pt'; // piti nayvi mejy  if (label === 'Бренд:') { ban ka grac u misht chi gtnum artikul - WA100M-8
// import { scrapeTruckdrive } from './sites/truckdrive';  //piti nayvi errora qcum u chisht artikul dnenq

// import { scrapeTruckmir } from './sites/truckmir'; // dandax
// import { scrapeIxora } from './sites/ixora'; //hamapatasxanox brand chka
// import { scrapeMirDiesel } from './sites/mirdiesel'; // not realization

// import { scrapeVipBlumaq } from './sites/vipBlumaq'; //need a  registrations
// import { scrapeZiptehOnline } from './sites/ziptehOnline'; // need a registrations

//   https://kta50.ru/catalog/, dont work
//    https://solid-t.ru/catalog/  empty

const scrapers = [
  // { name: 'Seltex', fn: scrapeSeltex },
  // { name: '74Parts', fn: scrape74Parts },
  // { name: 'Imachinery', fn: scrapeIMachinery },
  // { name: 'Impart', fn: scrapeImpart },
  // { name: 'Pcagroup', fn: scrapePcaGroup },
  // { name: 'Spb.camsparts', fn: scrapeCamsParts },
  // { name: 'Shtren', fn: scrapeShtren },
  // { name: 'Voltag', fn: scrapeVoltag },
  // { name: 'Dv-Pt', fn: scrapeDvPt },
  // { name: 'Recamgr', fn: scrapeRecamgr },
  // { name: 'Zipteh.online', fn: scrapeZiptehOnline },
  // https://solid-t.ru/catalog/
  // https://kta50.ru/catalog/
  // { name: 'Intertrek.info', fn: intertrek },
  // { name: 'Truckdrive', fn: scrapeTruckdrive }, //
  // { name: 'Truckmir', fn: scrapeTruckmir },
  // { name: 'istk-deutz', fn: scrapeIstkDeutz },
  // { name: 'Mirdiesel', fn: scrapeMirDiesel },
  // { name: 'b2b.ixora-auto', fn: scrapeIxora },
  // { name: 'Vip.blumaq', fn: scrapeVipBlumaq },
  // Добавляй другие сайты здесь
];
// b2b.ixora-auto.ru

export async function scrapeAll(
  nameItem: string,
): Promise<PromiseSettledResult<ScrapedProduct>[]> {
  const results = await Promise.allSettled(scrapers.map((s) => s.fn(nameItem)));
  return results;
  // console.log('--------------------', results, typeof results);
  // return results.map((r) => JSON.stringify(r)).join('\n\n');
}
