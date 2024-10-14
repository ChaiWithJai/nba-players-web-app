import { Op } from "sequelize";
import { Player, PlayerAttributes } from "../models/Player";
import { BallDontLieApiService } from "./BallDontLieAPIService";

export class PlayerCacheService {
  private apiService: BallDontLieApiService;

  constructor() {
    this.apiService = new BallDontLieApiService();
  }

  async getPlayerByIdAndUpdate(
    playerId: number
  ): Promise<PlayerAttributes | null> {
    try {
      let player = await Player.findByPk(playerId);
      if (!player) {
        const playerFromApi = await this.apiService.getPlayer(playerId);
        if (playerFromApi) {
          player = await Player.create(playerFromApi);
        }
      }
      return player ? player.toJSON() : null;
    } catch (error) {
      console.error(`Error fetching player ${playerId}:`, error);
      return null;
    }
  }

  async searchPlayers(
    name: string,
    page: number = 1,
    perPage: number = 25
  ): Promise<{
    data: PlayerAttributes[];
    meta: { next_cursor: number | null; per_page: number };
  }> {
    try {
      // First, search in our database
      const dbPlayers = await Player.findAndCountAll({
        where: {
          [Op.or]: [
            { first_name: { [Op.iLike]: `%${name}%` } },
            { last_name: { [Op.iLike]: `%${name}%` } },
          ],
        },
        limit: perPage,
        offset: (page - 1) * perPage,
        order: [["id", "ASC"]],
      });

      // If we don't have enough results, fetch from API
      if (dbPlayers.count < perPage) {
        const apiResult = await this.apiService.searchPlayers(
          name,
          page,
          perPage
        );
        // Update our database with new players
        for (const player of apiResult.data) {
          await Player.upsert(player);
        }
        return apiResult;
      }

      // If we have enough results from the database, return those
      return {
        data: dbPlayers.rows.map((player) => player.toJSON()),
        meta: {
          next_cursor: dbPlayers.count > page * perPage ? page + 1 : null,
          per_page: perPage,
        },
      };
    } catch (error) {
      console.error(`Error searching players:`, error);
      throw error;
    }
  }
}
