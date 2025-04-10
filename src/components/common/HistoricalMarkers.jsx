import React from "react";
import { Marker, Polyline, Popup } from "react-leaflet";
import { Typography } from "@mui/material";

const HistoricalMarkers = ({ historicalData }) => {
  if (!historicalData) return null;

  return (
    <>
      {Array.isArray(historicalData.Markers) &&
        historicalData.Markers.map((marker, index) => (
          <Marker key={index} position={[marker.lat, marker.lng]}>
            <Popup>
              <Typography variant="body2">
                {marker.message.split(/<\/?br\s*\/?>/).map((line, index) => (
                  <React.Fragment key={index}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              </Typography>
            </Popup>
          </Marker>
        ))}

      {Array.isArray(historicalData.paths) && (
        <Polyline
          positions={historicalData.paths.map((path) => [
            path.lat, // Asegúrate de usar las claves correctas
            path.lng,
          ])}
          pathOptions={{ color: "blue" }}
          weight={3}
        />
      )}
    </>
  );
};

export default HistoricalMarkers;
