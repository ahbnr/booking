interface BackendConfigI {
  mailService: 'etheral';
  sendConfirmationMail: boolean;
}

const BackendConfig: BackendConfigI = {
  mailService: 'etheral',
  // DEBUG OPTION: Do not send mails that prompt users to confirm their bookings if false.
  // Also, bookings will be verified automatically if set to false
  sendConfirmationMail: true,
};

export default BackendConfig;
