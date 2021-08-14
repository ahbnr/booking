'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Bookings', 'email', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Bookings', 'email', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
