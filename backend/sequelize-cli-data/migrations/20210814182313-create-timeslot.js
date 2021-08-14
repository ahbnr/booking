'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Timeslots', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        onDelete: 'CASCADE',
        autoIncrement: true,
        primaryKey: true,
      },
      weekdayId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Weekdays',
          key: 'id',
          as: 'weekdayId',
        },
      },
      startHours: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      startMinutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      endHours: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      endMinutes: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    await queryInterface.dropTable('Timeslots');
  },
};
