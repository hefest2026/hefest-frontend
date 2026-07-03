import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-icon-fix";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLng } from "@/lib/location-coords";

/** Burgas city centre — sensible default pin before the organizer picks one. */
const DEFAULT_CENTER: LatLng = { lat: 42.5048, lng: 27.4626 };

interface LocationMapPickerProps {
  value: LatLng | null;
  onChange: (coords: LatLng) => void;
}

function ClickHandler({ onChange }: { onChange: (coords: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export function LocationMapPicker({ value, onChange }: LocationMapPickerProps) {
  const center = value ?? DEFAULT_CENTER;

  return (
    <div className="h-64 w-full overflow-hidden border border-input">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={center} />
        <ClickHandler onChange={onChange} />
      </MapContainer>
    </div>
  );
}

export { DEFAULT_CENTER };
