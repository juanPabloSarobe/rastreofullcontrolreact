import React from "react";
import { Popup } from "react-leaflet";

const MarkerPopup = ({ popupContent = "", offset = [0, 0] }) => {
  return (
    <Popup offset={offset} closeButton={false}>
      <strong>{popupContent}</strong>
    </Popup>
  );
};

export default MarkerPopup;
