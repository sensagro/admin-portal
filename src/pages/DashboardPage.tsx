import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { FleetSignalCard } from '@/components/sensors/FleetSignalCard'
import { RecentlyUnassignedCard } from '@/components/sensors/RecentlyUnassignedCard'
import type { Sensor, SensorSignalStatus, SensorStatus } from '@/types'

export function DashboardPage() {
  const navigate = useNavigate()
  const [fleetRefreshKey] = useState(0)

  const openSensor = (sensor: Sensor) => {
    navigate(`/sensors/${encodeURIComponent(sensor.id)}`)
  }

  return (
    <>
      <PageHeader title="Panel" className="mb-6 min-w-0" />

      <FleetSignalCard
        refreshKey={fleetRefreshKey}
        onApplySignalTableFilter={(s: SensorSignalStatus | null) => {
          if (s) navigate(`/sensors?signalStatus=${encodeURIComponent(s)}`)
          else navigate('/sensors')
        }}
        onApplyStatusTableFilter={(st: SensorStatus | null) => {
          if (st) navigate(`/sensors?status=${encodeURIComponent(st)}`)
          else navigate('/sensors')
        }}
        onOpenSensor={openSensor}
      />

      <RecentlyUnassignedCard />

      {/* TODO: sensores en silencio prolongado (cron / umbral operativo) */}
      <div className="mb-6 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4 text-xs text-gray-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-gray-400">
        Alertas de silencio: pendiente
      </div>

      {/* TODO: usuarios suspendidos que requieren seguimiento */}
      <div className="mb-6 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4 text-xs text-gray-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-gray-400">
        Usuarios suspendidos: pendiente
      </div>
    </>
  )
}
