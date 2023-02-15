const SUNRISE_SUNSET_API_KEY = "your_sunrise_sunset_api_key_here";
const OPEN_WEATHER_MAP_API_KEY = "3a95d1ed9bf689469735b199ebeae609";
let radarChart, barChart;
let crimeData = [];
// gets city name from text input and puts it in a variable and put into localStorage
var searchHistory = JSON.parse(localStorage.getItem("search")) || [];

init();

// Set up app
function init() {
  const tooltipList = [...document.querySelectorAll('[data-bs-toggle="tooltip"]')].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
  getIPLocation();
  addAllEventListeners();
 // unique(searchHistory);
  renderhistoryLi();
}

let places = {};
$("#city-input").on("keyup", (e) => {
  if (e.target.value.length >= 2) {
    if (!places.hasOwnProperty(e.target.value.toUpperCase())) {
      autocompleteSearch(e.target.value);
    }
  }
})

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
      } else {
        toggleTheme("dark");
      }
    })
    .catch((error) => console.error(error));
}

// updates crime graph
function updateCharts(data) {
  data = data || crimeData;
  if (radarChart) radarChart.destroy();
  radarChart = createChart(data.slice(0,6), "radar");
  radarChart.options.scales.r.ticks.color = "";
  radarChart.options.scales.r.ticks.backdropColor = "rgba(0,0,0,0)";
  const darkmode = document.body.classList.contains("dark");
  let clr;
  if (darkmode) {
    clr = "rgba(255,255,255,0.6)";
    radarChart.options.scales.r.angleLines.color = clr;
    radarChart.options.scales.r.grid.color = clr;
    radarChart.options.scales.r.pointLabels.color = clr;  
  } else {
    clr = "rgba(0,0,0,0.3)";
    radarChart.options.scales.r.angleLines.color = clr;
    radarChart.options.scales.r.grid.color = clr;
  }
  if (barChart) barChart.destroy();
  barChart = createChart(data, "bar");
  if (darkmode) {
    clr = "rgba(255,255,255,0.6)";
    barChart.options.scales.x.ticks.color = clr;
    barChart.options.scales.y.ticks.color = clr;  
    clr = "rgba(255,255,255,0.2)";
    barChart.options.scales.x.grid.color = clr;
    barChart.options.scales.y.grid.color = clr;
    $("#bar-graph").css("height", Math.max(50, 50 * data.length) + "px");
    $("#bar-graph").css("width", "100%");
  }
}

function createChart(data, type) {
  const chart = new Chart(document.getElementById(type + "-graph"), {
    type: type,
    data: {
      labels: data.map((row) => row.category),
      datasets: [
        {
          label: "Crime frequency",
          data: data.map((row) => row.count),
        },
      ],
    },
    options: { maintainAspectRatio: (type === "bar" ? false : true), indexAxis: "y", plugins: { legend: { display: false } } },
  });
  return chart
}

function destroyCharts() {
    radarChart.destroy();
    barChart.destroy();
    radarChart = null;
    barChart = null;
  }

// Gets lat / lon from searched city
function getGeoData(city) {
    var APIKey = "33759846bc0f4ad6eea2a8a5065678b2";
    var queryURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + ",GB&appid=" + APIKey;
    fetch(queryURL).then(r => r.json()).then(data => {
      if (!data.length) {
          showAlert("Location not found")
        } else {
          // Success! Update city name and add to search history
          let location = data[0];
          city = location.name;
          $("#city-name").text(city);
          if (!searchHistory.includes(city)) {
            searchHistory.unshift(city);
            if (searchHistory.length > 10) searchHistory.pop();
            localStorage.setItem("search", JSON.stringify(searchHistory));
            renderhistoryLi();
          }
          location = {city, latitude: location.lat,longitude: location.lon};
          getCrimeData(location);
          // sunStatus(location); // I don't think we should change the theme base on search. Just have it for user location
          getpoliceforce(location);
        }
    });
}

// 2 functions to get the police force from lat and long and the other to give details about the police force
function getpoliceforce(location){
	$.ajax({
        url: "https://data.police.uk/api/locate-neighbourhood?q="+location.latitude +","+ location.longitude,
        method: "GET",
    }).then(function (response) {
        const policeforcetext = response.force;
       policeforce(policeforcetext);
    });
}
function policeforce(policeforcetext){
	$.ajax({
        url: "https://data.police.uk/api/forces/" + policeforcetext,
        method: "GET",
    }).then(function (response) {
        $("#city-police-force").text(response.name);
        const info = $("#city-description")
        info.empty();
        if (response.description & response.description !== "<p>Force  profile</p>") { info.html(response.description); }
        const links = [];
        const fb = $("#fb");
        const tw = $("#tw");
        const li = $("#li");
        const yt = $("#yt");
        const fl = $("#fl");
        $("#social > a").addClass("d-none");
        if (response.url) { links.push(response.url + (response.url.endsWith("/") ? "" : "/")); }
        response.engagement_methods.forEach(link => {
          if (link.url /* && link.type !== "flickr" && link.title !== "flickr" */ && link.type !== "mobile") {
            link.url = link.url + (link.url.endsWith("/") ? "" : "/");
            if (link.type) { link.type = link.type.toLowerCase(); }
            if (link.title) { link.title = link.title.toLowerCase(); }
            if (link.type?.includes("facebook") || link.title?.includes("facebook")) {
              fb.attr("href", link.url);
              fb.removeClass("d-none");
            } else if (link.type?.includes("twitter") || link.title?.includes("twitter")) {
              tw.attr("href", link.url);
              tw.removeClass("d-none");
            } else if (link.type?.includes("linkedin") || link.title?.includes("linkedin")) {
              li.attr("href", link.url);
              li.removeClass("d-none");
            } else if (link.type?.includes("youtube") || link.title?.includes("youtube")) {
              if (link.url === "http://www.youtube.com/staffordshirepolice/") { link.url = "https://www.youtube.com/@staffordshirepolice5665/" }
              yt.attr("href", link.url);
              yt.removeClass("d-none");
            } else if (link.type?.includes("flickr") || link.title?.includes("flickr")) {
              fl.attr("href", link.url);
              fl.removeClass("d-none");
            } else if (!links.includes(link.url)) {
              links.push(link.url);
            }
          }
        });
        links.forEach(link => info.append($(`<br><a class="links" href="${link}" target="_blank">${link}</a>`)));
        if (response.telephone) { info.append("<br>" + "<b>" + " Telephone : " + response.telephone + "<b>"); }
    });
}
// Function that accepts an object containing a latitude and longitude
// in the format obj.lat and obj.lon
function getCrimeData(location) {
    crimeData = [];  
    if (!location || !location.latitude) {
      destroyCharts();
      $("tbody").empty();
      return;
    }
    let url = `https://data.police.uk/api/crimes-street/all-crime?lat=${location.latitude}&lng=${location.longitude}` //&date=2017-01
    fetch(url)
    .then(res => res.json())
    .then(data => {
        obj = {};
        data.forEach(item => {
          obj[item.category] = (obj[item.category] || 0) + 1;
        });
        for (let category in obj) {
          let cat = capitalize(category.replaceAll("-"," "));
          crimeData.push({category: cat, count: obj[category]});
        }
        crimeData.sort((a, b) => b.count - a.count);
        updateCharts();
        updateTable();
    });
}

// Updates crime data table
function updateTable(data) {
  data = data || crimeData;
  const tbl = $("tbody");
  tbl.empty();
  data.forEach((item, i) => {
    const rw = $("<tr>");
    rw.append($(`<th scope="row">${(i + 1)}</th>`));
    rw.append($(`<td>${item.category}</td>`));
    rw.append($(`<td>${item.count}</td>`));
    tbl.append(rw);
  });
}

// function to get api data for city api
function cityapi(cityname){
    return; // Don't think we're using this anymore???
    $.ajax({
        url: "https://api.api-ninjas.com/v1/city?name=" + cityname,
        method:"GET",
        headers: { 'X-Api-Key': 'go1NeuJz94QeGftEPbnsgg==hvklAeK6cSwQ06Ti'}
    }).then(function(response){
        // console.log(response);
        $("#city-name").text(response[0].name);
        $("#city-description").text("Country : " + response[0].country + "  Population : " + (response[0].population).toLocaleString("en-US"));
    });
}

// Ouputs search history to screen
function renderhistoryLi() {
    $("#search-history-list").empty();
    if (searchHistory.length > 0) {
      $("#clear-history").removeClass("hidden");
    } else {
      $("#clear-history").addClass("hidden");
    }
    for (var i = 0; i < searchHistory.length; i++) {
      var historyItem = $(`<a href="#" class="list-group-item list-group-item-action">${searchHistory[i]}</a>`);
      historyItem.attr("data-name", searchHistory[i]);
      $("#search-history-list").append(historyItem);
    }
  }

// removes duplicates from arrray  
function unique(arr) {
  return [...new Set(arr)];
}

// Toggles theme
function toggleTheme(theme) {
  const light = document.querySelector("#light");
  const dark = document.querySelector("#dark");
  const stylesheet = document.getElementById("dark-theme");
  if (light.checked && !theme) {
      theme = "light";
  } else if (dark.checked && !theme) {
      theme = "dark";
  } else if (theme === "light") {
    light.checked = true;
  } else if (theme === "dark") {
    dark.checked = true;
  } else { theme = ""; }
  if (!document.body.classList.contains(theme)) {
    document.body.classList.remove("light");
    document.body.classList.remove("dark");
    document.body.classList.add(theme);
    if (theme === "dark") {
      // stylesheet.setAttribute("href", "https://bootswatch.com/5/cyborg/bootstrap.min.css");
      stylesheet.setAttribute("href", "https://bootswatch.com/5/superhero/bootstrap.min.css");
    } else {
      stylesheet.setAttribute("href", "");
    }
    updateCharts();
  }
}

function capitalize(str) {
  if (!str) return;
  str = str.toLowerCase();
  words = str.includes(" ") ? str.split(" ") : [str];
  str = "";
  words.forEach(word => str += word.charAt(0).toUpperCase() + word.slice(1) + " ");
  return str.trim();
}

function getIPLocation() {
  fetch("https://api.bigdatacloud.net/data/reverse-geocode-client").then(r => r.json()).then(data => {
    const location = { city: data.city, latitude: data.latitude, longitude: data.longitude };
    console.log(data);
    sunStatus(location); 
    if (data.countryCode === "GB") {
      getCrimeData(location);
      getpoliceforce(location);
      $("#city-name").text(data.city);
    }
  })
}

function clearData() {
  $("#city-police-force").empty();
  $("#city-description").empty();
  $("tbody").empty();
  destroyCharts();
}

// ================
// Event listeners
// ================
function addAllEventListeners() {

  // Search for city on submit button click
  $("#search").on("submit", function (event) {
    event.preventDefault();
    var input = $("#city-input");
    var cityname = input.val().trim();
    if (cityname) {
      cityname = capitalize(cityname);
      // cityapi(cityname);
      getGeoData(cityname);
      input.val("");
    } else {
      showAlert("City required");
    }
  });

  // clears search history when clicked
  $("#clear-history").on("click", function(){
    $("#search-history-list").empty()
    localStorage.removeItem("search");
    searchHistory = [];
    $("#clear-history").addClass("hidden");
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

  // Updates data on search history item click
  $(document).on("click", "ul a", function () {
    var historyItem = $(this).attr("data-name");
    cityapi(historyItem);
    getGeoData(historyItem);
  });

  // Gets user exact location if allowed and updates data
  $("#search .input-group svg").on("click", () => {
    navigator.geolocation.getCurrentPosition((location) => {
      fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}`)
      .then(r => r.json())
      .then(data => {
        if (data.countryCode === "GB") {
        $("#city-name").text(data.city);
          getCrimeData(data);
          getpoliceforce(data);
          console.log({data});
        } else {
          showAlert("Crime data only availble for England.")
        }
      });
    });
  });

  // Closes modal
  document.querySelector("#alert").addEventListener("click", e => document.querySelector("#alert").close() );
}

// =============
// Alert modal
// =============
// Shows a modal alert
function showAlert(message) {
  if (!message || !message.trim()) { message = "Alert!" }
  document.querySelector("#alertMessage").textContent = message;
  document.querySelector("#alert").showModal();
}
