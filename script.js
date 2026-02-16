mapboxgl.accessToken = 'pk.eyJ1IjoibmluYW5vdW4iLCJhIjoiY2pjdHBoZGlzMnV4dDJxcGc5azJkbWRiYSJ9.o4dZRrdHcgVEKCveOXG1YQ';

// 1) URLs GitHub
const GEOJSON_URL = "https://raw.githubusercontent.com/LamineDame/Energie/main/data/Données_Bat.geojson";
const IMG_BASE = "https://raw.githubusercontent.com/LamineDame/Energie/main/img/";
const PDF_BASE = "https://raw.githubusercontent.com/LamineDame/Energie/main/pdf/";

// 2) Créer la carte
const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: [3.5617, 43.5800],
  zoom: 14
});

map.addControl(new mapboxgl.NavigationControl(), "top-right");

// 3) Charger les données
map.on("load", async () => {
  const geojson = await (await fetch(GEOJSON_URL)).json();

  map.addSource("batiments", {
    type: "geojson",
    data: geojson
  });

  map.addLayer({
    id: "points",
    type: "circle",
    source: "batiments",
    paint: {
      "circle-radius": 7,
      "circle-color": "#d32f2f",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff"
    }
  });

  // Popup au clic
  map.on("click", "points", (e) => {
    const f = e.features[0];
    const p = f.properties;

    const id = p.ID_bat || "";
    const compteurs = p.Compteur_bati || "";
    const photoFile = p.photo || "";
    const pdfFile = p.pdf_bat || "";

    const photoUrl = photoFile ? `${IMG_BASE}${photoFile}` : "";
    const pdfUrl = (pdfFile && pdfFile !== "NULL") ? `${PDF_BASE}${pdfFile}` : "";

    const html = `
      <div class="popup">
        <h3>${id}</h3>
        ${photoUrl ? `<img src="${photoUrl}" alt="${id}">` : `<div class="muted">Pas de photo</div>`}
        <div><b>Compteurs :</b><br>${compteurs}</div>
        ${pdfUrl ? `<a href="${pdfUrl}" target="_blank">📄 Ouvrir la fiche bâtiment</a>` : `<div class="muted">Pas de PDF</div>`}
      </div>
    `;

    new mapboxgl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(html)
      .addTo(map);
  });

  map.on("mouseenter", "points", () => map.getCanvas().style.cursor = "pointer");
  map.on("mouseleave", "points", () => map.getCanvas().style.cursor = "");
});

// ✅ échelle
map.addControl(new mapboxgl.ScaleControl({ maxWidth: 120, unit: "metric" }), "bottom-left");