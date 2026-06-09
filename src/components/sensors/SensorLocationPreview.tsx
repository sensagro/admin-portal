type Props = {
  lat: number | null | undefined
  lng: number | null | undefined
  /** Half-width of the bbox in degrees; smaller = more zoomed in. */
  delta?: number
  height?: number
}

export function SensorLocationPreview({
  lat,
  lng,
  delta = 0.01,
  height = 240,
}: Props) {
  if (lat == null || lng == null) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-500 dark:border-slate-700 dark:bg-slate-800/50 dark:text-gray-400"
        style={{ height }}
      >
        Sin ubicación
      </div>
    )
  }

  const bbox = `${lng - delta},${lat - delta},${lng + delta},${lat + delta}`
  const embedSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`
  const fullSrc = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-slate-700">
      <iframe
        title={`Mapa en ${lat.toFixed(5)}, ${lng.toFixed(5)}`}
        src={embedSrc}
        width="100%"
        height={height}
        loading="lazy"
        style={{ border: 0, display: 'block' }}
      />
      <div className="border-t border-gray-200 bg-gray-50 px-3 py-1.5 text-xs dark:border-slate-700 dark:bg-slate-800/50">
        <a
          href={fullSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Ver en OpenStreetMap ({lat.toFixed(5)}, {lng.toFixed(5)})
        </a>
      </div>
    </div>
  )
}
