import React from "react";
import { Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import MarkerPopup from "./MarkerPopup";

const CustomMarker = ({
  position,
  popupContent,
  color,
  rotationAngle = 0,
  onClick,
}) => {
  const iconPaths = {
    position: `<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>`,
    roomTwoTone: `<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/><circle cx="12" cy="9" r="2.5"/>`, // Path del ícono RoomTwoTone
    arrowCircleUpTwoTone: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M12 8l-4 4h3v4h2v-4h3l-4-4z"/>`, // Path del ícono ArrowCircleUpTwoTone
    stopCircle: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M9 9h6v6H9z"/>`, // Path del ícono StopCircle
    error: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-.83 0-1.5-.67-1.5-1.5S11.17 14 12 14s1.5.67 1.5 1.5S12.83 17 12 17zm1-4h-2V7h2v6z"/>`, // Path del ícono Error
  };
  const createMuiIconAsImage = (
    path,
    color = "red",
    size = 40,
    rotationAngle
  ) => {
    const svgString = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" fill="${color}" viewBox="0 0 24 24" transform="rotate(${rotationAngle})">
        <g transform="rotate(${rotationAngle}, 12, 12)">
          ${path}
        </g>
      </svg>
    `;
    const svgBlob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    return URL.createObjectURL(svgBlob);
  };

  // Crear un ícono personalizado con un ícono de MUI
  const createCustomIcon = (
    path,
    color = color,
    size = 80,
    rotationAngle = 0
  ) => {
    return L.icon({
      iconUrl: createMuiIconAsImage(path, color, size, rotationAngle),
      iconSize: [size, size], // Tamaño del ícono
      iconAnchor: [size / 2, size], // Ancla en la base del ícono
      popupAnchor: [0, -size * 0.8], // Ancla del popup
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      shadowSize: [size * 1.5, size / 2], // Tamaño de la sombra ajustado
      shadowAnchor: [size / 2, size / 2], // Punto de anclaje de la sombra ajustado
    });
  };
  const createCustomArrow = (
    path,
    color = "green",
    size = 80,
    rotationAngle = 0,
    anchor = 0
  ) => {
    return L.icon({
      iconUrl: createMuiIconAsImage(path, color, size, rotationAngle / 2),

      iconSize: [size * 1.5, size * 1.5], // Tamaño del ícono
      iconAnchor: [size * 0.75, size * 2.75], // Punto de anclaje del ícono ajustado
      popupAnchor: [0, -size * 2.5], // Ancla del popup
    });
  };

  return (
    <>
      {" "}
      <Marker
        position={position}
        icon={createCustomIcon(iconPaths.roomTwoTone, color, 50, 0, 1)}
      ></Marker>
      <Marker
        eventHandlers={{
          click: onClick, // Maneja el evento de clic
        }}
        position={position}
        icon={createCustomIcon(iconPaths.position, color, 50, 0, 1)}
      >
        <Tooltip direction="top" offset={[0, -45]} opacity={1} permanent>
          <strong>{popupContent}</strong>
        </Tooltip>

        <MarkerPopup popupContent={popupContent} />
      </Marker>
      {color === "green" ? (
        <Marker
          eventHandlers={{
            click: onClick, // Maneja el evento de clic
          }}
          position={position}
          icon={createCustomArrow(
            iconPaths.arrowCircleUpTwoTone,
            "white",
            15.5,
            rotationAngle,
            -4.0
          )}
        >
          <MarkerPopup popupContent={popupContent} />
        </Marker>
      ) : color === "red" ? (
        <Marker
          eventHandlers={{
            click: onClick, // Maneja el evento de clic
          }}
          position={position}
          icon={createCustomArrow(iconPaths.stopCircle, "white", 15.5, 0, -4.5)}
        >
          {" "}
          <MarkerPopup popupContent={popupContent} />
        </Marker>
      ) : (
        <Marker
          eventHandlers={{
            click: onClick, // Maneja el evento de clic
          }}
          position={position}
          icon={createCustomArrow(iconPaths.error, "white", 15.5, 0, -4.5)}
        >
          {" "}
          <MarkerPopup popupContent={popupContent} />
        </Marker>
      )}
    </>
  );
};

export default CustomMarker;
