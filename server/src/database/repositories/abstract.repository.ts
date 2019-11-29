import * as mongoose from "mongoose";

export abstract class Repository<T extends mongoose.Document> {
  constructor(protected schemaModel: mongoose.Model<T>) {
  }

  async create(data: any): Promise<T> {
    return await this.schemaModel.create(data, (err: any, res: any) => {
      if (err) {
        console.log(err);
      }
    });
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
