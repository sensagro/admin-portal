export type UserRole = 'FARMER' | 'ADMIN' | 'SUPPORT'

export type SensorStatus =
  | 'UNASSIGNED'
  | 'ASSIGNED'
  | 'SUSPENDED'
  | 'DECOMMISSIONED'

export type SensorType = 'WATER_SENSOR'

export interface User {
  id: string
  email: string
  role: UserRole
  createdAt: string
  updatedAt: string
}

export interface Sensor {
  id: string
  terminalId: string
  name: string
  type: SensorType
  status: SensorStatus
  ownerEmail: string | null
  farmName: string | null
  lastReadingAt: string | null
  lastBatteryVoltage: number | null
  createdAt: string
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

export type PageId = 'users' | 'sensors' | 'audit'
