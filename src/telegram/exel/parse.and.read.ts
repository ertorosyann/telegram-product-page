import * as XLSX from 'xlsx';
import { InputExelFile, ParsedRow } from './exel.types';
import { Telegram } from 'telegraf';

export async function parseExcelFromTelegram(
  fileId: string,
  telegram: Telegram,
): Promise<InputExelFile[]> {
  const fileLink = await telegram.getFileLink(fileId);
  const response = await fetch(fileLink.href);
  const arrayBuffer = await response.arrayBuffer();

  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const rows = json
    .slice(1)
    .map((row) => ({
      '№': String(row[0]).trim(),
      'кат.номер': String(row[1]).trim(),
      'кол-во': row[2] !== undefined ? Number(row[2]) : 0,
    }))
    .filter((row) => row['кат.номер'] !== 'undefined');

  return rows;
}

export async function readExcelFromYandexDisk(
  publicUrl: string,
): Promise<ParsedRow[]> {
  const yandexApiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(publicUrl)}`;
  const res = await fetch(yandexApiUrl);
  const data = await res.json();

  if (!data.href) {
    throw new Error('Failed to get Yandex Disk download link');
  }

  const fileResponse = await fetch(data.href);
  const arrayBuffer = await fileResponse.arrayBuffer();

  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const rows = json
    .slice(1) // skip header
    .map((row) => ({
      'кат.номер': row[0] !== undefined ? String(row[0]).trim() : '',
      'название детали': row[1] !== undefined ? String(row[1]).trim() : '',
      'кол-во': row[2] !== undefined ? Number(row[2]) : 0,
      'цена, RUB': row[3] !== undefined ? Number(row[3]) : 0,
      'сумма, RUB': row[4] !== undefined ? Number(row[4]) : 0,
    }))
    .filter((row) => row['кат.номер'] !== '');

  return rows;
}
