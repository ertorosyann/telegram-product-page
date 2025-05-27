import { Context as TelegrafContext } from 'telegraf';

export interface Session {
  step?:
    | 'single_part_request'
    | 'document'
    | 'add_user'
    | 'all_users'
    | 'delete_user'
    | null;
}

export interface Context extends TelegrafContext {
  session: Session;
}

export type ScrapedProduct = {
  name?: string | null | undefined;
  price?: string | number | null | undefined;
  shop?: string;
  found: boolean;
  brand?: string;
};
