'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING
      },
      orders: {
          type: Sequelize.STRING,
          get() {
              return this.getDataValue('orders').split(',')
          },
          set(value) {
            if (value.constructor === Array) value = value.join(',')
            return this.setDataValue('orders', value)
          }
      },
      role: {
        type: Sequelize.STRING
      },
      username: {
        type: Sequelize.STRING
      },
      login: {
        type: Sequelize.STRING,
        unique: true
      },
      password: {
        type: Sequelize.STRING
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users');
  }
};