// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const resource_actions = require('../../support/resource_actions');
// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const weekday_actions = require('../../support/weekday_actions');

//describe('Add and remove timeslots as an admin', () => {
//  it('Add and remove some timeslots', () => {
//    cy.login();
//
//    cy.getBySel('start-button').click();
//
//    resource_actions.addResource('ResourceA');
//    cy.contains('[data-cy=resource-list-item]', 'ResourceA').click();
//
//    weekday_actions.addWeekday('tuesday');
//    cy.contains('[data-cy=weekday-list-item]', 'tuesday').click();
//
//    cy.getBySel('add-timeslot-button').click();
//
//    cy.getBySel('start-time').click();
//
//    cy.get('[role=dialog]:visible')
//      .contains('13')
//      .trigger('mouseover', { force: true })
//      .click({ force: true });
//  });
//});
