import { Model, DataTypes, Sequelize } from "sequelize";

export interface PlayerAttributes {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  height: string;
  weight: string;
  jersey_number: string;
  college: string;
  country: string;
  draft_year: number;
  draft_round: number;
  draft_number: number;
  team_id: number;
}

export class Player
  extends Model<PlayerAttributes>
  implements PlayerAttributes {
  public id!: number;
  public first_name!: string;
  public last_name!: string;
  public position!: string;
  public height!: string;
  public weight!: string;
  public jersey_number!: string;
  public college!: string;
  public country!: string;
  public draft_year!: number;
  public draft_round!: number;
  public draft_number!: number;
  public team_id!: number;

  static initialize(sequelize: Sequelize): void {
    Player.init(
      {
        id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: false, // This is correct as per the API response
        },
        first_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        last_name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        position: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        height: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        weight: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        jersey_number: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        college: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        country: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        draft_year: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        draft_round: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        draft_number: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        team_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        tableName: "players",
        timestamps: true,
        updatedAt: "updated_at",
        createdAt: false,
      }
    );
  }
}
