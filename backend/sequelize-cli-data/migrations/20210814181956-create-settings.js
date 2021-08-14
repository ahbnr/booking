'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Settings', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      bookingDeadlineMillis: {
        type: Sequelize.INTEGER,
        allowNull: false,
        notEmpty: true,
        defaultValue: 0,
      },
      maxBookingWeekDistance: {
        type: Sequelize.INTEGER,
        allowNull: false,
        notEmpty: true,
        defaultValue: -1,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Settings');
  },
};
