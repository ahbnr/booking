// eslint-disable-next-line no-undef
module.exports = {
  addResource: function (resourceName) {
    cy.getBySel('add-resource-button').click();
    cy.getBySel('add-resource-dialog-name-input').type(resourceName);
    cy.getBySel('add-resource-dialog-confirm-button').click();

    cy.contains('[data-cy=resource-list-item]', resourceName);
  },

  deleteResource: function (resourceName) {
    cy.contains('[data-cy=resource-list-item]', resourceName)
      .parent() // Sadly, secondary actions like the delete action are not in the same dom element... introducing this detail into the tests here is ugly... but im unsure what can be done instead
      .within(() => {
        cy.getBySel('resource-delete-button').click();
      });

    cy.getBySel('delete-confirm-button').click();

    cy.contains('[data-cy=resource-list-item]', resourceName).should(
      'not.exist'
    );
  },
};
