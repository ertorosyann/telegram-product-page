import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';

@Injectable()
export class HelpHandler {
  async handle(ctx: Context) {
    await ctx.reply(
      'Напишите артикул детали или загрузите Excel‑файл, содержащий артикулы и количество деталей.',
    );
  }
}
