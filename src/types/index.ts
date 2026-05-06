export type UserRole = 'FARMER' | 'ADMIN'

export type SensorStatus =
  | 'UNASSIGNED'
  | 'ASSIGNED'
  | 'SUSPENDED'
  | 'DECOMMISSIONED'

export type SensorType = 'WATER_SENSOR' | 'TEST_SENSOR'

/** Derived from lastReadingAt vs silent threshold (aligned with backend). */
export type SensorSignalStatus = 'FRESH' | 'NEVER_REPORTED' | 'SILENT'

export interface User {
  id: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
  /** Present on admin user list/detail when the account is sensor-suspended. */
  suspendedAt?: string | null
}

export interface Sensor {
  id: string
  terminalId: string
  name: string
  type: SensorType
  status: SensorStatus
  ownerId: string | null
  ownerEmail: string | null
  lastReadingAt: string | null
  lastBatteryVoltage: number | null
  lastTemperature?: number | null
  lastElevation?: number | null
  lastAlertHasWater?: boolean | null
  createdAt: string
  signalStatus?: SensorSignalStatus
  silentSince?: string | null
  /** Admin-only: bulk user suspension provenance. */
  suspendedByUserSuspension?: boolean
}

export interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  actorEmail: string
  payload: Record<string, unknown> | null
  createdAt: string
}

export interface UserDetail extends User {
  suspendedSensorCount?: number
  ownedSensors: (Pick<Sensor, 'id' | 'terminalId' | 'name' | 'status'> & {
    suspendedByUserSuspension?: boolean
  })[]
  pushTokens: { id: string; createdAt: string }[]
}

export type ReadingType = 'PERIODIC' | 'ALERT'

export interface SensorReading {
  id: string
  timestamp: string
  type: ReadingType
  hasWater: boolean | null
  batteryVoltage: number | null
  temperature: number | null
  elevation: number | null
}

export interface SensorDetail extends Sensor {
  owner: { id: string; email: string } | null
  readings: SensorReading[]
}
