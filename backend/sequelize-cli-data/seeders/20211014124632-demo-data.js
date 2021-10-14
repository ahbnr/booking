'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create resources
    const resourceMuster = 'Dr. Muster - Sprechstunde';
    const resourceBecker = 'Prof. Becker - Sprechstunde';
    await queryInterface.bulkInsert(
      'Resources',
      [
        {
          name: resourceMuster,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: resourceBecker,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Create weekdays
    await queryInterface.bulkInsert(
      'Weekdays',
      [
        {
          id: 42,
          name: 'tuesday',
          resourceName: resourceMuster,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 43,
          name: 'friday',
          resourceName: resourceMuster,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );

    // Create Timeslots
    await queryInterface.bulkInsert(
      'Timeslots',
      [
        {
          weekdayId: 42,
          startHours: 11,
          startMinutes: 0,
          endHours: 11,
          endMinutes: 30,
          capacity: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          weekdayId: 42,
          startHours: 11,
          startMinutes: 30,
          endHours: 12,
          endMinutes: 0,
          capacity: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Resources', null, {}); // This is not really exact...
  },
};
