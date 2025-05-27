// users.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schema/schema';

export interface IUser extends Document {
  telegramUsername: string;
  role?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<IUser>, // typed Model<IUser>
  ) {}

  async addUser(data: { telegramUsername: string }): Promise<IUser> {
    const exists = await this.userModel
      .findOne({ telegramUsername: data.telegramUsername })
      .exec();

    if (exists) return exists;

    const createdUser = new this.userModel(data);

    return createdUser.save(); // save() returns a Promise<IUser>
  }

  async deleteUser(data: { telegramUsername: string }): Promise<string> {
    const user = await this.userModel
      .findOne({ telegramUsername: data.telegramUsername })
      .exec();

    if (!user) {
      return 'Пользователь не найден'; // User not found
    }

    await this.userModel.deleteOne({ telegramUsername: data.telegramUsername });
    return 'Пользователь удален';
  }

  async isAdmin(telegramUsername: string): Promise<boolean> {
    const user = await this.userModel.findOne({ telegramUsername });

    return user?.role === 'admin' || user?.role === 'torossyann1';
  }

  // async isUserAllowed(telegramUsername: string): Promise<boolean> {
  //   const user = await this.userModel.findOne({ telegramUsername });

  //   return !!user;
  // }

  // user.service.ts
  async getAllUsers(): Promise<
    { telegramUsername: string; username?: string }[]
  > {
    return this.userModel
      .find({}, { telegramUsername: 1, username: 1, _id: 0 })
      .lean();
  }
}
