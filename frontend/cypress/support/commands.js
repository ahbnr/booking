// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import { FRONTEND_URL } from './index';

Cypress.Commands.add('getBySel', (selector, ...args) => {
  return cy.get(`[data-cy=${selector}]`, ...args);
});

Cypress.Commands.add(
  'findBySel',
  { prevSubject: true },
  (subject, selector, ...args) => {
    return subject.find(`[data-cy=${selector}]`, ...args);
  }
);

Cypress.Commands.add('login', () => {
  cy.visit(FRONTEND_URL);

  cy.getBySel('login-button').click();

  cy.getBySel('admin-login-username').type('root');
  cy.getBySel('admin-login-password').type('root');

  cy.getBySel('admin-login-confirm-button').click();

  cy.getBySel('account-button');
});
