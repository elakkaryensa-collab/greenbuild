import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RegionData } from "../data/normesRTCM";
import type { ClasseEnergetique } from "../types/Score";

// Correction des icônes Leaflet par défaut
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
// Remplacez votre bloc de code par celui-ci :
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: string })._getIconUrl;

L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface CarteMarocProps {
  regions: RegionData[];
}

const COULEURS_HEX: Record<ClasseEnergetique, string> = {
  A: "#166534", B: "#65a30d", C: "#ca8a04",
  D: "#ea580c", E: "#dc2626", F: "#9333ea", G: "#4c1d95",
};

export default function CarteMaroc({ regions }: CarteMarocProps) {
  const centre: L.LatLngTuple = [31.7917, -7.0926];

  return (
    <div style={{ height: "500px", width: "100%" }}>
      <MapContainer
        center={centre}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {regions.map((region) => (
          <CircleMarker
            key={region.id}
            center={[region.lat, region.lng]}
            radius={Math.max(10, region.nbDossiers / 5)}
            pathOptions={{
              color: COULEURS_HEX[region.classemoyenne],
              fillColor: COULEURS_HEX[region.classemoyenne],
              fillOpacity: 0.7,
              weight: 2,
            }}
          >
            <Tooltip>
              <div className="p-1">
                <p style={{ fontWeight: "bold" }}>{region.nom}</p>
                <p>Classe : <strong>{region.classemoyenne}</strong></p>
                <p>Dossiers : <strong>{region.nbDossiers}</strong></p>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}