// TODO: Retrieve most settings from server

interface IFrontendConfig {
  language: string;
  organization: string;
  appBarTitle: string;
  privacyInfo: {
    entitiesWithDataAccess: string[];
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
  },
  errorContacts: [],
};

export default FrontendConfig;
