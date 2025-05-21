// src/users/user.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  telegramUsername: string;

  @Prop({ default: 'user' })
  role: 'user' | 'admin';
  @Prop()
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
