'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Settings', 'requireMailConfirmation', {
      type: Sequelize.BOOLEAN,
      notEmpty: true,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Settings', 'requireMailConfirmation');
  },
};
