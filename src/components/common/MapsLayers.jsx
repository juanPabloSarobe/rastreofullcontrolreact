import React, { useEffect } from "react";
import { LayersControl, TileLayer, useMap } from "react-leaflet";

const { BaseLayer } = LayersControl;

const MapsLayers = ({ isMobile, unitData }) => {
  const map = useMap();

  useEffect(() => {
    // Mueve el control a un contenedor personalizado
    const layersControlElement = document.querySelector(
      ".leaflet-control-layers"
    );
    const customContainer = document.getElementById("custom-layers-container");

    if (layersControlElement && customContainer) {
      customContainer.appendChild(layersControlElement);
    }
  }, [map]);

  return (
    <>
      {/* Contenedor personalizado para LayersControl */}
      <div
        id="custom-layers-container"
        style={{
          position: "absolute",
          bottom: isMobile && unitData ? "216px" : "96px", // Ajusta la posición según sea necesario
          right: "10px",
          zIndex: 1000,
          /*           backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", */
          // padding: "8px",
        }}
      ></div>

      {/* LayersControl dentro del mapa */}
      <LayersControl position="topright">
        <BaseLayer checked name="OpenStreetMap">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
        </BaseLayer>
        <BaseLayer name="Satelital">
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
          />
        </BaseLayer>
        <BaseLayer name="Google Maps">
          <TileLayer
            url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
          />
        </BaseLayer>
        <BaseLayer name="Google Satélite">
          <TileLayer
            url="http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
            attribution='&copy; <a href="https://www.google.com/maps">Google Maps</a>'
            subdomains={["mt0", "mt1", "mt2", "mt3"]}
          />
        </BaseLayer>
      </LayersControl>
    </>
  );
};

export default MapsLayers;
