'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
    }
  }
  User.init({
    id:{ 
      type:DataTypes.INTEGER,  
      autoIncrement:true, 
      allowNull:false,  
      primaryKey:true
    },
    name: DataTypes.STRING,
    orders: {
        type: DataTypes.STRING,
        get() {
            return this.getDataValue('orders').split(',')
        },
        set(value) {
          if (value.constructor === Array) value = value.join(',')
          return this.setDataValue('orders', value)
        }
    },
    role: DataTypes.STRING,
    username: DataTypes.STRING,
    login: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING
  }, {
    sequelize,
    timestamps: false
  });
  return User;
};