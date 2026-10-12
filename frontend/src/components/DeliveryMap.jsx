// Reusable delivery map (Leaflet + OpenStreetMap tiles): pickup pin,
// drop-off pin, rider marker, straight dashed line between the two points.
// Auto-fits bounds; graceful empty state when nothing has coordinates.
import { useEffect } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const hasPos = (p) =>
  !!p && Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng));

const toLatLng = (p) => [Number(p.lat), Number(p.lng)];

const pinIcon = (cls, glyph) =>
  L.divIcon({
    className: `sd-pin ${cls}`,
    html: `<span aria-hidden="true">${glyph}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });

const PICKUP_ICON = pinIcon("sd-pin-pickup", "P");
const DROPOFF_ICON = pinIcon("sd-pin-drop", "D");
const RIDER_ICON = L.divIcon({
  className: "sd-rider",
  html: `<span class="sd-rider-dot" aria-hidden="true"></span>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

function FitBounds({ points }) {
  const map = useMap();
  const key = JSON.stringify(points);
  useEffect(() => {
    const pts = JSON.parse(key);
    if (pts.length > 1) map.fitBounds(L.latLngBounds(pts), { padding: [28, 28] });
    else if (pts.length === 1) map.setView(pts[0], 14);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key]);
  return null;
}

export default function DeliveryMap({
  pickup,
  dropoff,
  rider,
  label = "Delivery map",
  height = 260,
}) {
  const pts = [pickup, dropoff, rider].filter(hasPos).map(toLatLng);
  if (pts.length === 0) {
    return (
      <div className="sd-map-empty" role="status">
        Map unavailable — no locations for this delivery yet.
      </div>
    );
  }
  const line =
    hasPos(pickup) && hasPos(dropoff) ? [toLatLng(pickup), toLatLng(dropoff)] : null;
  return (
    <div className="sd-map" style={{ height }}>
      <MapContainer
        center={pts[0]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
        aria-label={label}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={pts} />
        {hasPos(pickup) && (
          <Marker position={toLatLng(pickup)} icon={PICKUP_ICON} title="Pickup" />
        )}
        {hasPos(dropoff) && (
          <Marker position={toLatLng(dropoff)} icon={DROPOFF_ICON} title="Drop-off" />
        )}
        {hasPos(rider) && (
          <Marker position={toLatLng(rider)} icon={RIDER_ICON} title="Rider" />
        )}
        {line && <Polyline positions={line} pathOptions={{ dashArray: "8 8" }} />}
      </MapContainer>
    </div>
  );
}
