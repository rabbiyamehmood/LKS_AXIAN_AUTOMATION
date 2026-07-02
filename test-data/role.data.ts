export interface RoleData {
  name: string;
  description: string;
}

/**
 * Generates unique role data using timestamp — safe for repeated runs.
 */
export function generateRoleData(): RoleData {
  const ts = Date.now();
  return {
    name:        `AutoRole_${ts}`,
    description: `Automation test role created at ${new Date(ts).toISOString()}`,
  };
}

// ── Checker comments ──────────────────────────────────────────────────────────

export const roleCheckerComments = {
  approve: 'Approved by AdminChecker - Automation Test',
  reject:  'Rejected by AdminChecker - Automation Test: Invalid role details',
};
