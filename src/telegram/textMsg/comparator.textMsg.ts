export type InputText = {
  name: string;
  qty?: string | number;
  brand?: string;
};
import { Worker } from 'worker_threads';
import { ParsedRow } from '../exel/exel.types';

type PriceInfo = { price: number; shopName: string; brand: string | undefined };

function runScrapeWorker(inputItem: InputText): Promise<any> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__dirname + '/scrapeWorkerForText.js');

    worker.postMessage(inputItem);
    worker.on('message', (msg) => {
      if (msg.success) {
        resolve(msg.result);
      } else {
        reject(
          new Error(`Ошибка скрапинга для ${msg.inputItem}: ${msg.error}`),
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

export async function compareItemTextHandler(
  inputItem: InputText,
  skladItems: ParsedRow[],
): Promise<{ messages: string }> {
  let messages: string = '';

  const concurrencyLimit = 4;
  let running = 0;
  let index = 0;
  async function runNext() {
    if (index > 0) return;

    const partNumber = inputItem.name;
    const inputQty = inputItem.qty || '';
    const brand = inputItem.brand || '';
    // console.log(partNumber, inputQty, 'stexa');

    if (!partNumber) return runNext();

    running++;
    index++;
    try {
      // Запускаем воркер для скрапинга
      const resultFromScrap = await runScrapeWorker(inputItem);

      const skladMatch = skladItems.find((s) => s['кат.номер'] === partNumber);
      console.log('poiska tve brand = ', brand);

      let brandMatch: string | undefined;
      if (brand) {
        brandMatch = skladMatch?.['название детали']
          .toLocaleUpperCase()
          .split(' ')
          .includes(brand)
          ? brand
          : skladMatch?.['название детали'];
      }
      brandMatch = skladMatch?.['название детали'];
      const priceSklad = skladMatch?.['цена, RUB'] ?? 0;

      // Инициализируем цены магазинов
      let seltexPrice: PriceInfo = {
        brand: '',
        price: 0,
        shopName: 'seltex',
      };
      let imachineryPrice: PriceInfo = {
        brand: '',
        price: 0,
        shopName: 'imachinery',
      };
      let parts74Price: PriceInfo = {
        brand: '',
        price: 0,
        shopName: 'parts74',
      };
      let impartPrice: PriceInfo = {
        brand: '',
        price: 0,
        shopName: 'impart',
      };
      let pcagroupPrice: PriceInfo = {
        brand: '',
        price: 0,
        shopName: 'pcagroup',
      };
      let camspartsPrice: PriceInfo = {
        brand: '',
        price: 0,
        shopName: 'camsparts',
      };
      let shtrenPrice: PriceInfo = {
        brand: '',
        price: 0,
        shopName: 'shtern',
      };
      let recamgrPrice: PriceInfo = {
        brand: '',
        price: 0,
        shopName: 'recamgr',
      };
      let istkiDeutzPrice: PriceInfo = {
        brand: '',
        price: 0,
        shopName: 'istk-deutz',
      };
      let intertrekPrice: PriceInfo = {
        brand: '',
        price: 0,
        shopName: 'Intertrek.info',
      };
      let ixoraPrice: PriceInfo = {
        brand: '',
        price: 0,
        shopName: 'b2b.ixora-auto',
      };
      let udtTechnikaPrice: PriceInfo = {
        brand: '',
        price: 0,
        shopName: 'udtTechnika',
      };
      let dvPtPrice: PriceInfo = {
        brand: '',
        price: 0,
        shopName: 'dvpt',
      };
      let voltagPrice: PriceInfo = {
        brand: '',
        price: 0,
        shopName: 'voltag',
      };
      let mirDieselPrice: PriceInfo = {
        brand: '',
        price: 0,
        shopName: 'mirdiesel',
      };
      let truckdrivePrice: PriceInfo = {
        brand: '',
        price: 0,
        shopName: 'truckdrive',
      };
      const allPrices: PriceInfo[] = [
        {
          price: priceSklad,
          shopName: 'sklad',
          brand: brandMatch ? brandMatch : '',
        },
      ];

      // Обрабатываем результаты скрапинга
      resultFromScrap.forEach(
        (r: { shop: string; price: any; brand: string }) => {
          const { shop, price: rawPrice, brand } = r;

          if (rawPrice) {
            const cleaned = String(rawPrice)
              .replace(/[\s\u00A0]/g, '')
              .replace(/,/g, '.');
            const price = Number.isFinite(Number(cleaned))
              ? Number(cleaned)
              : 0;
            const entry = { price, shopName: shop, brand };

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
        },
      );
      console.log('!!!!!++++', allPrices);

      let bestPrice: PriceInfo = { price: 0, shopName: '', brand: '' };
      let totalPrice: any = 0;

      // Выбираем лучшую цену (минимальную > 0
      if (allPrices.length > 0) {
        const sorted: PriceInfo[] = [...allPrices].sort(
          (a, b) => a.price - b.price,
        );
        const firstNonZero = sorted.find((p) => p.price > 0);
        bestPrice = firstNonZero ?? sorted[0];

        totalPrice = bestPrice.price * Number(inputQty);
      }

      console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      console.log('result for Text Handler  = ', resultFromScrap);
      console.log('all Shops = ', allPrices);
      console.log('Best !!!!!!!!!!!!!!!!!!!!', bestPrice);

      if (bestPrice.price === 0)
        messages += `❌ ${partNumber}: не найдено ни одной цены`;
      else
        messages += `✅ Кат.номер: ${partNumber} | 🏷️ Цена: ${bestPrice.price}₽ | 🏪 Магазин: "${bestPrice.shopName}" | 💰 Итог: ${totalPrice}₽ | 🏷️ Бренд: ${bestPrice.brand}`;
      const foundPrices = allPrices.filter((p) => p.price > 0);
      if (foundPrices.length > 0) {
        const foundDetails = foundPrices
          .map((p) => `|| 🛒 ${p.shopName}: ${p.brand || '—'} - ${p.price}₽ \n`)
          .join(' | ');
        messages += `\n🔍 Найдено: \n ${foundDetails}`;
      }
    } catch {
      messages += '❌ Ошибка при поиске ${partNumber}';
    }
  }

  // Запускаем несколько воркеров одновременно с ограничением
  const runners: Promise<void>[] = [];
  for (let i = 0; i < concurrencyLimit; i++) {
    runners.push(runNext());
  }

  await Promise.all(runners);
  // await runNext();
  // messages = messages ? messages : 'не найдено ни одной цены';
  return { messages };
}
