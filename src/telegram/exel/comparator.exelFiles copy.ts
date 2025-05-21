// import { Worker } from 'worker_threads';
// import path from 'path';

// function runScrapeWorker(partNumber: string): Promise<any> {
//   return new Promise((resolve, reject) => {
//     const worker = new Worker(path.resolve(__dirname, 'scrapeWorker.js')); // путь к скомпилированному JS-файлу воркера
//     worker.postMessage(partNumber);

//     worker.on('message', (msg) => {
//       if (msg.success) {
//         resolve(msg.result);
//       } else {
//         reject(
//           new Error(`Ошибка скрапинга для ${msg.partNumber}: ${msg.error}`),
//         );
//       }
//       worker.terminate();
//     });

//     worker.on('error', reject);
//     worker.on('exit', (code) => {
//       if (code !== 0)
//         reject(new Error(`Воркер остановился с кодом выхода ${code}`));
//     });
//   });
// }

// export async function compareItems(
//   inputItems: InputExelFile[],
//   skladItems: ParsedRow[],
// ): Promise<{ messages: string[]; notFound: string[]; rows: ResultRow[] }> {
//   const messages: string[] = [];
//   const notFound: string[] = [];
//   const resultRows: ResultRow[] = [];

//   const concurrencyLimit = 8; // подбери под свою систему
//   let running = 0;
//   let index = 0;

//   for (const inputItem of inputItems) {
//     const partNumber = inputItem['кат.номер'];
//     const inputQty = inputItem['кол-во'] ?? 0;
// if (!partNumber) continue;

//     /* --------------------------------- склад -------------------------------- */
//     const skladMatch = skladItems.find((s) => s['кат.номер'] === partNumber);
//     const priceSklad = skladMatch?.['цена, RUB'] ?? 0;

//     /* ------------------------- переменные магазинов ------------------------- */
//     let seltexPrice: PriceInfo = { price: 0, shopName: 'seltex' };
//     let imachineryPrice: PriceInfo = { price: 0, shopName: 'imachinery' };
//     let parts74Price: PriceInfo = { price: 0, shopName: 'parts74' };
//     let impartPrice: PriceInfo = { price: 0, shopName: 'impart' };
//     let pcagroupPrice: PriceInfo = { price: 0, shopName: 'pcagroup' };
//     let camspartsPrice: PriceInfo = { price: 0, shopName: 'camsparts' };
//     let recamgrPrice: PriceInfo = { price: 0, shopName: 'recamgr' };
//     let istkiDeutzPrice: PriceInfo = { price: 0, shopName: 'istk-deutz' };
//     let intertrekPrice: PriceInfo = { price: 0, shopName: 'Intertrek.info' };
//     let ixoraPrice: PriceInfo = { price: 0, shopName: 'b2b.ixora-auto' };
//     let udtTechnikaPrice: PriceInfo = { price: 0, shopName: 'udtTechnika' };
//     let dvPtPrice: PriceInfo = { price: 0, shopName: 'dv-pt' };
//     let voltagPrice: PriceInfo = { price: 0, shopName: 'voltag' };
//     let mirDieselPrice: PriceInfo = { price: 0, shopName: 'mirdiesel' };
//     let truckdrivePrice: PriceInfo = { price: 0, shopName: 'truckdrive' };
//     // let shtrenPrice: PriceInfo = { price: 0, shopName: 'shtern' };

//     /* ------------------------------- скрапинг ------------------------------- */

//     const resultFromScrap = await scrapeAll(String(partNumber).trim());
//     console.log(resultFromScrap);

//     const allPrices: PriceInfo[] = [{ price: priceSklad, shopName: 'sklad' }];

//     // ─── единственное изменение ───
//     resultFromScrap.forEach((r) => {
//       // r уже типа ScrapedProduct
//       const { shop, price: rawPrice } = r;

//       const cleaned = String(rawPrice)
//         .replace(/[\s\u00A0]/g, '') // убираем обычные и не‑разрывные пробелы
//         .replace(/,/g, '.'); // запятую → точку

//       const price = Number.isFinite(Number(cleaned)) ? Number(cleaned) : 0;
//       const entry: PriceInfo = { price, shopName: shop };

//       switch (shop) {
//         case 'seltex':
//           seltexPrice = entry;
//           allPrices.push(entry);
//           break;
//         case 'imachinery':
//           imachineryPrice = entry;
//           allPrices.push(entry);
//           break;
//         case 'parts74':
//           parts74Price = entry;
//           allPrices.push(entry);
//           break;
//         case 'impart':
//           impartPrice = entry;
//           allPrices.push(entry);
//           break;
//         case 'pcagroup':
//           pcagroupPrice = entry;
//           allPrices.push(entry);
//           break;
//         case 'camsparts':
//           camspartsPrice = entry;
//           allPrices.push(entry);
//           break;
//         case 'recamgr':
//           recamgrPrice = entry;
//           allPrices.push(entry);
//           break;
//         case 'istk-deutz':
//           istkiDeutzPrice = entry;
//           allPrices.push(entry);
//           break;
//         case 'Intertrek.info':
//           intertrekPrice = entry;
//           allPrices.push(entry);
//           break;
//         case 'b2b.ixora-auto':
//           ixoraPrice = entry;
//           allPrices.push(entry);
//           break;
//         case 'udtTechnika':
//           udtTechnikaPrice = entry;
//           allPrices.push(entry);
//           break;
//         case 'dv-pt':
//           dvPtPrice = entry;
//           allPrices.push(entry);
//           break;
//         case 'voltag':
//           voltagPrice = entry;
//           allPrices.push(entry);
//           break;
//         case 'mirdiesel':
//           mirDieselPrice = entry;
//           allPrices.push(entry);
//           break;
//         case 'truckdrive':
//           truckdrivePrice = entry;
//           allPrices.push(entry);
//           break;
//         // case 'shtern':
//         //   shtrenPrice = entry;
//         //   allPrices.push(entry);
//         //   break;
//         default:
//           break;
//       }
//     });

//     /* ------------------------- выбор лучшей цены --------------------------- */
//     let bestPrice: PriceInfo = { price: 0, shopName: '' };
//     let totalPrice = 0;

//     if (allPrices.length > 0) {
//       const sorted: PriceInfo[] = [...allPrices].sort(
//         (a, b) => a.price - b.price,
//       );

//       const firstNonZero = sorted.find((p) => p.price > 0);
//       bestPrice = firstNonZero ?? sorted[0];
//       totalPrice = bestPrice.price * inputQty;
//     }
//     // console.log('Best Price = ', bestPrice.price, bestPrice.shopName);

//     /* --------------------------- формируем вывод --------------------------- */
//     if (bestPrice.price === 0) {
//       messages.push(`❌ ${partNumber}: не найдено ни одной цены`);
//       notFound.push(partNumber);
//     } else {
//       messages.push(
//         `✅ ${partNumber}: лучшая цена ${bestPrice.price}₽ в ${bestPrice.shopName}`,
//       );
//     }

//     resultRows.push({
//       name: partNumber,
//       kalichestvo: inputQty,
//       luchshayaCena: bestPrice.price,
//       summa: totalPrice,
//       luchshiyPostavshik: bestPrice.shopName,
//       sklad: priceSklad,
//       // seltex: 0,
//       seltex: seltexPrice.price,
//       // imachinery: 0,
//       imachinery: imachineryPrice.price,
//       // '74parts': 0,
//       '74parts': parts74Price.price,
//       // impart: 0,
//       impart: impartPrice.price,
//       // pcagroup: 0,
//       pcagroup: pcagroupPrice.price,
//       // 'spb.camsparts': 0,
//       'spb.camsparts': camspartsPrice.price,
//       // recamgr: 0,
//       recamgr: recamgrPrice.price,
//       // 'istk-deutz': 0,
//       'istk-deutz': istkiDeutzPrice.price,
//       // intertrek: 0,
//       intertrek: intertrekPrice.price,
//       // 'b2b.ixora-auto': 0,
//       'b2b.ixora-auto': ixoraPrice.price,
//       // "udtTechnika": 0,
//       udtTechnika: udtTechnikaPrice.price,
//       // 'dv-pt': 0,
//       'dv-pt': dvPtPrice.price,
//       // voltag: 0,
//       voltag: voltagPrice.price,
//       // mirdiesel: 0,
//       mirdiesel: mirDieselPrice.price,
//       // truckdrive: 0,
//       truckdrive: truckdrivePrice.price,
//       shtern: 0,
//       // shtern: shtrenPrice.price, //dandaxa
//       'vip.blumaq': 0,
//       kta50: 0,
//       zipteh: 0,
//       truckmir: 0, //dandaxa shat
//       'solid-t': 0,
//     });

//     // messages.push(
//     //   `✅ Найдено: ${bestPrice.shopName} — ${bestPrice.price} × ${inputQty} = ${totalPrice}`,
//     // );
//   }

//   return { messages, notFound, rows: resultRows };
// }
