import { PlayerCacheService } from "../../src/services/PlayerCacheService";
import { Player, PlayerAttributes } from "../../src/models/Player";
import { BallDontLieApiService } from "../../src/services/BallDontLieAPIService";

jest.mock("../../src/models/Player");
jest.mock("../../src/services/BallDontLieAPIService");

describe("PlayerCacheService", () => {
  let playerCacheService: PlayerCacheService;
  let mockApiService: jest.Mocked<BallDontLieApiService>;

  const mockPlayerData: PlayerAttributes = {
    id: 1,
    first_name: "John",
    last_name: "Doe",
    position: "G",
    height: "6-2",
    weight: "195",
    jersey_number: "23",
    college: "University",
    country: "USA",
    draft_year: 2020,
    draft_round: 1,
    draft_number: 1,
    team_id: 1,
  };

  beforeEach(() => {
    mockApiService = new BallDontLieApiService() as jest.Mocked<BallDontLieApiService>;
    playerCacheService = new PlayerCacheService();
    (playerCacheService as any).apiService = mockApiService;
  });

  describe("getPlayerByIdAndUpdate", () => {
    it("should return player from database if exists", async () => {
      (Player.findByPk as jest.Mock).mockResolvedValue({
        toJSON: () => mockPlayerData,
      });

      const result = await playerCacheService.getPlayerByIdAndUpdate(1);

      expect(result).toEqual(mockPlayerData);
      expect(Player.findByPk).toHaveBeenCalledWith(1);
      expect(mockApiService.getPlayer).not.toHaveBeenCalled();
    });

    it("should fetch from API and create player if not in database", async () => {
      (Player.findByPk as jest.Mock).mockResolvedValue(null);
      mockApiService.getPlayer.mockResolvedValue(mockPlayerData);
      (Player.create as jest.Mock).mockResolvedValue({
        toJSON: () => mockPlayerData,
      });

      const result = await playerCacheService.getPlayerByIdAndUpdate(1);

      expect(result).toEqual(mockPlayerData);
      expect(Player.findByPk).toHaveBeenCalledWith(1);
      expect(mockApiService.getPlayer).toHaveBeenCalledWith(1);
      expect(Player.create).toHaveBeenCalledWith(mockPlayerData);
    });
  });

  describe("searchPlayers", () => {
    it("should return players from database if enough results", async () => {
      const mockPlayers = [
        mockPlayerData,
        { ...mockPlayerData, id: 2, first_name: "Jane" },
      ];
      (Player.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: mockPlayers.map((player) => ({ toJSON: () => player })),
        count: 2,
      });

      const result = await playerCacheService.searchPlayers("Doe", 1, 2);

      expect(result.data).toEqual(mockPlayers);
      expect(result.meta.next_cursor).toBeNull();
      expect(mockApiService.searchPlayers).not.toHaveBeenCalled();
    });

    it("should fetch from API if not enough results in database", async () => {
      const mockApiPlayers = [
        mockPlayerData,
        { ...mockPlayerData, id: 2, first_name: "Jane" },
      ];
      (Player.findAndCountAll as jest.Mock).mockResolvedValue({
        rows: [],
        count: 0,
      });
      mockApiService.searchPlayers.mockResolvedValue({
        data: mockApiPlayers,
        meta: { next_cursor: null, per_page: 2 },
      });
      (Player.upsert as jest.Mock).mockResolvedValue([{}, false]);

      const result = await playerCacheService.searchPlayers("Doe", 1, 2);

      expect(result.data).toEqual(mockApiPlayers);
      expect(mockApiService.searchPlayers).toHaveBeenCalledWith("Doe", 1, 2);
      expect(Player.upsert).toHaveBeenCalledTimes(2);
    });
  });
});
