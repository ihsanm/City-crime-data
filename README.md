# Project name: City Crime Data
 ## Project idea: Using apis to gather data on city crime and a brief summary of the city.
 ## Github URL: https://github.com/ihsanm/City-crime-data
 ## Deployed Site: https://ihsanm.github.io/City-crime-data/

 ### API details:

 * Uses the [UK Police Data API](https://data.police.uk/docs/) to get the crime in searched area.
 * Uses [OpenWeatherMap](https://openweathermap.org/api/geocoding-api) to get the longitude and latitude.
 * Uses the [UK Police Force API](https://data.police.uk/docs/method/force/) to get a brief summary of the localities police force.
 * Uses the [Google Places API](https://developers.google.com/maps/documentation/places/web-service/autocomplete) to get an autocomplete list as the user types
  * Uses a [Reverse Geocoding API](https://api.bigdatacloud.net/data/reverse-geocode-client) to get the approximate user location by IP address
  * Uses https://api.sunrise-sunset.org to calculate the sun rise/sunset for a given location

 Though these the site:
 * Finds the crime data and use a spider graph to display crime in given city.
 * Previous searches will be stored in local storage and can be revisited.
 * A clear search history button which will remove all previous searches.

 ### Bonus feature
 * MAPS!