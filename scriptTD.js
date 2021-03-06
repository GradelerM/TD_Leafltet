var map = L.map('map');
//Initialisation d'un objet map qui sera affiché dans la divave l'id  map
var osmUrl= 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
//la variable osmUrl contient l'url qui va nous permettre de récup les images qui constitueront le fond de notre carte

var osmAttrib='Map data c OpenStreetMap contributors';
//la vaiable osmAttrib contient la source de la carte, elle s'affichera en bas à droite de notre carte
var osm = new L.TileLayer(osmUrl, {attribution:osmAttrib}).addTo(map);

// surligner
function highlightFeature(e) {
    var surlign = e.target;

   surlign.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.5
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        surlign.bringToFront(); //sinon marche pas pour explorer opera et edge
    }
}

//reset le surlignage
function resetHighlight(e) {
    irischoro.resetStyle(e.target);
}
// zoomer sur la commune
function interactions (feature, layer) {
	layer.on('click',function(){
	map.fitBounds(layer.getBounds())	
	})
  layer.on({'mouseover' : highlightFeature,'mouseout' : resetHighlight})

}

//placer des markers dans la zone
irisMap = new L.LayerGroup();
map.addLayer(irisMap);

//affichage des communes
irischoro = L.choropleth(iris, {
valueProperty: function(feature){
return (feature.properties.tchom)
  }, // which property in the features to use
scale: ['purple', 'orange'], // chroma.js scale - include as many as you like
steps: 5, // number of breaks or steps in range
mode: 'q', // q for quantile, e for equidistant, k for k-means
style: {
  color: '#fff', // border color
  weight: 1,
  fillOpacity: 0.7
},
onEachFeature: interactions
}).addTo(irisMap)

// legende des iris

  var legendiris = L.control({ position: 'bottomright' })
  legendiris.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend')
    var limits = irischoro.options.limits
    var colors = irischoro.options.colors
    var labels = []

    // Add min & max
    div.innerHTML = '<div class="labels"></div>' + '<div class="min">' + limits[0] + '</div> \
      <div class="max">' + limits[limits.length - 1] + '</div></div>'

    limits.forEach(function (limit, index) {
      labels.push('<li style="background-color: ' + colors[index] + '"></li>')
    })

    div.innerHTML += '<ul>' + labels.join('') + '</ul>'
    return div
  }

irisMap.onAdd = function(map){
  legendiris.addTo(map);
  irischoro.addTo(map)
}

irisMap.onRemove = function(map){
  legendiris.remove(map)
  irischoro.remove(map)
}


//============================== option 2 =============================

var stationIcon = L.icon({
  iconUrl: 'image/voiture_marker.svg',
  iconSize: [38, 38],
  iconAnchor: [19, 38]
});

var stationIcon2 = L.icon({
  iconUrl: 'image/voiture_select.svg',
  iconSize: [38, 38],
  iconAnchor: [19, 38]
});

//============================== metro =============================

//style
function getColor(d) {
    return d == 'D'  ? 'green' : // correspond à if et le : fait else if
           d == 'C' ? 'orange' :
           d == 'B'  ? 'blue' :
           d == 'A' ? 'red' :
                      '#FFEDA0';
}


function style(feature) {
    return {
        color: getColor(feature.properties.ligne),
        weight: 4,
        opacity: 0.8,
    };
}

// ajout du layer
metroMap = new L.LayerGroup();
map.addLayer(metroMap);



// affichage
var metro =L.geoJSON(metro,{
  style : style,
  onEachFeature : function(feature,layer){
  	layer.bindTooltip("ligne " + feature.properties.ligne, {sticky : true})
  }
}).addTo(metroMap);

//=============marker anime

//icones
var metroIcon = L.icon({
  iconUrl: 'image/metro_marker.svg',
  iconSize: [50, 50],
  iconAnchor: [25, 40],
  popupAnchor : [0,-25]
});

var metroIcon2 = L.icon({
  iconUrl: 'image/metro_descente.svg',
  iconSize: [50, 50],
  iconAnchor: [25, 40],
  popupAnchor : [0,-25]
});

//marker anime
metro.eachLayer(function(layer){
    L.animatedMarker(layer._latlngs[0],{ 
    	icon : metroIcon,
    	speed : 10,
    	onEnd : function(){
    		this.bindPopup("Terminus ! <br /> Tout le monde descend !").openPopup();
    		this.setIcon(metroIcon2);
    		}
    	}).addTo(metroMap);
	
});

//============================== Stations autopartage =================

// Création de la couche
stationMap = new L.LayerGroup();
map.addLayer(stationMap);

// Définition de la variable "buffer"
var buffer;

// Affichage de la couche + interactivité
interactiveStation = L.geoJSON(station, {
  pointToLayer: function (feature, latlng) {
    return L.marker(latlng, {icon: stationIcon}).bindPopup(feature.properties.nom);
  },
  onEachFeature: function(feature, layer) {
    layer.on("mouseover", function(e){
      layer.setIcon(stationIcon2);
      console.log(feature.geometry.coordinates);
      console.log(e.latlng);
      buffer = L.circle(e.latlng, {
        radius: 300,
        color: '#ffa31a',
        weight: 2,
        fillColor: '#ffb914',
        fillOpacity: 0.5
      }).addTo(map);
    });
    layer.on("mouseout", function(e){
      layer.setIcon(stationIcon);
      map.removeLayer(buffer);
    });
  }
}).addTo(stationMap);


//=============================Fonction Dessin =================
var editableLayers = new L.FeatureGroup();
map.addLayer(editableLayers);

var markerdraw = L.Icon.extend({
	options: {
		shadowUrl: null,
		iconAnchor: new L.Point(12, 12),
		iconSize: new L.Point(24, 24),
		iconUrl: 'image/voiture_marker.svg'
	}
});

var drawnItems = new L.FeatureGroup();
	map.addLayer(drawnItems);

map.addControl(new L.Control.Draw({
	edit: { featureGroup: drawnItems }
}));

map.on('draw:created', function(event) {
	var layer = event.layer;
	drawnItems.addLayer(layer);
});


//============================== Gestion des Layers ===================

var overlayMaps = {
    "Iris": irisMap,
    "Lignes de metro": metroMap,
    "Stations autopartage": stationMap
};
L.control.layers({}, overlayMaps).addTo(map);



//============================== FitBounds pour affichage ===================
map.fitBounds(irischoro.getBounds());
