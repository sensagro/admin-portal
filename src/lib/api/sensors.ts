import type { SensorDetail } from '@/types'
import { apiFetch } from './client'

export interface AdminSensorApiRow {
  id: string
  terminalId: string
  name: string
  type: string
  status: string
  lastReadingAt: string | null
  lastBatteryVoltage: number | null
  createdAt: string
  owner: { id: string; email: string } | null
}

export async function fetchAdminSensors(
  getIdToken: () => Promise<string | null>,
  limit = 200,
): Promise<AdminSensorApiRow[]> {
  return apiFetch<AdminSensorApiRow[]>(`/admin/sensors?limit=${limit}`, getIdToken)
}

export interface BulkRegisterSensorsResult {
  registered: number
  sensors: AdminSensorApiRow[]
}

export async function bulkRegisterSensors(
  getIdToken: () => Promise<string | null>,
  payload: { terminalIds: string[]; type?: string },
): Promise<BulkRegisterSensorsResult> {
  return apiFetch<BulkRegisterSensorsResult>('/admin/sensors/bulk-register', getIdToken, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function assignSensor(
  getIdToken: () => Promise<string | null>,
  sensorId: string,
  userId: string,
): Promise<unknown> {
  return apiFetch(`/admin/sensors/${encodeURIComponent(sensorId)}/assign`, getIdToken, {
    method: 'PATCH',
    body: JSON.stringify({ userId }),
  })
}

export async function unassignSensor(
  getIdToken: () => Promise<string | null>,
  sensorId: string,
): Promise<unknown> {
  return apiFetch(`/admin/sensors/${encodeURIComponent(sensorId)}/unassign`, getIdToken, {
    method: 'PATCH',
  })
}

export async function transferSensor(
  getIdToken: () => Promise<string | null>,
  sensorId: string,
  newUserId: string,
): Promise<unknown> {
  return apiFetch(`/admin/sensors/${encodeURIComponent(sensorId)}/transfer`, getIdToken, {
    method: 'PATCH',
    body: JSON.stringify({ newUserId }),
  })
}

export async function suspendSensor(
  getIdToken: () => Promise<string | null>,
  sensorId: string,
): Promise<unknown> {
  return apiFetch(`/admin/sensors/${encodeURIComponent(sensorId)}/suspend`, getIdToken, {
    method: 'PATCH',
  })
}

export async function decommissionSensor(
  getIdToken: () => Promise<string | null>,
  sensorId: string,
): Promise<unknown> {
  return apiFetch(`/admin/sensors/${encodeURIComponent(sensorId)}/decommission`, getIdToken, {
    method: 'PATCH',
  })
}

export async function fetchAdminSensor(
  sensorId: string,
  getIdToken: () => Promise<string | null>,
): Promise<SensorDetail> {
  return apiFetch<SensorDetail>(`/admin/sensors/${encodeURIComponent(sensorId)}`, getIdToken)
}
