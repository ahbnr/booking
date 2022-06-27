'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Settings', 'enableBookingDeadline', {
      type: Sequelize.BOOLEAN,
      notEmpty: true,
      allowNull: false,
      defaultValue: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Settings', 'enableBookingDeadline');
  },
};
