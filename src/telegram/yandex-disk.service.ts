import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { AxiosResponse } from 'axios';

@Injectable()
export class YandexDiskService {
  constructor(private readonly httpService: HttpService) {}

  async downloadPublicFile(publicUrl: string, savePath: string): Promise<void> {
    const getMetaUrl = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${publicUrl}`;

    const metaResponse = (await lastValueFrom(
      this.httpService.get(getMetaUrl),
    )) as AxiosResponse<any>;
    const downloadUrl = metaResponse.data.href;

    const fileResponse = (await lastValueFrom(
      this.httpService.get(downloadUrl, { responseType: 'stream' }),
    )) as AxiosResponse<any>;

    const writer = fs.createWriteStream(savePath);
    (fileResponse.data as NodeJS.ReadableStream).pipe(writer);

    await new Promise<void>((resolve, reject) => {
      writer.on('finish', () => resolve());
      writer.on('error', reject);
    });
  }

  parseExcel(filePath: string): any[] {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    return data;
  }

  async downloadAndParse(publicUrl: string): Promise<any[]> {
    const downloadsDir = path.join(__dirname, '../../downloads');

    // ✅ Create the folder if it doesn't exist
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const savePath = path.join(downloadsDir, 'warehouse.xlsx');
    await this.downloadPublicFile(publicUrl, savePath);
    return this.parseExcel(savePath);
  }
}
