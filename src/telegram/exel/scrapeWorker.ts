// import { parentPort } from 'worker_threads';
// import { scrapeAll } from '../scraper';

// parentPort?.on('message', async (partNumber: string) => {
//   try {
//     const result = await scrapeAll(['344-7700', '6V8724']);
//     if (parentPort) {
//       parentPort.postMessage({ success: true, result, partNumber });
//     }
//   } catch (err) {
//     if (parentPort) {
//       parentPort.postMessage({
//         success: false,
//         error: (err as Error).message,
//         partNumber,
//       });
//     }
//   }
// });
