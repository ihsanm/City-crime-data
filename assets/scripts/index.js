let chart;
function updateGraph(data) {
  let label = "Crime frequency";

  data = data || [
    { category: "Crime 1", count: Math.floor(Math.random() * 36) + 5 },
    { category: "Crime 2", count: Math.floor(Math.random() * 26) + 5 },
    { category: "Crime 3", count: Math.floor(Math.random() * 26) + 5 },
    { category: "Crime 4", count: Math.floor(Math.random() * 26) + 5 },
    { category: "Crime 5", count: Math.floor(Math.random() * 26) + 5 },
    { category: "Crime 6", count: Math.floor(Math.random() * 26) + 5 },
    { category: "Crime 7", count: Math.floor(Math.random() * 26) + 5 },
  ];

  if (chart) {
    chart.destroy();
  }
  chart = new Chart(document.getElementById("crime-graph"), {
    type: "radar",
    data: {
      labels: data.map((row) => row.category),
      datasets: [
        {
          label: label,
          data: data.map((row) => row.count),
        },
      ],
    },
  });
}

function search(e) {
  e.preventDefault();
  alert(document.querySelector("#city-input").value);
}

updateGraph();

document.querySelector("#nav").addEventListener("click", () => updateGraph());
document.querySelector("#submit").addEventListener("click", search);

function getGeoData() {
    // mode change dark or light
    var city = $("#city-input").val().trim();
    // var currentDate = moment().format("L");
    var APIKey = "33759846bc0f4ad6eea2a8a5065678b2";
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {
        console.log(response);
        var latEl=response.coord.lat;
        var lonEL=response.coord.lon;
        console.log(latEl,lonEL);
        getCrimeData({lat: latEl, lon:El });
    });
}

// Function that accepts an object containing a latitude and longitude
// in the format obj.lat and obj.lon
function getCrimeData(location) {
    location = location || { lat: 52.61650648552111, lon: -1.675799049634001 }
    let url = `https://data.police.uk/api/crimes-street/all-crime?lat=${location.lat}&lng=${location.lon}` //&date=2017-01
    fetch(url)
    .then(res => res.json())
    .then(data => {
        console.log(data);
    });
}
getCrimeData(); // Testing

//   function to get api data for wiki api
function cityapi(){

    var cityname = "birmingham";

    $.ajax({
        url: "https://api.api-ninjas.com/v1/city?name=" + cityname,
        method:"GET",
        headers: { 'X-Api-Key': 'go1NeuJz94QeGftEPbnsgg==hvklAeK6cSwQ06Ti'}
    }).then(function(response){
        console.log(response);
    });
};

cityapi();