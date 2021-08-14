'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      name: {
        primaryKey: true,
        allowNull: false,
        notEmpty: true,
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
        isEmail: true,
        allowNull: true,
      },
      password: {
        type: Sequelize.STRING,
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
