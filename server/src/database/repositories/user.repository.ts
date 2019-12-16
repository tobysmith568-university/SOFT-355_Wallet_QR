const mongooseFuzzySearching = require("mongoose-fuzzy-searching");
import { model } from "mongoose";
import { Repository } from "./abstract.repository";
import { UserSchema, IUserDbo } from "../models/user.dbo.interface";

export class UserRepository extends Repository<IUserDbo> {
  constructor() {
    UserSchema.plugin(mongooseFuzzySearching, {fields: ["username", "name"]});

    super(model<IUserDbo>("User", UserSchema));
  }

  public async search(searchTerm: string, max: number): Promise<Array<IUserDbo>> {
    
    if (searchTerm === undefined || searchTerm === null || searchTerm.length === 0) {
      return new Array();
    }

    const results: any[] = await (this.schemaModel as any).fuzzySearch(searchTerm);

    return results.slice(0, max);
  }
}
