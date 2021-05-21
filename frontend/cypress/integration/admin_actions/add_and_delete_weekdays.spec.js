// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const resource_actions = require('../../support/resource_actions');
// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const weekday_actions = require('../../support/weekday_actions');

describe('Add and remove weekdays as an admin', () => {
  it('Add and remove some weekdays', () => {
    cy.login();

    cy.getBySel('start-button').click();

    resource_actions.addResource('ResourceA');
    cy.contains('[data-cy=resource-list-item]', 'ResourceA').click();

    weekday_actions.addWeekday('tuesday');
    weekday_actions.addWeekday('wednesday');

    weekday_actions.deleteWeekday('tuesday');
    weekday_actions.deleteWeekday('wednesday');
  });
});
