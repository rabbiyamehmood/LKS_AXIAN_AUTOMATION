/**
 * Aggregator Test Data
 * Uses timestamp-based unique values to avoid conflicts on every run.
 */

export interface AggregatorData {
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
}

/**
 * Generates a unique valid aggregator dataset using current timestamp.
 * Each call returns fresh data — safe for parallel or repeated runs.
 */
export function generateAggregatorData(): AggregatorData {
  const ts = Date.now();
  return {
    name:          `Auto_Aggregator_${ts}`,
    contactPerson: `Contact_${ts}`,
    email:         `aggregator${ts}@yopmail.com`,
    phone:         `7${String(ts).slice(-8)}`,
  };
}

// ── Negative test data ────────────────────────────────────────────────────────

export const negativeAggregatorData = {

  /** All fields empty — Save button should remain disabled */
  allEmpty: {
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
  },

  /** Name left empty — required field validation */
  emptyName: {
    name: '',
    contactPerson: 'Contact Person',
    email: `empty_name_${Date.now()}@yopmail.com`,
    phone: '700000001',
  },

  /** Malformed email — should trigger email validation error */
  invalidEmail: {
    name: `Auto_InvalidEmail_${Date.now()}`,
    contactPerson: 'Contact Person',
    email: 'not-a-valid-email',
    phone: '700000002',
  },

  /** Non-numeric phone — should trigger phone validation error */
  invalidPhone: {
    name: `Auto_InvalidPhone_${Date.now()}`,
    contactPerson: 'Contact Person',
    email: `invalid_phone_${Date.now()}@yopmail.com`,
    phone: 'ABCDEFGH',
  },

  /** Phone too short — should trigger length validation */
  shortPhone: {
    name: `Auto_ShortPhone_${Date.now()}`,
    contactPerson: 'Contact Person',
    email: `short_phone_${Date.now()}@yopmail.com`,
    phone: '123',
  },
};

// ── Checker data ──────────────────────────────────────────────────────────────

export const checkerComments = {
  approve: 'Approved by AdminChecker - Automation Test',
  reject:  'Rejected by AdminChecker - Automation Test: Invalid details',
};
