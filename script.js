///////////////// UTILS /////////////////////////////

function isValidCityName(str) {
    return !!str.match(/[a-z]+/i);
}

function getRandomNumberBetween(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

function getRandomArrayElement(array) {
  return array[getRandomNumberBetween(0, array.length - 1)]
}

///////////////// NETWORK ///////////////////////////

function handleFetchResponse(response) {
  if(response.ok) {
      return response.json();
  } else {
      return Promise.reject(response);
  }
}

function handleFetchError(error) {
  alert('Une erreur est survenue lors de la communication avec le service de données');
  console.error(error);
}

function getCitiesByName(name) {
    return fetch('https://geo.api.gouv.fr/communes?nom=' +  name + '&limit=10')
      .then(handleFetchResponse)
      .catch(handleFetchError);
}

function getCityByCode(citycode) {
    return fetch('https://geo.api.gouv.fr/communes?code=' +  citycode +
        '&fields=code,nom,surface,departement,population,contour,centre,codesPostaux')
        .then(handleFetchResponse).then(cities => cities[0]).catch(handleFetchError)
}

function fetchCityImages(cityName) {
  const q = encodeURIComponent(cityName + ' France')
  return fetch(`https://pixabay.com/api/?key=17897584-e09f7abfae1318c47f87ae891&q=${q}&image_type=photo`)
    .then(handleFetchResponse)
    .catch(handleFetchError)
}

///////////////// DOM MANIPULATIONS /////////////////

function showCityOnMap(city) {
  const map = L.map('map');
  const osmLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
  });
  map.addLayer(osmLayer);
  L.geoJSON(city.contour, {style: {"color": "#060eff", "weight": 2, "opacity": 0.3}}).addTo(map);
  map.setView([city.centre.coordinates[1], city.centre.coordinates[0]], 10);
}

function getAutocompleteListContainer() {
}

function getCityDetailsContainer() {
}

function getUserInput() {
}

function getCityImgElement() {
}

function removeChildren(container) {
}

function removeCityDetails() {
}

function clearAutoCompleteList() {
}

function resetCityImage() {

}

function showSuggestions() {
}

function hideSuggestions() {
}


/**
 * Returns an html element that represent a list item in the autocomplete input
 * @param city : an object of this shape : {nom, code, codeDepartement}
 */
function getListItemHtmlElement(city) {
  
}

/**
 * Destroys and recreates the suggestions of the autocomplete input
 * @param cities : an array of object with this shape : {nom, codeDepartement}
 */
function recreateAutocompleteList(cities) {
  
}

/**
 * Creates the elements for city detailed info
 * @param city : object of this shape :
 * {nom, departement: {nom}, code, population, superficie, contour, centre, codesPostaux }
 */
function createCityDetailsElements(city) {
  // Code INSEE, Population, Superficie, Département, codesPostaux

  
}

////////////////// EVENT HANDLERS ////////////////

function handleUserInput() {
  
}



function updateCityImage(cityName) {
  
}

function handleListItemSelection() {
  
}

/////////////////// EVENT BINDINGS /////////////////

