import { Model, DataTypes, Sequelize } from 'sequelize';

export interface PlayerStatsAttributes {
  id: number;
  player_id: number;
  game_id: number;
  points: number;
  assists: number;
  rebounds: number;
}

export class PlayerStats extends Model<PlayerStatsAttributes> implements PlayerStatsAttributes {
  public id!: number;
  public player_id!: number;
  public game_id!: number;
  public points!: number;
  public assists!: number;
  public rebounds!: number;

  static initialize(sequelize: Sequelize): void {
    PlayerStats.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        player_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        game_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        points: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        assists: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        rebounds: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: 'player_stats',
        timestamps: false,
      }
    );
  }
}
