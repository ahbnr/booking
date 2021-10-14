'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('RefreshTokens', 'userName', {
      type: Sequelize.STRING(32),
      allowNull: false,
      references: {
        model: 'Users',
        key: 'name',
        as: 'userName',
      },
      onDelete: 'CASCADE',
    });

    await queryInterface.changeColumn('Weekdays', 'resourceName', {
      type: Sequelize.STRING(64),
      allowNull: false,
      references: {
        model: 'Resources',
        key: 'name',
        as: 'resourceName',
      },
      onDelete: 'CASCADE',
    });

    await queryInterface.changeColumn('Timeslots', 'weekdayId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Weekdays',
        key: 'id',
        as: 'weekdayId',
      },
      onDelete: 'CASCADE',
    });

    await queryInterface.changeColumn('Bookings', 'timeslotId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Timeslots',
        key: 'id',
        as: 'timeslotId',
      },
      onDelete: 'CASCADE',
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('RefreshTokens', 'userName', {
      type: Sequelize.STRING(32),
      allowNull: false,
      references: {
        model: 'Users',
        key: 'name',
        as: 'userName',
      },
      onDelete: 'SET NULL|NO ACTION',
    });

    await queryInterface.changeColumn('Weekdays', 'resourceName', {
      type: Sequelize.STRING(64),
      allowNull: false,
      references: {
        model: 'Resources',
        key: 'name',
        as: 'resourceName',
      },
      onDelete: 'SET NULL|NO ACTION',
    });

    await queryInterface.changeColumn('Timeslots', 'weekdayId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Weekdays',
        key: 'id',
        as: 'weekdayId',
      },
      onDelete: 'SET NULL|NO ACTION',
    });

    await queryInterface.changeColumn('Bookings', 'timeslotId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Timeslots',
        key: 'id',
        as: 'timeslotId',
      },
      onDelete: 'SET NULL|NO ACTION',
    });
  },
};
