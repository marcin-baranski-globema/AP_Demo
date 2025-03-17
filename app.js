let gmk = 'AIzaSyAIgHFrIHvqc0ay7boHg1ttTnVmEvawrR4';
var map;
var infoWindow;
var proxyUrl = 'https://proxydemoimg-646273570736.europe-central2.run.app/autopay';
async function initMap() {

  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
  placeLib = await google.maps.importLibrary("places");

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: { lat: 51.9194, lng: 19.1451 }, //Polska środek
    mapId: "DEMO_MAP_ID",
  });

  infoWindow = new google.maps.InfoWindow();
  await getRouteWithTollInfo("Warsaw, Poland", "Berlin, Germany");
}

async function getRouteWithTollInfo(origin, destination) {
  const requestBody = {
    origin: {
      address: "Sopot, Polska" // A1
    },
    destination: {
      location: {
        latLng: {
          //Graz, AT
          latitude: 47.06911326,
          longitude: 15.437825
        }
      },
    },
    travelMode: "DRIVE",
    computeAlternativeRoutes: false,
    extraComputations: ["TOLLS"],
    routeModifiers: {
      avoidTolls: false,
      avoidHighways: false,
      avoidFerries: false
    },
    intermediates: [
      {
        address: "Gdańsk,Polska",
        address: "Włocławek,Polska",
        address: "Linz,AT",
      },
    ],
    languageCode: "pl",
    units: "METRIC",
  };

  var response = await fetchUrlWithBody(proxyUrl,requestBody);
  if(response !== undefined){
    // console.log(response)   // Log entire response 
  }

  if(response.routes !== undefined && response.routes.length > 0){
    // console.log(response.routes[0]) //Log chosen(first in array) route
    drawRouteOnMap(response.routes[0].legs);
  }
}

function drawRouteOnMap(legs) {
  legs.forEach(leg => {
    var i = 0;
    leg.steps.forEach(step => {
      const path = step.polyline.encodedPolyline;
      const decodedPath = google.maps.geometry.encoding.decodePath(path);
      var cond = false;

      if (step.navigationInstruction !== undefined && step.navigationInstruction.instructions !== undefined) {
        cond = step.navigationInstruction.instructions.includes('Droga płatna');
      }

      if (cond) {
        addMarker(step.startLocation.latLng.latitude, step.startLocation.latLng.longitude, step.navigationInstruction.instructions);
      }

      // var condition = i % 2 == 0 ? true : false;
      const color = i % 2 == 0 ? "red" : "blue";

      new google.maps.Polyline({
        path: decodedPath,
        geodesic: true,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 5,
        map: map
      });
      i++;
    });
  });
}

function addMarker(lat, lng, title) {
  var marker = new google.maps.marker.AdvancedMarkerElement({
    map: map,
    position: new google.maps.LatLng(lat, lng),
    title: title,
  });

  marker.addListener("click", () => {
    infoWindow.setContent(`<p>Nav text: ${marker.title}.</p>`);
    infoWindow.open(map, marker);
  });

}

async function fetchUrl(url) {
  // Make a GET request
  return await fetch(url/*, { mode: 'no-cors' }*/)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // console.log(data);
      return data;
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

async function fetchUrlWithBody(url,body) {
  // Make a GET request
  return await fetch(url,  {
      method: "POST",
      // mode:'no-cors',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body)})
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // console.log(data);
      return data;
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


