import type { Sensor, SensorStatus, SensorType } from '@/types'
import type { AdminSensorApiRow } from '@/lib/api/sensors'

export function mapSensorRow(row: AdminSensorApiRow): Sensor {
  return {
    id: row.id,
    terminalId: row.terminalId,
    name: row.name,
    type: row.type as SensorType,
    status: row.status as SensorStatus,
    ownerId: row.owner?.id ?? null,
    ownerEmail: row.owner?.email ?? null,
    lastReadingAt: row.lastReadingAt,
    lastBatteryVoltage: row.lastBatteryVoltage,
    createdAt: row.createdAt,
  }
}
