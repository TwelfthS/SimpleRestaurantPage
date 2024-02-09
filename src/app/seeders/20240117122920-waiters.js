'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
      await queryInterface.bulkInsert('Users', [{
      name: 'Ivan',
      role: 'waiter',
      orders: '',
      username: 'Ivan',
      login: 'IvanLog'
    }, {
      name: 'Svetlana',
      role: 'waiter',
      orders: '1',
      username: 'Svetlana25',
      login: 'SvetaLog'
    }, {
      name: 'Alex',
      role: 'waiter',
      orders: '',
      username: 'Alexx',
      login: 'AlexLogin'
    }], {});
    
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
