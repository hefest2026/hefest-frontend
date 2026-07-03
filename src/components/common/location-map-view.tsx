import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-icon-fix";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import type { LatLng } from "@/lib/location-coords";

interface LocationMapViewProps {
  coords: LatLng;
}

export function LocationMapView({ coords }: LocationMapViewProps) {
  return (
    <div className="h-64 w-full overflow-hidden border border-border">
      <MapContainer
        center={coords}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={coords} />
      </MapContainer>
    </div>
  );
}
