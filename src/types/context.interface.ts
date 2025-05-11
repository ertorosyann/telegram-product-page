import { Context as TelegrafContext } from 'telegraf';

export interface Session {
  step?: string;
}

export interface Context extends TelegrafContext {
  session: Session;
}
