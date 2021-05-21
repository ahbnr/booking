// eslint-disable-next-line no-undef
module.exports = {
  addWeekday: function (weekdayName) {
    cy.getBySel('add-weekday-button').click();
    cy.getBySel('weekday-select').click();

    cy.getBySel(`weekday-select-option-${weekdayName}`).click();

    cy.getBySel('add-weekday-confirm-button').click();

    cy.getBySel(`weekday-list-item-${weekdayName}`).should('exist');
  },

  deleteWeekday: function (weekdayName) {
    cy.contains('[data-cy=weekday-list-item]', weekdayName)
      .parent() // Sadly, secondary actions like the delete action are not in the same dom element... introducing this detail into the tests here is ugly... but im unsure what can be done instead
      .within(() => {
        cy.getBySel('weekday-delete-button').click();
      });

    cy.getBySel('delete-confirm-button').click();

    cy.contains('[data-cy=weekday-list-item]', weekdayName).should('not.exist');
  },
};
