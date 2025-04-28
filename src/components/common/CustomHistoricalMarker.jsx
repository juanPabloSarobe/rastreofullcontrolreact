import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Typography } from "@mui/material";

const CustomHistoricalMarker = ({ position, message, iconAngle, iconData }) => {
  // Crear un ícono personalizado con rotación

  const customIcon = L.divIcon({
    html: `
      <div style="transform: rotate(${
        iconAngle || 0
      }deg); transform-origin: bottom left;">
        <img src="${iconData?.iconUrl || "default-marker.png"}" 
             width="${iconData?.iconSize?.[0] || 24}" 
             height="${iconData?.iconSize?.[1] || 24}" 
             alt="marker" />
      </div>
    `,
    className: "custom-historical-marker-icon",
    iconSize: iconData?.iconSize || [24, 24],
    iconAnchor: iconData?.iconAnchor || [12, 12],
    popupAnchor: [0, 0],
  });

  return (
    <Marker position={position} icon={customIcon}>
      <Popup>
        <Typography variant="body2">
          {message.split(/<\/?br\s*\/?>/).map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </Typography>
      </Popup>
    </Marker>
  );
};

export default CustomHistoricalMarker;
