import type { Sensor, SensorDetail, SensorStatus, SensorType } from '@/types'
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

export function mapSensorDetailToSensor(d: SensorDetail): Sensor {
  return {
    id: d.id,
    terminalId: d.terminalId,
    name: d.name,
    type: d.type,
    status: d.status,
    ownerId: d.ownerId ?? d.owner?.id ?? null,
    ownerEmail: d.owner?.email ?? null,
    lastReadingAt: d.lastReadingAt,
    lastBatteryVoltage: d.lastBatteryVoltage,
    lastTemperature: d.lastTemperature,
    lastElevation: d.lastElevation,
    lastAlertHasWater: d.lastAlertHasWater,
    createdAt: d.createdAt,
  }
}
