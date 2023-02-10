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

//   function to get api data for city api
function cityapi(cityname){

    $.ajax({
        url: "https://api.api-ninjas.com/v1/city?name=" + cityname,
        method:"GET",
        headers: { 'X-Api-Key': 'go1NeuJz94QeGftEPbnsgg==hvklAeK6cSwQ06Ti'}
    }).then(function(response){
        console.log(response);
    });
}

// gets city name from text input and puts it in a variable and put into localStorage
var searchHistory = JSON.parse(localStorage.getItem("search")) || [];
unique(searchHistory);

$("#submit").on("click", function (event) {
  event.preventDefault();
  var cityname = $("#city-input").val().trim();
  if (cityname) {
    searchHistory.push(cityname);
    localStorage.setItem("search", JSON.stringify(searchHistory));
    renderhistoryLi();

    console.log(cityname);
    cityapi(cityname);
  } else {
    alert("City required");
  }
});

function renderhistoryLi() {
    $("#search-history-list").empty();
    for (var i = 0; i < searchHistory.length; i++) {
      var historyItem = $("<li>");
      historyItem.addClass("li-button");
      historyItem.attr("data-name", searchHistory[i]);
      historyItem.text(searchHistory[i]);
      $("#search-history-list").append(historyItem);
    }
  }
  
  $(document).on("click", ".li-button", function () {
    var historyItem = $(this).attr("data-name");
    cityapi(historyItem);
  });
  
  function unique(arr) {
    for (var i = 0; i < arr.length; i++) {
      for (var j = i + 1; j < arr.length; j++) {
        if (arr[i] == arr[j]) {
          arr.splice(j, 1);
          j--;
        }
      }
    }
    return arr;
  }
renderhistoryLi();

// clears search history when clicked
$("#clear-history").on("click", function(){

  $("#search-history-list").empty()
  searchHistory = [];
})

// Toggles theme when clicked
$("#theme-toggle-btn").on("click", ()=>toggleTheme());

// Toggles theme
function toggleTheme(theme) {
    const light = document.querySelector("#light");
    const dark = document.querySelector("#dark");
    if (light.checked && !theme) {
        dark.checked = true;
        theme = "dark";
    } else if (dark.checked && !theme) {
        light.checked = true;
        theme = "light";
    } else if (theme === "light") {
      light.checked = true;
      dark.checked = false;
    } else if (theme === "dark") {
      light.checked = false;
      dark.checked = true;
    }
    document.body.classList.remove("light");
    document.body.classList.remove("dark");
    document.body.classList.add(theme);
}