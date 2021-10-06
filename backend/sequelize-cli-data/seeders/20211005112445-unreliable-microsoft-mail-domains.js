'use strict';

const microsoftMailBaseDomains = ['hotmail', 'outlook', 'live'];
const countrySpecific = [
  '.com',
  '.com.ar',
  '.com.au',
  '.at',
  '.be',
  '.com.br',
  '.cl',
  '.cz',
  '.dk',
  '.fr',
  '.de',
  '.com.gr',
  '.co.il',
  '.in',
  '.co.id',
  '.ie',
  '.it',
  '.hu',
  '.jp',
  '.kr',
  '.lv',
  '.my',
  '.co.nz',
  '.com.pe',
  '.ph',
  '.pt',
  '.sa',
  '.sg',
  '.sk',
  '.es',
  '.co.th',
  '.com.tr',
  '.com.vn',
];

const additionalMicrosoftMailDomains = ['msn.com', 'passport.com'];

const microsoftMailDomains = []
  .concat(
    ...countrySpecific.map((postfix) =>
      microsoftMailBaseDomains.map((base) => base + postfix)
    )
  )
  .concat(additionalMicrosoftMailDomains);

const commentedOutMicrosoftMailDomains = microsoftMailDomains.map(
  (domain) => '# ' + domain
);

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      'UnreliableMailDomains',
      commentedOutMicrosoftMailDomains.map((domain) => ({
        domain: domain,
        createdAt: new Date(),
        updatedAt: new Date(),
      }))
    );
  },

  down: async (queryInterface, Sequelize) => {
    const Op = Sequelize.Op;

    await queryInterface.bulkDelete(
      'UnreliableMailDomains',
      {
        domain: { [Op.in]: commentedOutMicrosoftMailDomains },
      },
      {}
    );
  },
};
