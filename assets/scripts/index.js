// ===========================
// Global constants/variables
// ===========================
const SUNRISE_SUNSET_API_KEY = "your_sunrise_sunset_api_key_here";
const OPEN_WEATHER_MAP_API_KEY = "3a95d1ed9bf689469735b199ebeae609";
const GM_API_KEY = "AIzaSyCEgJmAA89XQmfs9fR9W10QO0dRudLCv5U"
let radarChart, barChart; // Chart references
let crimeData = []; // Holds crime data summary
let places = {}; // Stores places from google api for autocomplete
let searchHistory = JSON.parse(localStorage.getItem("search")) || []; // Gets search history from localStorage if present
let count = 0; // Track API fetch state

init(); // Let's go!!!

// Set up app
function init() {
  // Enables tooltips:
  const tooltipList = [...document.querySelectorAll('[data-bs-toggle="tooltip"]')].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
  doLoading();
  getIPLocation();
  addAllEventListeners();
  renderhistoryLi();

  if (window.innerWidth > 991) {
    $('#collapse-history')[0].click();
  }
}


// ==================
// Autocomplete list
// ==================

// Loops over all the locations retrieved from google api and adds to an array to show an autocomplete list
function autocompleteList() {
  const array = [];
  Object.values(places).forEach(place => array.push(place[0]));
  $("#city-input").autocomplete({
    source: array
  });
}

// Queries google API to get a list of matched locations in the UK based on search string
function autocompleteSearch(search) {
  if (search) {
    const token = Math.floor(Math.random() * 6000) + 1; //Random token for billing session.
    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?region=uk&types=locality|sublocality|postal_code&language=en-GB&input=uk,${search}&key=${GM_API_KEY}&token=${token}`
    url = "https://corsproxy.io/?" + encodeURIComponent(url);
    fetch(url).then(r => r.json()).then(data => {
      places = {};
      if (data.predictions.length > 0) {
        data.predictions.forEach(place => places[place.description.toUpperCase()] = [place.description, place.place_id]);
      }
      // Add matches to autocomplete list
      autocompleteList();
    });
  }
} 

// Gets lat/lng for an autocomplete item using a google "place id"
function getPlaceLocation(name) {
  const id = places[name][1] || "";
  if (id.length = 0) { 
    getGeoData(name);
    return; 
  }
  const token = Math.floor(Math.random() * 6000) + 1;
  let url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${id}&key=${GM_API_KEY}&token=${token}`
  url = "https://corsproxy.io/?" + encodeURIComponent(url);
  fetch(url).then(r => r.json()).then(data => {
    const location = {name: data.result.address_components[0].long_name, latitude: data.result.geometry.location.lat, longitude: data.result.geometry.location.lng};
    $("#city-name").text(location.name);
    addHistory(location);
    getCrimeData(location);
    getpoliceforce(location);
  });
}


// ===============
// Search History
// ===============

// Adds supplied location to the search history array and updates list
function addHistory(location) {
    searchHistory.forEach((item, idx) => {
      if (item.name === location.name) {
        searchHistory.splice(idx,1);
      }
    });
    searchHistory.unshift(location);
    while (searchHistory.length > 10) { 
      searchHistory.pop(); 
    }
	  localStorage.setItem("search", JSON.stringify(searchHistory));
    renderhistoryLi();
}

// Ouputs search history to screen
function renderhistoryLi() {
  $("#search-history-list").empty();
  if (searchHistory.length > 0) {
    $("#clear-history").removeClass("hidden");
  } else {
    $("#clear-history").addClass("hidden");
  }
  for (let i = 0; i <  searchHistory.length; i++) {
    const location = searchHistory[i];
    const historyItem = $(`<a href="#" class="d-relative list-group-item list-group-item-action">${location.name}<i class="d-none bi bi-x-square"></i></a>`);
    historyItem.attr("data-name", location.name);
    historyItem.attr("data-lat", location.latitude);
    historyItem.attr("data-lng", location.longitude);
    $("#search-history-list").append(historyItem);
  }
}

// Deletes the history item with the specified name
function deleteHistoryItem(historyItemName) {
  for (let i = 0; i < searchHistory.length; i++) {
    if (searchHistory[i].name === historyItemName) {
      searchHistory.splice(i,1);
      renderhistoryLi();
      break;
    }
  }
}

// ================================
// Sunrise/sunset for theme toggle
// ================================

// gets sunrise/sunset for location and sets theme accordingly
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
        toggleTheme("light"); // it's day time!
      } else {
        toggleTheme("dark"); // Night time zzzz. 
      }
    })
    .catch((error) => console.error(error));
}


// ====================================
// Display crime data - charts & table
// ====================================

// Updates crime data table
function updateTable(data) {
  data = data || crimeData;
  const tbl = $("tbody");
  tbl.empty();
  if (data.length > 0) {
    data.forEach((item, i) => {
      const rw = $("<tr>");
      rw.append($(`<th scope="row">${(i + 1)}</th>`));
      rw.append($(`<td>${item.category}</td>`));
      rw.append($(`<td>${item.count}</td>`));
      tbl.append(rw);
    });
  } else {
    $("tbody").append($("<tr><td colspan='3'>No crime data reported for location.</td></tr>"));
    $("#table-tab")[0].click();
  }
}

// updates crime graphs
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
  }
  // Force chart to resize based on number of categories
  $("#bar-graph").css("height", Math.max(50, 50 * data.length) + "px"); 
  $("#bar-graph").css("width", "100%");
  if (data.length < 3 && $("#radar-tab-pane").hasClass("show")) { $("#bar-tab")[0].click(); }
}

// Helper to create a new chart instance from supplied data array
function createChart(data, type) {
  const isRadar = type === "radar";
  const chart = new Chart(document.getElementById(type + "-graph"), {
    type: type,
    data: {
      labels: data.map((row) => row.category),
      datasets: [
        {
          label: "Top Reported Crimes",
          data: data.map((row) => row.count),
        },
      ],
    },
    options: { maintainAspectRatio: isRadar, indexAxis: "y", plugins: { legend: { display: isRadar } } },
  });
  return chart
}

// Clear charts if they exist
function destroyCharts() {
    if (radarChart) { radarChart.destroy(); }
    if (radarChart) { barChart.destroy(); }
    radarChart = null;
    barChart = null;
  }

// ============
// Geolocation
// ============

// Gets lat / lng from searched city
function getGeoData(city) {
    city = city.toUpperCase();
    if (places.hasOwnProperty(city)) {
      getPlaceLocation(city);
      return;
    }
    city = capitalize(city);
    var APIKey = "33759846bc0f4ad6eea2a8a5065678b2";
    var queryURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + ",GB&appid=" + APIKey;
    fetch(queryURL).then(r => r.json()).then(data => {
      if (!data.length) {
          showAlert("Location not found")
        } else {
          // Success! Update city name, add to search history and pass off to the data updating functions
          let location = data[0];
          $("#city-name").text(location.name);
          location = { name: location.name, latitude: location.lat,longitude: location.lon };
          addHistory(location);
          getCrimeData(location);
          getpoliceforce(location);
        }
    });
}

// Gets lat/lng from user IP address
function getIPLocation() {
  fetch("https://api.bigdatacloud.net/data/reverse-geocode-client").then(r => r.json()).then(data => {
    const location = { name: data.city, latitude: data.latitude, longitude: data.longitude };
    sunStatus(location); 
    console.log(data);
    if (data.countryCode === "GB" && data.principalSubdivisionCode === "GB-ENG") {
      getCrimeData(location);
      getpoliceforce(location);
      $("#city-name").text(data.city);
    }
  })
}


// ==================
// Police force info
// ==================

// 2 functions to get the police force from lat and long and the other to give details about the police force
// Gets the police force id
function getpoliceforce(location){
	$.ajax({
        url: "https://data.police.uk/api/locate-neighbourhood?q="+location.latitude +","+ location.longitude,
        method: "GET",
        statusCode: {
          404: function() { 
            fetchComplete();
            showAlert("No data available" + (location.name ? " for " + location.name: ""));
          },
        },
    }).then(function (response) {
        const policeforcetext = response.force;
       policeforce(policeforcetext);
    });
}

// Uses force id to get force info
function policeforce(policeforcetext){
	$.ajax({
        url: "https://data.police.uk/api/forces/" + policeforcetext,
        method: "GET",
    }).then(function (response) {
        $("#city-police-force").text(response.name);
        const info = $("#city-description")
        info.empty();
        if (response.description && response.description !== "<p>Force  profile</p>") { info.html(response.description); }
        // Update social media buttons and display any additional links
        const links = [];
        const fb = $("#fb");
        const tw = $("#tw");
        const li = $("#li");
        const yt = $("#yt");
        const fl = $("#fl");
        $("#social > a").addClass("d-none");
        if (response.url) { links.push(response.url + (response.url.endsWith("/") ? "" : "/")); }
        response.engagement_methods.forEach(link => {
          if (link.url && link.type !== "mobile") {
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
              // Fix for staffordshire police giving wrong youtube address
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
        fetchComplete();
    });
}


// =================
// Fetch Crime data
// =================

// alternative method for fecthing crime data by nearest neighbourhood
// not currently used but could be an alternative for the future
function neighbourhoodCrime(location) {
  let url = `https://data.police.uk/api/locate-neighbourhood?q=${location.latitude},${location.longitude}`
  $.ajax({ url, method: "GET" }).then(data => {
    url = `https://data.police.uk/api/${data.force}/${data.neighbourhood}`;
    $.ajax({ url, method: "GET" }).then(data => {
      url = `https://data.police.uk/api/crimes-street/all-crime?lat=${data.centre.latitude}&lng=${data.centre.longitude}`
      $.ajax({ url, method: "GET" }).then(data => {
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
        fetchComplete();
      });
    });
  });
}

// Function that accepts an object containing a latitude and longitude in the
// format obj.latitude and obj.longitude and retrieves crime data for that location
function getCrimeData(location) {
    crimeData = [];  
    if (!location || !location.latitude) {
      destroyCharts();
      $("tbody").empty();
      return;
    }
    let url = `https://data.police.uk/api/crimes-street/all-crime?lat=${location.latitude}&lng=${location.longitude}`
    // neighbourhoodCrime(location); return;
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
        fetchComplete();
    });
}


// ===========================
// Helper (utility) functions
// ===========================

// removes duplicates from a 1d arrray  
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

// Capitalizes every word in a string
function capitalize(str) {
  if (!str) return;
  str = str.toLowerCase();
  words = str.includes(" ") ? str.split(" ") : [str];
  str = "";
  words.forEach(word => str += word.charAt(0).toUpperCase() + word.slice(1) + " ");
  return str.trim();
}

// Clears all currently displayed data
function clearData() {
  $("#city-police-force").empty();
  $("#city-description").empty();
  $("#social > a").addClass("d-none");
  $("tbody").empty();
  destroyCharts();
}

// Shows loading modal
function doLoading() {
  count = 0;
  $(".loading").removeClass("d-none");
  setTimeout(() => $(".loading").addClass("d-none"), 2500);
}

// Hides loading modal when fetches complete
function fetchComplete() {
  count++;
  if (count === 2) { $(".loading").addClass("d-none") }
}


// ================
// Event listeners
// ================
function addAllEventListeners() {

  // Presents an autocomplete list as the user types
  $("#city-input").on("keyup", (e) => {
    if (e.target.value.length >= 2) {
      if (!places.hasOwnProperty(e.target.value.toUpperCase())) {
        autocompleteSearch(e.target.value);
      }
    }
  })

  // Search for city on submit button click
  $("#search").on("submit", function (event) {
    event.preventDefault();
    clearData();
    const input = $("#city-input");
    const cityname = input.val().trim();
    if (cityname) {
      doLoading();
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
  $(document).on("click", "ul a", function (ev) {
    if (ev.target.tagName === "I") {
      deleteHistoryItem(this.dataset.name);
    } else {
      let location = {name: this.dataset.name, latitude: this.dataset.lat, longitude: this.dataset.lng };
      if (window.innerWidth <= 991) {
        $('#collapse-history')[0].click();
      }
      clearData();
      doLoading();
      getCrimeData(location);
      getpoliceforce(location);
      $("#city-name").text(location.name);
    }
  });

  // Gets user exact location if allowed and updates data
  $("#search .input-group svg").on("click", () => {
    navigator.geolocation.getCurrentPosition((location) => {
      fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${location.coords.latitude}&longitude=${location.coords.longitude}`)
      .then(r => r.json())
      .then(data => {
        if (data.countryCode === "GB") {
          doLoading();
          $("#city-name").text(data.city);
          getCrimeData(data);
          getpoliceforce(data);
        } else {
          showAlert("Crime data only availble for Great Britain.")
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

// Shows a modal alert with the supplied string as text.
function showAlert(message) {
  if (!message || !message.trim()) { message = "Alert!" }
  document.querySelector("#alertMessage").textContent = message;
  document.querySelector("#alert").showModal();
}
