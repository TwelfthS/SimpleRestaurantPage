'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('MenuItems', [{
      title: "Greek Pizza",
      picture: "greekp.jpg",
      cost: 500,
      callQuantity: 350,
      description: "Very good pizza"
    }, {
      title: "Cheese Pizza",
      picture: "cheesep.png",
      cost: 650,
      callQuantity: 370,
      description: "Very cheesy pizza"
    }, {
      title: "Mushroom Pizza",
      picture: "mushroomp.jpg",
      cost: 450,
      callQuantity: 200,
      description: "Very mushroom pizza"
    }, {
      title: "Coffee",
      picture: "coffee.jpeg",
      cost: 50,
      callQuantity: 20,
      description: "Hot coffee"
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
