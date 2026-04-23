/** Actions written by admin APIs; keep aligned with backend audit calls. */
export const AUDIT_ACTION_OPTIONS = [
  'SENSOR_BULK_REGISTER',
  'SENSOR_ASSIGN',
  'SENSOR_UNASSIGN',
  'SENSOR_TRANSFER',
  'SENSOR_SUSPEND',
  'SENSOR_UNSUSPEND',
  'SENSOR_DECOMMISSION',
  'USER_ROLE_CHANGE',
  'USER_SUSPEND',
  'USER_REACTIVATE',
] as const
