import React from "react";
import { Polyline } from "react-leaflet";
import { Typography } from "@mui/material";
import CustomHistoricalMarker from "./CustomHistoricalMarker";
import "./CustomHistoricalMarker.css";

const HistoricalMarkers = ({ historicalData }) => {
  if (!historicalData) return null;

  return (
    <>
      {Array.isArray(historicalData.Markers) &&
        historicalData.Markers.map((marker, index) => (
          <CustomHistoricalMarker
            key={index}
            position={[marker.lat, marker.lng]}
            message={marker.message || ""}
            iconAngle={marker.iconAngle}
            iconData={marker.icon}
          />
        ))}

      {Array.isArray(historicalData.paths) && (
        <Polyline
          positions={historicalData.paths.map((path) => [path.lat, path.lng])}
          pathOptions={{ color: "blue" }}
          weight={3}
        />
      )}
    </>
  );
};

export default HistoricalMarkers;
