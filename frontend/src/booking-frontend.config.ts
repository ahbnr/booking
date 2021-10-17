// TODO: Retrieve most settings from server

interface IFrontendConfig {
  language: string;
  organization: string;
  appBarTitle: string;
  welcomeHint?: string; // Will be shown on the first welcome page as emphasized text
  privacyInfo: {
    entitiesWithDataAccess: string[];
    privacyStatementUrl?: string;
  };
  errorContacts: {
    name: string;
    phone: string;
  }[];
}

const FrontendConfig: IFrontendConfig = {
  language: 'de',
  organization: 'My Organization',
  appBarTitle: '',
  privacyInfo: {
    entitiesWithDataAccess: ['Staff of My Organization'],
    privacyStatementUrl: 'https://localhost:8000',
  },
  errorContacts: [{ name: 'Mr. Admin', phone: '0170 42 42 42' }],
};

export default FrontendConfig;
