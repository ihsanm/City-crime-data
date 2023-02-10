const SUNRISE_SUNSET_API_KEY = "your_sunrise_sunset_api_key_here";
const OPEN_WEATHER_MAP_API_KEY = "3a95d1ed9bf689469735b199ebeae609";
let chart;
let crimeData = [];
// gets city name from text input and puts it in a variable and put into localStorage
var searchHistory = JSON.parse(localStorage.getItem("search")) || [];
unique(searchHistory);
renderhistoryLi();

// gets sunrise/sunset for location
function sunStatus(location) {
  const {latitude, longitude} = location;
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const sunStatusUrl = `https://api.sunrise-sunset.org/json?lat=${latitude}&lng=${longitude}&date=${year}-${month}-${day}&formatted=0&apikey=${SUNRISE_SUNSET_API_KEY}`;

  fetch(sunStatusUrl)
    .then((response) => response.json())
    .then((data) => {
      const sunrise = new Date(data.results.sunrise);
      const sunset = new Date(data.results.sunset);
      const currentTime = new Date();

      if (currentTime >= sunrise && currentTime <= sunset) {
        toggleTheme("light");
        // document.body.style.backgroundColor = "#FFFDD0";
      } else {
        toggleTheme("dark");
        // document.body.style.backgroundColor = "grey";
      }
    })
    .catch((error) => console.error(error));
}

// updates crime graph
function updateGraph(data) {
  data = data || crimeData;
  if (data.length === 0) return;
  let label = "Crime frequency";
  type = document.getElementById("crime-graph").dataset.type;
  if (type === "radar") data = data.slice(0,6);
  if (chart) {
    chart.destroy();
  }
  chart = new Chart(document.getElementById("crime-graph"), {
    type: type,
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

// Gets lat / lon from searched city
function getGeoData(city) {
    // var currentDate = moment().format("L");
    var APIKey = "33759846bc0f4ad6eea2a8a5065678b2";
    // var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + ", GB&appid=" + APIKey;
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=" + APIKey;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {
        console.log(response);
        const location = {latitude: response.coord.lat,longitude: response.coord.lon};
        getCrimeData(location);
        sunStatus(location);
    });
}

// Function that accepts an object containing a latitude and longitude
// in the format obj.lat and obj.lon
function getCrimeData(location) {
    // console.log(location)
    if (!location || !location.latitude) return;
    crimeData = [];
    let url = `https://data.police.uk/api/crimes-street/all-crime?lat=${location.latitude}&lng=${location.longitude}` //&date=2017-01
    fetch(url)
    .then(res => res.json())
    .then(data => {
        obj = {};
        data.forEach(item => {
          obj[item.category] = (obj[item.category] || 0) + 1;
        });
        for (let category in obj) {
          words = category.split("-");
          let cat = "";
          words.forEach(word => {
            cat += word.charAt(0).toUpperCase() + word.slice(1) + " ";
          });
          crimeData.push({category: cat.trim(), count: obj[category]});
        }
        crimeData.sort((a, b) => b.count - a.count);
        updateGraph();
        updateTable();
    });
}

// Updates crime data table
function updateTable(data) {
  data = data || crimeData;
  tbl = document.querySelector("#table-container tbody");
  tbl.textContent = "";
  data.forEach(item => {
    const rw = document.createElement("tr");
    rw.appendChild(document.createElement("td")).textContent = item.category;
    rw.appendChild(document.createElement("td")).textContent = item.count;
    tbl.appendChild(rw);
  });
}

// Toggle between nav panes
function navClick(e) {
  if (e.target.nodeName === "LI") {
    const id = e.target.dataset.toggles;
    const target = document.getElementById(id);
    const type = e.target.dataset.type || "radar";
    const cht = document.getElementById("crime-graph");
    if (cht.dataset.type !== type) {
      cht.dataset.type = type;
      updateGraph();
    } 
    if (!target) return;
    const panes = document.getElementById("crime-data");
    for (let pane of panes.children) {
      pane.classList.remove("active");
    }
    target.classList.add("active");
    for (let li of document.getElementById("nav").children) {
      li.classList.remove("active");
    }
    e.target.classList.add("active");
  }
}

// function to get api data for city api
function cityapi(cityname){

    $.ajax({
        url: "https://api.api-ninjas.com/v1/city?name=" + cityname,
        method:"GET",
        headers: { 'X-Api-Key': 'go1NeuJz94QeGftEPbnsgg==hvklAeK6cSwQ06Ti'}
    }).then(function(response){
        console.log(response);
        $(".heading").text(response[0].name);
        $(".content").text("Country : " + response[0].country + "  Population : " + (response[0].population).toLocaleString("en-US"));
    });
}

// Ouputs search history to screen
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

// removes duplicates from arrray  
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

// Toggles theme
function toggleTheme(theme) {
  const light = document.querySelector("#light");
  const dark = document.querySelector("#dark");
  if (light.checked && !theme) {
      theme = "light";
  } else if (dark.checked && !theme) {
      theme = "dark";
  } else if (theme === "light") {
    light.checked = true;
    // dark.checked = false;
  } else if (theme === "dark") {
    //light.checked = false;
    dark.checked = true;
  } else { theme = ""; }
  if (theme) {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");
    document.body.classList.add(theme);
  }

}

// ================
// Event listeners
// ================

// Handles nav clicks
document.querySelector("#nav").addEventListener("click", navClick);

// Search for city on submit button click
$("#submit").on("click", function (event) {
  event.preventDefault();
  var cityname = $("#city-input").val().trim();
  if (cityname) {
    searchHistory.unshift(cityname);
    if (searchHistory.length > 10) searchHistory.pop();
    localStorage.setItem("search", JSON.stringify(searchHistory));
    renderhistoryLi();
    cityapi(cityname);
    getGeoData(cityname);
  } else {
    alert("City required");
  }
});

// clears search history when clicked
$("#clear-history").on("click", function(){
  $("#search-history-list").empty()
  localStorage.removeItem("search");
  searchHistory = [];
})

// Toggles theme when clicked
$("#theme-toggle").on("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    if (light.checked) {
      dark.checked = true;
    } else {
      light.checked = true;
    }
  }
  toggleTheme();
});

// Search on enter key
$("#city-input").on("keypress", (e) => {
  if (e.key === "Enter") $("#submit").click();
})

// Updates data on search history item click
$(document).on("click", ".li-button", function () {
  var historyItem = $(this).attr("data-name");
  cityapi(historyItem);
  getGeoData(historyItem);
});
