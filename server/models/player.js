'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Player extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Player.init({
    id: DataTypes.INTEGER,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    position: DataTypes.STRING,
    height: DataTypes.STRING,
    weight: DataTypes.STRING,
    jersey_number: DataTypes.STRING,
    college: DataTypes.STRING,
    country: DataTypes.STRING,
    draft_year: DataTypes.INTEGER,
    draft_round: DataTypes.INTEGER,
    draft_number: DataTypes.INTEGER,
    team_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Player',
  });
  return Player;
};