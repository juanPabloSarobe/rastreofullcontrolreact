import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

const AddZoomControl = () => {
  const map = useMap();
  const zoomControlAdded = React.useRef(false); // Usamos un ref para rastrear si ya se agregó el control

  useEffect(() => {
    if (!zoomControlAdded.current) {
      // Asegúrate de que los controles de zoom predeterminados estén eliminados
      if (map.zoomControl) {
        map.removeControl(map.zoomControl);
      }

      // Agrega controles de zoom en la esquina inferior derecha
      L.control
        .zoom({
          position: "bottomright", // Posición de los controles de zoom
        })
        .addTo(map);

      zoomControlAdded.current = true; // Marca que los controles ya se agregaron
    }
  }, [map]);

  return null;
};

export default AddZoomControl;
