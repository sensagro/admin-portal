import type { SensorDetail, SensorSignalStatus } from '@/types'
import type { SensorStatus } from '@/types'
import type { AdminListResponse } from './admin-list'
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
  signalStatus?: SensorSignalStatus
  silentSince?: string | null
  suspendedByUserSuspension?: boolean
}

export type FetchAdminSensorsOptions = {
  status?: SensorStatus
}

export async function fetchAdminSensors(
  getIdToken: () => Promise<string | null>,
  limit = 200,
  cursor?: string,
  signalStatus?: SensorSignalStatus,
  options?: FetchAdminSensorsOptions,
): Promise<AdminListResponse<AdminSensorApiRow>> {
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  if (cursor) params.set('cursor', cursor)
  if (signalStatus) params.set('signalStatus', signalStatus)
  if (options?.status) params.set('status', options.status)
  return apiFetch<AdminListResponse<AdminSensorApiRow>>(
    `/admin/sensors?${params.toString()}`,
    getIdToken,
  )
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
