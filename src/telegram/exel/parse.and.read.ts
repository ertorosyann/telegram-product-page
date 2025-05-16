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
      'кат.номер': String(row[0]).trim(),
      'кол-во': row[1] !== undefined ? Number(row[1]) : 0,
    }))
    .filter((row) => row['кат.номер'] !== 'undefined');

  return rows;
}

export function readLocalExcel(path: string): ParsedRow[] {
  const workbook = XLSX.readFile(path);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const json: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

  const rows = json
    .slice(1)
    .map((row) => ({
      'кат.номер': row[0] !== undefined ? String(row[0]).trim() : '',
      'название детали': row[1] !== undefined ? String(row[1]).trim() : '',
      'кол-во': row[2] !== undefined ? Number(row[2]) : 0,
      'цена, RUB': row[3] !== undefined ? Number(String(row[3]).trim()) : 0,
      'сумма, RUB': row[4] !== undefined ? Number(String(row[4]).trim()) : 0,
    }))
    .filter((row) => row['кат.номер'] !== '');

  return rows;
}
