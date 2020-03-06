import { Request, Response } from "express";
import { UserRepository } from "../database/repositories/user.repository";
import { ISearchResult } from "../api/models/search-result.interface";

export class SearchController {

  constructor(private readonly userRepository: UserRepository) { }

  public search = async (req: Request, res: Response) => {
    const searchTerm = req.params.term;

    if (!searchTerm) {
      res.json({ error: "No search term given" });
      res.statusCode = 401;
      return;
    }

    const searchResults = await this.userRepository.search(searchTerm, 8);

    const results: ISearchResult[] = [];

    for (const result of searchResults) {
      results.push({
        name: result.displayName,
        username: result.username
      });
    }

    res.json(results);
    res.send();
  }
}
