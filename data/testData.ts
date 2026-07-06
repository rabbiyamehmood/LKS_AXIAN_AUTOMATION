export const USER = {
  email: 'daniyal.saleem@paysyslabs.com',
  password: 'Pakistan@1234',
  otp: '111111',
  mpin: '2020',
};

export const SEND_MONEY = {
  msisdn: '70000085',
  amount: '10',
};

export const BANK_TRANSFER = {
  accountNumber: '25570000085',
  amount: '100',
};

export const CASHOUT = {
  agentCode: '10234',
  amount: '500',
};

export const BILL_PAYMENT = {
  consumerNumber: '24311052799',
  amount: '1000',
};

export const SCHEDULE_ACCOUNTS = {
  // Account used for schedule payments (selected by cell/account number)
  accountNumber: '25570000082',
};

export const SCHEDULE_WALLET_TO_WALLET = {
  msisdn: '70000085',
  executionTimeDaily: '12:30',
  executionTimeMonthly: '12:45',
  percentage: '20',
  partialAmount: '50',
  weeklyDays: ['Monday', 'Thursday', 'Friday'],
  monthlyDays: ['2', '9', '15', '30'],
};

export const SCHEDULE_WALLET_TO_BANK = {
  bank: 'Access Bank',
  accountNumber: '25570000085',
  executionTimeDaily: '12:30',
  executionTimeMonthly: '12:45',
  percentage: '20',
  partialAmount: '50',
  weeklyDays: ['Monday', 'Thursday', 'Friday'],
  monthlyDays: ['2', '9', '15', '30'],
};

export const PROFILE_ACCOUNT = {
  // Account used for profile/settings tests
  accountNumber: '000921773909866',
};

export const CHANGE_PASSWORD = {
  currentPassword: 'Pakistan@1234',
  newPassword: 'Password@123',
  confirmNewPassword: 'Password@123',
  wrongCurrentPassword: 'WrongPass@999',
  mismatchedConfirm: 'Different@456',
  weakPassword: '12345',
};

export const CHANGE_MPIN = {
  oldMpin: '3030',       // MPIN used in recorded script
  newMpin: '7474',       // New MPIN from recorded script
  confirmMpin: '7474',
  wrongOldMpin: '9999',  // Bug: shows "invalid process error" instead of proper message
  mismatchedConfirm: '1111',
};
