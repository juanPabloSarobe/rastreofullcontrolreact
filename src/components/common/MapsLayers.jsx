import React from "react";
import { LayersControl, TileLayer } from "react-leaflet";

const { BaseLayer } = LayersControl;

const MapsLayers = () => {
  return (
    <LayersControl position="bottomright">
      {/* Capas base */}
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
  );
};

export default MapsLayers;
