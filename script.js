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

function getAutocompleteListContainer() {
    return document.getElementById('autocomplete-list');
}

function getCityDetailsContainer() {
    return document.getElementById('city-details');
}

function getUserInput() {
    return document.getElementById('user-input');
}

function getCityImgElement() {
  return document.getElementById('city-img')
}

function removeChildren(container) {
  container.querySelectorAll('*').forEach(child => child.remove());
}

function resetCityImage() {
  getCityImgElement().src = ''
}

/**
 * Returns an html element that represent a list item in the autocomplete input
 * @param city : an object of this shape : {nom, codeDepartement}
 */
function getListItemHtmlElement(city) {
    const listItem = document.createElement('li');
    listItem.appendChild(
        document.createTextNode(city.nom + (city.codeDepartement ? (' - ' + city.codeDepartement) : ''))
    );
    listItem.setAttribute('data-citycode', city.code);
    listItem.setAttribute('data-cityname', city.nom);
    listItem.addEventListener('click', handleListItemSelection);
    return listItem;
}

function clearAutoCompleteList() {
    removeChildren(getAutocompleteListContainer());
}

/**
 * Destroys and recreates the suggestions of the autocomplete input
 * @param cities : an array of object with this shape : {nom, codeDepartement}
 */
function recreateAutocompleteList(cities) {
    clearAutoCompleteList();
    const autoCompleteList = getAutocompleteListContainer();
    cities.forEach(city => autoCompleteList.appendChild(getListItemHtmlElement(city)));
}

/**
 * Creates the elements for city detailed info
 * @param city : object of this shape :
 * {nom, departement: {nom}, code, population, superficie, contour, centre, codesPostaux }
 */
function createCityDetailsElements(city) {
    const container = getCityDetailsContainer();

    if (city.centre && city.contour) {
        const cityMapElement = document.createElement('div');
        cityMapElement.setAttribute('id', 'map');
        container.appendChild(cityMapElement);
        showCityOnMap(city);
    }

    const table = document.createElement('table');
    table.setAttribute('class', 'table')

    const innerTableString = `
      <tr>
        <td>Code INSEE</td>
        <td>${city.code || 'NC'}</td>
      </tr>
      <tr>
        <td>Population</td>
        <td>${city.population || 'NC'} habitants</td>
      </tr>
      <tr>
        <td>Superficie</td>
        <td>${city.surface || 'NC'} ha</td>
      </tr>
      <tr>
        <td>Département</td>
        <td>${(city.departement && city.departement.nom) || 'NC'}</td>
      </tr>
      <tr>
        <td>Codes posteaux</td>
        <td>${(city.codesPostaux && city.codesPostaux.length !== 0) ? city.codesPostaux.join(', ') : 'NC'}</td>
      </tr>
    `;
    table.innerHTML = innerTableString;
    container.appendChild(table);
}

function removeCityDetails() {
    removeChildren(getCityDetailsContainer());
}

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

////////////////// EVENT HANDLERS ////////////////

function handleUserInput() {
    const inputValue = getUserInput().value;
    if (isValidCityName(inputValue)) {
        getCitiesByName(inputValue).then(recreateAutocompleteList);
    } 
    
    if (inputValue === '') {
        clearAutoCompleteList();
        removeCityDetails();
        resetCityImage();
    }
}

function showSuggestions() {
  getAutocompleteListContainer().classList.remove('hidden')
}

function hideSuggestions() {
  getAutocompleteListContainer().classList.add('hidden')
}

let imageRotationTimer = null
function updateCityImage(cityName) {
  if (imageRotationTimer) {
    clearInterval(imageRotationTimer)
    imageRotationTimer = null;
  }

  let images = []
  function updateImageSource() {
    const image = getRandomArrayElement(images)
    if (image) {
      getCityImgElement().src = image.webformatURL
    }
  }

  fetchCityImages(cityName).then(res => {
    images = res.hits
    updateImageSource()
  })

  imageRotationTimer = setInterval(updateImageSource, 5000)
}

function handleListItemSelection() {
    const cityCode = this.dataset.citycode
    const cityName = this.dataset.cityname
    getUserInput().value = cityName;
    removeCityDetails();
    resetCityImage();
    updateCityImage(cityName);
    getCityByCode(cityCode).then(createCityDetailsElements);
}

/////////////////// EVENT BINDINGS /////////////////

// give suggestions when the user searches for a city by name or zip code
getUserInput().addEventListener('input', handleUserInput);

getUserInput().addEventListener('focus', () => {
  getUserInput().select()
  showSuggestions()
});
getUserInput().addEventListener('blur', () => setTimeout(hideSuggestions, 200));
