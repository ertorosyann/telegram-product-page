// users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/schema';
export interface IUser extends Document {
  telegramId: number;
  role?: string;
}
@Injectable()
@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<IUser>, // typed Model<IUser>
  ) {}

  async addUser(data: { telegramId: number }): Promise<IUser> {
    const exists = await this.userModel
      .findOne({ telegramId: data.telegramId })
      .exec();

    if (exists) return exists;

    const createdUser = new this.userModel(data);
    return createdUser.save(); // save() returns a Promise<IUser>
  }
  async isAdmin(telegramId: number): Promise<boolean> {
    const user = await this.userModel.findOne({ telegramId });
    return user?.role === 'admin';
  }
  async isUserAllowed(telegramId: number): Promise<boolean> {
    const user = await this.userModel.findOne({ telegramId });
    return !!user;
  }
}
