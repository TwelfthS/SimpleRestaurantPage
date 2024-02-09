'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MenuItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
    }
  }
  MenuItem.init({
    id: {
      type:DataTypes.INTEGER,
      autoIncrement:true, 
      allowNull:false,  
      primaryKey:true
    },
    title: DataTypes.STRING,
    picture: DataTypes.STRING,
    cost: DataTypes.INTEGER,
    callQuantity: DataTypes.INTEGER,
    description: DataTypes.STRING
  }, {
    sequelize,
    timestamps: false
  });
  return MenuItem;
};