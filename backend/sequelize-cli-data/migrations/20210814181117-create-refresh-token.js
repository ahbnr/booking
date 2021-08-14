'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('RefreshTokens', {
      token: {
        type: Sequelize.STRING,
        allowNull: false,
        notEmpty: true,
        primaryKey: true,
      },
      activation: {
        type: Sequelize.STRING,
        allowNull: false,
        notEmpty: true,
      },
      userName: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'name',
          as: 'userName',
        },
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: false,
        notEmpty: true,
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
    await queryInterface.dropTable('RefreshTokens');
  },
};
