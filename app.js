let apiKey = 'AIzaSyBk1Yit-fdfbbESp-xA-JWmkL06IwurcvU';
var map;
var infoWindow;
async function initMap() {

  const { AdvancedMarkerElement} = await google.maps.importLibrary("marker");
  placeLib = await google.maps.importLibrary("places");
  
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 7,
    center: { lat: 51.9194, lng: 19.1451 }, //Polska środek
    // center: { lat: 52.23743, lng: 21.029156996643792 }, // Wawa
    mapId: "DEMO_MAP_ID",
  });

  infoWindow = new google.maps.InfoWindow();
  await getRouteWithTollInfo("Warsaw, Poland", "Berlin, Germany");

}

async function getRouteWithTollInfo(origin, destination) {
  const url = `https://routes.googleapis.com/directions/v2:computeRoutes`;
  
  const requestBody = {
    origin: { 
      // location: { latLng: { latitude: 52.2298, longitude: 21.0122 } } 
      address: "Sopot, Polska" // A1
      // address: "Świecko, Polska"//A2
    },
    destination: { 
      // location: { latLng: { latitude: 52.5200, longitude: 13.4050 } } 
      location: { 
        latLng: { 
          latitude: 47.06911326, 
          longitude: 15.437825 
        } 
      }, 
      // address: "Wiedeń" //A1
      // address: "Konin, Polska" //A2
    }, 
    travelMode: "DRIVE",
    computeAlternativeRoutes: false,
    extraComputations: ["TOLLS"],
    routeModifiers: {
      avoidTolls: false,
      avoidHighways: false,
      avoidFerries: false
      },
      // waypoints: [
      //   {"location": "A1, Poland"},
        
      // ],
      intermediates: [
        {
          address:"Gdańsk,Polska",
          address:"Włocławek,Polska",
          address:"Linz,AT",
        },
        // {

        //   location: { 
        //     latLng: { 
        //       latitude: 47.06911326, 
        //       longitude: 15.437825 
        //     } 
        //   }, 
          
        //   // address:"Graz,AT",// Graz
        // }
      ],
      languageCode: "pl",
      units: "METRIC",
    };
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        // "X-Goog-FieldMask": "*,routes,routes.legs,routes.travelAdvisory,routes.travelAdvisory.tollInfo,routes.travelAdvisory.tollInfo.estimatedPrice,routes.legs.travelAdvisory,routes.legs.travelAdvisory.tollInfo,routes.legs.travelAdvisory.tollInfo.estimatedPrice,routes.legs.travelAdvisory.speedReadingIntervals,routes.legs.steps.travelAdvisory,routes.legs.steps.travelAdvisory.speedReadingIntervals"
        "X-Goog-FieldMask": "routes,routes.legs,routes.travelAdvisory,routes.travelAdvisory.tollInfo,routes.travelAdvisory.tollInfo.estimatedPrice,routes.legs.travelAdvisory,routes.legs.travelAdvisory.tollInfo,routes.legs.travelAdvisory.tollInfo.estimatedPrice,routes.legs.travelAdvisory.speedReadingIntervals,routes.legs.steps.travelAdvisory,routes.legs.steps.travelAdvisory.speedReadingIntervals"
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      console.error("Błąd pobierania trasy:", response.statusText);
      return;
  }
  
  const data = await response.json();
  console.log(data);
  // console.log('TravelAdvisory: ', data.routes[0].travelAdvisory)
  // data.routes[0].legs.forEach((leg, legIndex) => {
    // console.log(`Travel Advisory at Leg ${legIndex}:`, leg.travelAdvisory.tollInfo.nano + " " + leg.travelAdvisory.tollInfo.currencyCode );

    // leg.steps.forEach((step, stepIndex) => {
      // console.log(`Travel Advisory at Step ${stepIndex}:`, step.travelAdvisory);
    // });
  // });
  drawRouteOnMap(data.routes[0].legs);
}

function drawRouteOnMap(legs) {
  legs.forEach(leg => {
    var i=0;
      leg.steps.forEach(step => {
        const path = step.polyline.encodedPolyline;
        const decodedPath = google.maps.geometry.encoding.decodePath(path);
        var cond = false;
        
        if(step.navigationInstruction !== undefined && step.navigationInstruction.instructions !== undefined){
          cond = step.navigationInstruction.instructions.includes('Droga płatna');
        }
        
        if(cond){
          addMarker(step.startLocation.latLng.latitude,step.startLocation.latLng.longitude,step.navigationInstruction.instructions);
        }

        var condition = i%2 == 0 ? true : false; 
        const color = condition ? "red" : "blue";
        
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
  
function addMarker(lat, lng, title){
  var marker = new google.maps.marker.AdvancedMarkerElement({
    map:map,
    position: new google.maps.LatLng(lat,lng),
    title: title,
  });

  marker.addListener("click", () => {
      infoWindow.setContent(`<p>Nav text: ${marker.title}.</p>`);
    infoWindow.open(map, marker);
  });

}

  async function fetchUrl(url) {
    // Make a GET request
    return await fetch(url, { mode: 'no-cors'})
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
  
  
  