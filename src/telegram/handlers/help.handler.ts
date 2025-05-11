import { Injectable } from '@nestjs/common';
import { Context } from 'src/types/context.interface';

@Injectable()
export class HelpHandler {
  async handle(ctx: Context) {
    await ctx.reply(
      'ℹ️ Send a part number or write "download" to update the warehouse data.',
    );
  }
}
