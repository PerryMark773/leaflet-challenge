// Store our API endpoint as queryUrl.
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson";
let dataArray = d3.json(queryUrl);
// Perform a GET request to the query URL/
d3.json(queryUrl).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
});

function createFeatures(earthquakeData) {

    // Define a function that we want to run once for each feature in the features array.
    // Give each feature a popup that describes the place and time of the earthquake.
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p>`);
    }

    // Create a GeoJSON layer that contains the features array on the earthquakeData object.
    // Run the onEachFeature function once for each piece of data in the array.
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature
    });

    // Send our earthquakes layer to the createMap function/
    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    })
    let googleSat = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3']
});
    ;

    // Create a baseMaps object.
    let baseMaps = {
        "Street Map": street,
        "Topographic Map": topo,
        "Satellite": googleSat
    };

    // Create an overlay object to hold our overlay.
    let overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
        center: [
            37.09, -95.71
        ],
        zoom: 1,
        layers: [street, earthquakes]
    });

    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);
        // Add the legend to the map.
createLegend(myMap);

}




function createFeatures(earthquakeData) {
    function onEachFeature(feature, layer) {
      // Create a popup with additional earthquake information.
      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${feature.properties.mag}<br>Depth: ${feature.geometry.coordinates[2]}</p>`);
    }
  
    function getMarkerOptions(feature) {
      // Customize marker size and color based on magnitude and depth.
      return {
        radius: feature.properties.mag * 5, // Adjust the multiplier as needed for proper marker size.
        fillColor: getColor(feature.geometry.coordinates[2]),
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
    }
  
    function getColor(depth) {
      // Create a color gradient for earthquake depth.
      // Adjust the colors and breakpoints as needed.
      return depth > 300 ? "red" :
             depth > 100 ? "orange" :
             depth > 50 ? "yellow" :
             depth > 10 ? "#90EE90" :
                          "green";
    }
  
    let earthquakes = L.geoJSON(earthquakeData, {
      pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, getMarkerOptions(feature));
      },
      onEachFeature: onEachFeature
    });
  
    createMap(earthquakes);
  };

  function createLegend(myMap) {
    let legend = L.control({ position: 'bottomright' });
  
    legend.onAdd = function (myMap) {
      let div = L.DomUtil.create('div', 'info legend');
        // Add the title to the legend and center it
    div.innerHTML = '<div style="text-align: center;"><strong>Depth in KM</strong></div>';
      let depthLabels = ['<10 km', '10-50 km', '50-100 km', '100-300 km', '>300 km'];
      let colors = ["#90EE90", "yellow", "orange", "red", "green"];

      
  
    // Style for the color squares in the legend
    let legendStyle = 'width: 15px; height: 15px; margin-right: 8px; display: inline-block; border: 1px solid black;';

    // Loop through the depthLabels and generate the legend HTML with the styles applied.
    for (let i = 0; i < depthLabels.length; i++) {
      div.innerHTML +=
        '<i style="background:' + colors[i] + ';' + legendStyle + '"></i> ' + depthLabels[i] + '<br>';
    }

        // Style the entire legend container
        div.style.backgroundColor = 'white';
        div.style.padding = '10px';
        div.style.border = '1px solid black';
  
      return div;
    };
  
    legend.addTo(myMap);
  };