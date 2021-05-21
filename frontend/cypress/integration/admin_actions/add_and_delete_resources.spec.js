// eslint-disable-next-line @typescript-eslint/no-var-requires,no-undef
const resource_actions = require('../../support/resource_actions');

describe('Add and remove resources as an admin', () => {
  it('Add and remove some resources', () => {
    cy.login();

    cy.getBySel('start-button').click();

    resource_actions.addResource('ResourceA');
    resource_actions.addResource('ResourceB');

    cy.getBySel('resource-list-item').should('have.length', 2);

    resource_actions.deleteResource('ResourceA');
    resource_actions.deleteResource('ResourceB');

    cy.getBySel('resource-list-item').should('have.length', 0);
  });
});
