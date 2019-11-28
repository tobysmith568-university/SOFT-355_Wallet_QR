import * as mongoose from "mongoose";

export abstract class Repository<T> {
  constructor(protected schemaModel: mongoose.Model<mongoose.Document>) {
  }

  async save(data: T): Promise<void> {
    await this.schemaModel.create(data);
  }

  /*async getById(id): Promise<T> {
    return await this.schemaModel.findById(id);
  }

  async getAll(): Promise<Array<T>> {
    return await this.schemaModel.find({})
  }

  async find(data: Partial<T>): Promise<Array<T>> {
    return await this.schemaModel.find(data);
  }*/

  async delete(data: T): Promise<void> {
    await this.schemaModel.deleteOne(data);
  }
}
