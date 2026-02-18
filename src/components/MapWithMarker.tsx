"use client"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

// Fix para iconos de Leaflet en Next.js
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})

const UBICACION = { lat: -33.0066, lng: -71.55 } as const

export function MapWithMarker() {
  return (
    <MapContainer
      center={[UBICACION.lat, UBICACION.lng]}
      zoom={16}
      className="h-full w-full"
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker
        position={[UBICACION.lat, UBICACION.lng]}
        icon={icon}
        eventHandlers={{
          add: (e) => e.target.openPopup(),
        }}
      >
        <Popup>
          <strong>Arriendos Puerto Pacífico</strong>
          <br />
          Av. Jorge Montt 1598, Viña del Mar
        </Popup>
      </Marker>
    </MapContainer>
  )
}
