'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      
    }
  }
  Order.init({
    id: {
      type:DataTypes.INTEGER,
      autoIncrement:true, 
      allowNull:false,  
      primaryKey:true
    },
    isActive: DataTypes.BOOLEAN,
    items: {
        type: DataTypes.STRING,
        get() {
            return this.getDataValue('items').split(',')
        },
        set(value) {
          if (value.constructor === Array) value = value.join(',')
          return this.setDataValue('items', value)
        }
    },
  }, {
    sequelize,
    timestamps: false
  });
  return Order;
};