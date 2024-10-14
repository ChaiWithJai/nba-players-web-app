import { Request, Response } from 'express';
import { getPlayers, getPlayerById, searchPlayers } from '../../src/controllers/playerController';
import { Player } from '../../src/models/Player';
import { PlayerCacheService } from '../../src/services/PlayerCacheService';

jest.mock('../../src/models/Player');
jest.mock('../../src/services/PlayerCacheService');

describe('Player Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseJson: jest.Mock;

  beforeEach(() => {
    mockRequest = {
      query: {}
    };
    responseJson = jest.fn();
    mockResponse = {
      json: responseJson,
      status: jest.fn().mockReturnThis(),
    };
  });

  describe('getPlayers', () => {
    it('should return a list of players', async () => {
      const mockPlayers = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'Jane', last_name: 'Doe' },
      ];
      (Player.findAll as jest.Mock).mockResolvedValue(mockPlayers);

      await getPlayers(mockRequest as Request, mockResponse as Response);

      expect(responseJson).toHaveBeenCalledWith({
        data: mockPlayers,
        meta: { next_cursor: 2, per_page: 25 },
      });
    });

    it('should handle errors', async () => {
      (Player.findAll as jest.Mock).mockRejectedValue(new Error('Database error'));

      await getPlayers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getPlayerById', () => {
    it('should return a player when found', async () => {
      const mockPlayer = { id: 1, first_name: 'John', last_name: 'Doe' };
      (PlayerCacheService.prototype.getPlayerByIdAndUpdate as jest.Mock).mockResolvedValue(mockPlayer);

      mockRequest.params = { id: '1' };

      await getPlayerById(mockRequest as Request, mockResponse as Response);

      expect(responseJson).toHaveBeenCalledWith({ data: mockPlayer });
    });

    it('should return 404 when player is not found', async () => {
      (PlayerCacheService.prototype.getPlayerByIdAndUpdate as jest.Mock).mockResolvedValue(null);

      mockRequest.params = { id: '999' };

      await getPlayerById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Player not found' });
    });
  });

  describe('searchPlayers', () => {
    it('should return players matching the search term', async () => {
      const mockPlayers = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'Jane', last_name: 'Doe' },
      ];
      (Player.findAll as jest.Mock).mockResolvedValue(mockPlayers);

      mockRequest.query = { name: 'Doe' };

      await searchPlayers(mockRequest as Request, mockResponse as Response);

      expect(responseJson).toHaveBeenCalledWith({ data: mockPlayers });
    });

    it('should return 400 if name parameter is missing', async () => {
      mockRequest.query = {};

      await searchPlayers(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(responseJson).toHaveBeenCalledWith({ error: 'Name parameter is required' });
    });
  });
});
