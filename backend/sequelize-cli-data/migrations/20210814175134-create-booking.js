'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Bookings', {
      id: {
        primaryKey: true,
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        allowNull: false,
      },
      timeslotId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Timeslots',
          key: 'id',
          as: 'timeslotId',
        },
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        notEmpty: true,
      },
      email: {
        type: Sequelize.STRING,
        isEmail: true,
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATE,
        isDate: true,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATE,
        isDate: true,
        allowNull: false,
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.dropTable('Bookings');
  },
};
