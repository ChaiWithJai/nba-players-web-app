import { Request, Response } from 'express';
import { Op } from 'sequelize';
import { Player } from '../models/Player';
import { PlayerCacheService } from '../services/PlayerCacheService';

const playerCacheService = new PlayerCacheService();

export const getPlayers = async (req: Request, res: Response): Promise<void> => {
  try {
    const cursor = req.query.cursor ? parseInt(req.query.cursor as string) : undefined;
    const per_page = req.query.per_page ? parseInt(req.query.per_page as string) : 25;

    const players = await Player.findAll({
      limit: per_page,
      where: cursor ? { id: { [Op.gt]: cursor } } : undefined,
      order: [['id', 'ASC']],
    });

    const next_cursor = players.length > 0 ? players[players.length - 1].id : null;

    res.json({
      data: players,
      meta: {
        next_cursor,
        per_page,
      },
    });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPlayerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const player = await playerCacheService.getPlayerByIdAndUpdate(parseInt(id));

    if (player) {
      res.json({ data: player });
    } else {
      res.status(404).json({ error: 'Player not found' });
    }
  } catch (error) {
    console.error('Error fetching player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const searchPlayers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name } = req.query;

    if (!name || typeof name !== 'string') {
      res.status(400).json({ error: 'Name parameter is required' });
      return;
    }

    const players = await Player.findAll({
      where: {
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${name}%` } },
          { last_name: { [Op.iLike]: `%${name}%` } },
        ],
      },
      limit: 25,
    });

    res.json({ data: players });
  } catch (error) {
    console.error('Error searching players:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
