import { InputExelFile, ParsedRow, ResultRow } from './exel.types';
import { Worker } from 'worker_threads';

type PriceInfo = { price: number; shopName: string };

function runScrapeWorker(partNumber: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__dirname + '/scrapeWorker.js');

    worker.postMessage(partNumber);
    worker.on('message', (msg) => {
      if (msg.success) {
        resolve(msg.result);
      } else {
        reject(
          new Error(`Ошибка скрапинга для ${msg.partNumber}: ${msg.error}`),
        );
      }
      worker.terminate();
    });

    worker.on('error', reject);
    worker.on('exit', (code) => {
      if (code !== 0)
        reject(new Error(`Воркер остановился с кодом выхода ${code}`));
    });
  });
}

export async function compareItems(
  inputItems: InputExelFile[],
  skladItems: ParsedRow[],
): Promise<{ messages: string[]; notFound: string[]; rows: ResultRow[] }> {
  const messages: string[] = [];
  const notFound: string[] = [];
  const resultRows: ResultRow[] = [];

  const concurrencyLimit = 8;
  let running = 0;
  let index = 0;

  async function runNext() {
    if (index >= inputItems.length) return;

    const inputItem = inputItems[index++];

    const partNumber = inputItem['кат.номер'];
    const inputQty = inputItem['кол-во'] ?? 0;

    if (!partNumber) return runNext();

    running++;
    try {
      // Запускаем воркер для скрапинга
      const resultFromScrap = await runScrapeWorker(String(partNumber).trim());

      // Ищем цену на складе
      const skladMatch = skladItems.find((s) => s['кат.номер'] === partNumber);

      const priceSklad = skladMatch?.['цена, RUB'] ?? 0;

      // Инициализируем цены магазинов
      let seltexPrice: PriceInfo = { price: 0, shopName: 'seltex' };
      let imachineryPrice: PriceInfo = { price: 0, shopName: 'imachinery' };
      let parts74Price: PriceInfo = { price: 0, shopName: 'parts74' };
      let impartPrice: PriceInfo = { price: 0, shopName: 'impart' };
      let pcagroupPrice: PriceInfo = { price: 0, shopName: 'pcagroup' };
      let camspartsPrice: PriceInfo = { price: 0, shopName: 'camsparts' };
      let shtrenPrice: PriceInfo = { price: 0, shopName: 'shtern' };
      let recamgrPrice: PriceInfo = { price: 0, shopName: 'recamgr' };
      let istkiDeutzPrice: PriceInfo = { price: 0, shopName: 'istk-deutz' };
      let intertrekPrice: PriceInfo = { price: 0, shopName: 'Intertrek.info' };
      let ixoraPrice: PriceInfo = { price: 0, shopName: 'b2b.ixora-auto' };
      let udtTechnikaPrice: PriceInfo = { price: 0, shopName: 'udtTechnika' };
      let dvPtPrice: PriceInfo = { price: 0, shopName: 'dvpt' };
      let voltagPrice: PriceInfo = { price: 0, shopName: 'voltag' };
      let mirDieselPrice: PriceInfo = { price: 0, shopName: 'mirdiesel' };
      let truckdrivePrice: PriceInfo = { price: 0, shopName: 'truckdrive' };

      const allPrices: PriceInfo[] = [{ price: priceSklad, shopName: 'sklad' }];

      // Обрабатываем результаты скрапинга
      resultFromScrap.forEach((r: { shop: string; price: any }) => {
        const { shop, price: rawPrice } = r;

        if (rawPrice) {
          const cleaned = String(rawPrice)
            .replace(/[\s\u00A0]/g, '')
            .replace(/,/g, '.');
          const price = Number.isFinite(Number(cleaned)) ? Number(cleaned) : 0;
          const entry = { price, shopName: shop };

          switch (shop) {
            case 'seltex':
              seltexPrice = entry;
              allPrices.push(entry);
              break;
            case 'imachinery':
              imachineryPrice = entry;
              allPrices.push(entry);
              break;
            case 'parts74':
              parts74Price = entry;
              allPrices.push(entry);
              break;
            case 'impart':
              impartPrice = entry;
              allPrices.push(entry);
              break;
            case 'pcagroup':
              pcagroupPrice = entry;
              allPrices.push(entry);
              break;
            case 'camsparts':
              camspartsPrice = entry;
              allPrices.push(entry);
              break;
            case 'shtern':
              shtrenPrice = entry;
              allPrices.push(entry);
              break;
            case 'recamgr':
              recamgrPrice = entry;
              allPrices.push(entry);
              break;
            case 'istk':
              istkiDeutzPrice = entry;
              allPrices.push(entry);
              break;
            case 'Intertrek.info':
              intertrekPrice = entry;
              allPrices.push(entry);
              break;
            case 'b2b.ixora-auto':
              ixoraPrice = entry;
              allPrices.push(entry);
              break;
            case 'udtTechnika':
              udtTechnikaPrice = entry;
              allPrices.push(entry);
              break;
            case 'mirdiesel':
              mirDieselPrice = entry;
              allPrices.push(entry);
              break;
            case 'voltag':
              voltagPrice = entry;
              allPrices.push(entry);
              break;
            case 'dvpt':
              dvPtPrice = entry;
              allPrices.push(entry);
              break;
            case 'truckdrive':
              truckdrivePrice = entry;
              allPrices.push(entry);
              break;
            default:
              break;
          }
        }
      });

      let bestPrice: PriceInfo = { price: 0, shopName: '' };
      let totalPrice = 0;
      // Выбираем лучшую цену (минимальную > 0
      if (allPrices.length > 0) {
        const sorted: PriceInfo[] = [...allPrices].sort(
          (a, b) => a.price - b.price,
        );

        const firstNonZero = sorted.find((p) => p.price > 0);
        bestPrice = firstNonZero ?? sorted[0];
        totalPrice = bestPrice.price * inputQty;
      }
      // 'Best Price = ', bestPrice.price, bestPrice.shopName);

      // const sorted = allPrices.slice().sort((a, b) => a.price - b.price);
      // const firstNonZero = sorted.find((p) => p.price > 0);
      // const bestPrice = firstNonZero ?? sorted[0];
      // const totalPrice = bestPrice.price * inputQty;

      if (bestPrice.price === 0) {
        messages.push(`❌ ${partNumber}: не найдено ни одной цены`);
        notFound.push(partNumber);
      } else {
        messages.push(
          `✅ ${partNumber}: лучшая цена ${bestPrice.price}₽ в ${bestPrice.shopName}`,
        );
      }

      // Формируем строку результата

      resultRows.push({
        name: partNumber,
        kalichestvo: inputQty,
        luchshayaCena: bestPrice.price,
        summa: totalPrice,
        luchshiyPostavshik: bestPrice.shopName,
        sklad: priceSklad,
        // seltex: 0,
        seltex: seltexPrice.price,
        // imachinery: 0,
        imachinery: imachineryPrice.price,
        // '74parts': 0,
        '74parts': parts74Price.price,
        // impart: 0,
        impart: impartPrice.price,
        // pcagroup: 0,
        pcagroup: pcagroupPrice.price,
        // 'spb.camsparts': 0,
        'spb.camsparts': camspartsPrice.price,
        // shtern: 0,
        shtern: shtrenPrice.price,
        // recamgr: 0,
        recamgr: recamgrPrice.price,
        // 'istk-deutz': 0,
        'istk-deutz': istkiDeutzPrice.price,
        // intertrek: 0,
        intertrek: intertrekPrice.price,
        // 'b2b.ixora-auto': 0,
        'b2b.ixora-auto': ixoraPrice.price,
        // "udtTechnika": 0,
        udtTechnika: udtTechnikaPrice.price,
        // voltag: 0,
        voltag: voltagPrice.price,
        // 'dv-pt': 0,
        dvpt: dvPtPrice.price,
        // truckdrive: 0,
        truckdrive: truckdrivePrice.price,
        // mirdiesel: 0,
        mirdiesel: mirDieselPrice.price,
        'vip.blumaq': 0,
        // 'vip.blumaq': vipBlumaqPrice.price,
        kta50: 0,
        zipteh: 0,
        truckmir: 0,
        'solid-t': 0,
      });
    } catch {
      // messages.push(`❌ Ошибка при поиске ${partNumber}: ${error.message}`);
      notFound.push(partNumber);
    } finally {
      running--;
      await runNext();
    }
  }

  // Запускаем несколько воркеров одновременно с ограничением
  const runners: Promise<void>[] = [];
  for (let i = 0; i < concurrencyLimit; i++) {
    runners.push(runNext());
  }

  await Promise.all(runners);

  return { messages, notFound, rows: resultRows };
}
