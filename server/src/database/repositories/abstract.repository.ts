import * as mongoose from "mongoose";

export abstract class Repository<T extends mongoose.Document> {
  constructor(protected schemaModel: mongoose.Model<T>) {
  }

  async create(data: T): Promise<T> {
    return await this.schemaModel.create(data);
  }

  async getAll(): Promise<Array<T>> {
    return await this.schemaModel.find({});
  }

  async find(data: Partial<T>): Promise<Array<T>> {
    return await this.schemaModel.find(data);
  }

  async delete(data: T): Promise<void> {
    await this.schemaModel.deleteOne(data);
  }
}
