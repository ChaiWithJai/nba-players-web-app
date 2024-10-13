import axios from 'axios';
import { Player, PlayerAttributes } from '../models/Player';

export class PlayerCacheService {
  async getPlayerByIdAndUpdate(playerId: number): Promise<PlayerAttributes | null> {
    // Step 1: Check the database
    try {
      const playerFromDb = await Player.findByPk(playerId);
      if (playerFromDb) {
        return playerFromDb.get({ plain: true }) as PlayerAttributes;
      }
    } catch (error) {
      console.error(`Error fetching player from database: ${error}`);
    }

    // Step 2: Fetch from external API if not found in database
    try {
      const playerFromApi = await this.fetchPlayerFromApi(playerId);
      if (playerFromApi) {
        // Store the new data in the database
        const createdPlayer = await Player.create(playerFromApi);
        return createdPlayer.toJSON() as PlayerAttributes;  // Use toJSON instead of get
      }
    } catch (error) {
      console.error(`Error fetching player from external API: ${error}`);
    }

    return null;
  }

  private async fetchPlayerFromApi(playerId: number): Promise<PlayerAttributes | null> {
    try {
      const response = await axios.get(`https://www.balldontlie.io/api/v1/players/${playerId}`);
      if (response.status === 200) {
        const player = response.data;
        return {
          id: player.id,
          first_name: player.first_name,
          last_name: player.last_name,
          position: player.position,
          height: `${player.height || ''}`,
          weight: `${player.weight || ''}`,
          jersey_number: player.jersey_number || '',
          college: player.college || '',
          country: player.country || '',
          draft_year: player.draft_year || 0,
          draft_round: player.draft_round || 0,
          draft_number: player.draft_number || 0,
          team_id: player.team.id,
        };
      }
    } catch (error) {
      console.error(`Error fetching player data from API: ${error}`);
    }
    return null;
  }
}
