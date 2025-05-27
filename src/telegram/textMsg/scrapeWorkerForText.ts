import { parentPort } from 'worker_threads';
import { scrapeAllForText } from '../scraper/indexForText';
import { InputText } from './comparator.textMsg';

parentPort?.on('message', async (InputItem: InputText) => {
  try {
    const result = await scrapeAllForText(InputItem);
    if (parentPort) {
      parentPort.postMessage({ success: true, result, InputItem });
    }
  } catch (err) {
    if (parentPort) {
      parentPort.postMessage({
        success: false,
        error: (err as Error).message,
        InputItem,
      });
    }
  }
});
