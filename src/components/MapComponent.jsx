// you should switch to a free and open-source alternative — Leaflet.js with OpenStreetMap,

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const MapComponent = ({ center, zoom }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (mapInstanceRef.current) return; // Avoid multiple maps

    mapInstanceRef.current = L.map(mapRef.current).setView([center.lat, center.lng], zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapInstanceRef.current);

    L.marker([center.lat, center.lng])
      .addTo(mapInstanceRef.current)
      .bindPopup('KITCOEK, Kolhapur')
      .openPopup();
  }, [center, zoom]);

  return <div ref={mapRef} style={{ height: '100%', width: '100%', borderRadius: 'inherit' }} />;
};

MapComponent.defaultProps = {
  center: { lat: 16.654389, lng: 74.262505 }, // Morewadi, Kolhapur
  zoom: 15,
};


export default MapComponent;