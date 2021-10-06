'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      name: {
        primaryKey: true,
        allowNull: false,
        notEmpty: true,
        type: Sequelize.STRING(32),
      },
      email: {
        type: Sequelize.STRING(320),
        isEmail: true,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING(60),
        notEmpty: true,
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
    await queryInterface.dropTable('Users');
  },
};
