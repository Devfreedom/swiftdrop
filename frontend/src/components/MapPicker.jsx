// Map pin picker for the New Delivery form: tap to drop a pin, drag it to
// adjust, optional "use my current location" and address search (Nominatim).
// Coordinates are optional — typed addresses stay the source of truth.
import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DEFAULT_CENTER = [5.6037, -0.187]; // Accra fallback until a pin is set

const PICK_ICON = L.divIcon({
  className: "sd-pin sd-pin-pick",
  html: `<span aria-hidden="true">+</span>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

function ClickToSet({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) });
    },
  });
  return null;
}

function Recenter({ pos }) {
  const map = useMap();
  const first = useRef(true);
  useEffect(() => {
    if (pos && first.current) {
      map.setView([pos.lat, pos.lng], 14);
      first.current = false;
    }
  }, [map, pos]);
  return null;
}

function validCoords(p) {
  return (
    !!p &&
    typeof p.lat === "number" &&
    typeof p.lng === "number" &&
    p.lat >= -90 && p.lat <= 90 &&
    p.lng >= -180 && p.lng <= 180
  );
}

export default function MapPicker({ id, label, value, onChange, showLocate }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState("");
  const [locating, setLocating] = useState(false);
  const [locateErr, setLocateErr] = useState("");
  const timer = useRef(null);

  // Debounced Nominatim search (at least 1s after the last keystroke).
  useEffect(() => {
    clearTimeout(timer.current);
    if (query.trim().length < 3) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    setSearchErr("");
    timer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=5&q=${encodeURIComponent(query.trim())}`,
          { headers: { Accept: "application/json" } }
        );
        if (!res.ok) throw new Error(`Search failed (${res.status})`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch {
        setResults([]);
        setSearchErr("Address search isn't available right now — you can still tap the map to drop a pin.");
      } finally {
        setSearching(false);
      }
    }, 1100);
    return () => clearTimeout(timer.current);
  }, [query]);

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setLocateErr("Geolocation isn't supported on this device — tap the map instead.");
      return;
    }
    setLocating(true);
    setLocateErr("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onChange({
          lat: Number(pos.coords.latitude.toFixed(6)),
          lng: Number(pos.coords.longitude.toFixed(6)),
        });
      },
      () => {
        setLocating(false);
        setLocateErr("Couldn't get your location — tap the map to drop a pin instead.");
      },
      { timeout: 10000 }
    );
  }

  const pos = validCoords(value) ? value : null;
  const center = pos ? [pos.lat, pos.lng] : DEFAULT_CENTER;

  return (
    <div className="map-picker">
      <span className="field-label" id={`${id}-label`}>{label} (optional)</span>
      <div className="map-search">
        <label className="sd-sr" htmlFor={`${id}-search`}>Search for {label}</label>
        <input
          id={`${id}-search`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search address…"
          autoComplete="off"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls={`${id}-results`}
        />
        {searching && <small className="muted">Searching…</small>}
      </div>
      {searchErr && <p className="muted small">{searchErr}</p>}
      {results.length > 0 && (
        <ul className="map-results" id={`${id}-results`} role="listbox" aria-label="Search results">
          {results.map((r) => (
            <li key={r.place_id} role="option" aria-selected="false">
              <button
                type="button"
                onClick={() => {
                  onChange({ lat: Number(Number(r.lat).toFixed(6)), lng: Number(Number(r.lon).toFixed(6)) });
                  setResults([]);
                  setQuery(r.display_name);
                }}
              >
                {r.display_name}
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="muted small map-credit">
        Search by <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> Nominatim
      </p>
      <div className="sd-map" style={{ height: 220 }}>
        <MapContainer
          center={center}
          zoom={pos ? 14 : 11}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
          aria-label={`${label} picker map. Activate, then use arrow keys on the pin or tap to place it.`}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickToSet onPick={onChange} />
          <Recenter pos={pos} />
          {pos && (
            <Marker
              position={[pos.lat, pos.lng]}
              icon={PICK_ICON}
              draggable
              keyboard
              title={`${label} pin — drag to adjust`}
              eventHandlers={{
                dragend(e) {
                  const m = e.target.getLatLng();
                  onChange({ lat: Number(m.lat.toFixed(6)), lng: Number(m.lng.toFixed(6)) });
                },
              }}
            />
          )}
        </MapContainer>
      </div>
      <div className="inline map-picker-actions">
        {showLocate && (
          <button type="button" className="btn btn-ghost" onClick={useMyLocation} disabled={locating}>
            {locating ? "Locating…" : "Use my current location"}
          </button>
        )}
        {pos && (
          <button type="button" className="btn btn-ghost" onClick={() => onChange(null)}>
            Clear pin
          </button>
        )}
      </div>
      {locateErr && <p className="muted small">{locateErr}</p>}
      <p className="muted small">
        {pos ? `Pinned at ${pos.lat}, ${pos.lng}. ` : "No pin yet — tap the map to drop one. "}
        The typed address above is what the rider follows.
      </p>
    </div>
  );
}
