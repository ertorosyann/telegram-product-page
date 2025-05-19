import { Context as TelegrafContext } from 'telegraf';

export interface Session {
  step?: 'single_part_request' | 'document' | null;
}

export interface Context extends TelegrafContext {
  session: Session;
}

export type ScrapedProduct = {
  name?: string;
  price?: any;
  shop: string;
  found: boolean;
};
