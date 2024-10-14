import { PlayerCacheService } from '../../src/services/PlayerCacheService';
import { Player, PlayerAttributes } from '../../src/models/Player';
import axios from 'axios';

jest.mock('../../src/models/Player');
jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('PlayerCacheService', () => {
  let playerCacheService: PlayerCacheService;

  beforeEach(() => {
    playerCacheService = new PlayerCacheService();
    jest.clearAllMocks();
  });

  it('should return player data from DB if available', async () => {
    const mockPlayerFromDb: PlayerAttributes = {
      id: 2,
      first_name: 'Jane',
      last_name: 'Smith',
      position: 'F',
      height: '6-5',
      weight: '190',
      jersey_number: '23',
      college: 'State University',
      country: 'USA',
      draft_year: 2018,
      draft_round: 1,
      draft_number: 5,
      team_id: 2,
    };

    (Player.findByPk as jest.Mock).mockResolvedValue({
      get: jest.fn().mockReturnValue(mockPlayerFromDb),
    });

    const result = await playerCacheService.getPlayerByIdAndUpdate(2);

    expect(result).toEqual(mockPlayerFromDb);
    expect(Player.findByPk).toHaveBeenCalledWith(2);
  });

  it('should return player data from API if not found in DB', async () => {
    const mockPlayerFromApi = {
      id: 3,
      first_name: 'Mike',
      last_name: 'Jordan',
      position: 'G',
      height: '6-6',
      weight: '200',
      jersey_number: '23',
      college: 'North Carolina',
      country: 'USA',
      draft_year: 1984,
      draft_round: 1,
      draft_number: 3,
      team: { id: 3 },
    };

    const mockCreatedPlayer = {
      ...mockPlayerFromApi,
      team_id: 3,
      toJSON: jest.fn().mockReturnValue({
        ...mockPlayerFromApi,
        team_id: 3,
      }),
    };

    (Player.findByPk as jest.Mock).mockResolvedValue(null);
    mockedAxios.get.mockResolvedValue({ status: 200, data: mockPlayerFromApi });
    (Player.create as jest.Mock).mockResolvedValue(mockCreatedPlayer);

    const result = await playerCacheService.getPlayerByIdAndUpdate(3);

    expect(result).toEqual(expect.objectContaining({
      id: 3,
      first_name: 'Mike',
      last_name: 'Jordan',
      position: 'G',
      height: '6-6',
      weight: '200',
      jersey_number: '23',
      college: 'North Carolina',
      country: 'USA',
      draft_year: 1984,
      draft_round: 1,
      draft_number: 3,
      team_id: 3,
    }));
    expect(Player.findByPk).toHaveBeenCalledWith(3);
    expect(mockedAxios.get).toHaveBeenCalledWith('https://www.balldontlie.io/api/v1/players/3');
    expect(Player.create).toHaveBeenCalled();
  });

  it('should return null if player data is not found in DB or API', async () => {
    (Player.findByPk as jest.Mock).mockResolvedValue(null);
    mockedAxios.get.mockResolvedValue({ status: 404 });

    const result = await playerCacheService.getPlayerByIdAndUpdate(4);

    expect(result).toBeNull();
    expect(Player.findByPk).toHaveBeenCalledWith(4);
    expect(mockedAxios.get).toHaveBeenCalledWith('https://www.balldontlie.io/api/v1/players/4');
  });
});
