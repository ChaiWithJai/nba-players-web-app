import axios, { AxiosInstance } from "axios";
import rateLimit from "axios-rate-limit";
import { PlayerAttributes } from "../models/Player";

export class BallDontLieApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = rateLimit(
      axios.create({
        baseURL: "https://api.balldontlie.io/v1",
        timeout: 5000,
        headers: {
          Authorization: `${process.env.BALLDONTLIE_API_KEY}`,
        },
      }),
      { maxRequests: 30, perMilliseconds: 60000 }
    ); // 30 requests per minute
  }

  async getPlayer(id: number): Promise<PlayerAttributes | null> {
    try {
      const response = await this.api.get(`/players/${id}`);
      return this.transformPlayerData(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return null;
        }
        if (error.response?.status === 429) {
          throw new Error("Rate limit exceeded");
        }
      }
      throw error;
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
      const response = await this.api.get("/players", {
        params: { search: name, page, per_page: perPage },
      });
      const transformedData = response.data.data.map(this.transformPlayerData);
      return {
        data: transformedData,
        meta: {
          next_cursor: response.data.meta.next_page,
          per_page: response.data.meta.per_page,
        },
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        throw new Error("Rate limit exceeded");
      }
      throw error;
    }
  }

  private transformPlayerData(apiPlayer: any): PlayerAttributes {
    return {
      id: apiPlayer.id,
      first_name: apiPlayer.first_name,
      last_name: apiPlayer.last_name,
      position: apiPlayer.position,
      height: apiPlayer.height,
      weight: apiPlayer.weight,
      jersey_number: apiPlayer.jersey_number,
      college: apiPlayer.college,
      country: apiPlayer.country,
      draft_year: apiPlayer.draft_year,
      draft_round: apiPlayer.draft_round,
      draft_number: apiPlayer.draft_number,
      team_id: apiPlayer.team.id,
    };
  }
}
