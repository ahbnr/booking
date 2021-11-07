'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('BlockedDates', 'note', {
      type: Sequelize.STRING(256),
      notEmpty: true,
      allowNull: true,
      defaultValue: null,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('BlockedDates', 'note');
  },
};
