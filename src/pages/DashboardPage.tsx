import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'
import { FleetSignalCard } from '@/components/sensors/FleetSignalCard'
import { RecentlyUnassignedCard } from '@/components/sensors/RecentlyUnassignedCard'
import { SilentSensorsCard } from '@/components/sensors/SilentSensorsCard'
import { SuspendedUsersCard } from '@/components/users/SuspendedUsersCard'
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

      <SilentSensorsCard />

      <SuspendedUsersCard />
    </>
  )
}
