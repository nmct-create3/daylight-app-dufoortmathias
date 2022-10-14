// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
  //Get hours from milliseconds
  const date = new Date(timestamp * 1000);
  // Hours part from the timestamp
  const hours = "0" + date.getHours();
  // Minutes part from the timestamp
  const minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp (gebruiken we nu niet)
  // const seconds = '0' + date.getSeconds();

  // Will display time in 10:30(:23) format
  return hours.substr(-2) + ":" + minutes.substr(-2); //  + ':' + s
}

// 5 TODO: maak updateSun functie
let updateSun = (sunElement, minutesSunUp, totalMinutes) => {
  let percentage = (minutesSunUp / totalMinutes) * 100;
  console.log("percentage " + percentage);
  sunElement.style.left = `${percentage}%`;
  const y = percentage > 50 ? (100 - percentage) * 2 : percentage * 2;
  sunElement.style.bottom = `${y}%`;
  console.log("y " + y);
  var x =
    percentage > 100 || percentage < 0
      ? document.querySelector(".is-day").classList.add("is-night")
      : document.querySelector(".is-day").classList.remove("is-night");

  //huidige tijd instellen
  sunElement.dataset.time = _parseMillisecondsIntoReadableTime(
    Date.now() / 1000
  );
};

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = (totalMinutes, sunrise) => {
  // In de functie moeten we eerst wat zaken ophalen en berekenen.
  // Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
  const sunElement = document.querySelector(".js-sun");
  // Bepaal het aantal minuten dat de zon al op is.
  // Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
  // We voegen ook de 'is-loaded' class toe aan de body-tag.
  // Vergeet niet om het resterende aantal minuten in te vullen.
  // Nu maken we een functie die de zon elke minuut zal updaten
  // Bekijk of de zon niet nog onder of reeds onder is
  // Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
  // PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
  const minutesSunUp = Math.floor((Date.now() / 1000 - sunrise) / 60);
  console.log("minutesSunUp " + minutesSunUp);
  document.querySelector("body").classList.add("is-loaded");

  const interval = setInterval(() => {
    const minutesSunUp = Math.floor((Date.now() / 1000 - sunrise) / 60);
    updateSun(sunElement, minutesSunUp, totalMinutes);
    if (minutesSunUp >= totalMinutes) {
      clearInterval(interval);
    }
  }, 1000);
};

const updateTimeAndTimeLeft = (sunset) => {
  const timeNow = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
  console.log("timeNow " + timeNow);
  document.querySelector(".js-sun").setAttribute("data-time", timeNow);

  const timebetween = new Date(sunset) - Date.now() / 1000;
  const hours = Math.floor(timebetween / 3600);
  const minutes = Math.floor((timebetween % 3600) / 60);
  console.log("timebetween " + timebetween);
  console.log("hours " + hours);
  console.log("minutes " + minutes);
  if (hours > 0 && minutes >= 0) {
    document.querySelector(
      ".js-time-left"
    ).innerText = `${hours} hours ${minutes} minutes`;
  } else if (hours <= 0 && minutes >= 0) {
    document.querySelector(".js-time-left").innerText = `${minutes} minutes`;
  } else {
    const timebetween2 = Date.now() / 1000 - new Date(sunset);
    const hours2 = Math.floor(timebetween2 / 3600);
    const minutes2 = Math.floor((timebetween2 % 3600) / 60);
    console.log("timebetween2 " + timebetween2);
    console.log("hours2 " + hours2);
    console.log("minutes2 " + minutes2);
    document.querySelector(
      ".js-summary"
    ).innerHTML = `<span class="js-time-left">4 minutes less</span><span class="u-muted"> sunlight today. unfortunately. It&#8217ll get better!</span>`;
    if (hours2 > 0 && minutes2 >= 0) {
      document.querySelector(
        ".js-time-left"
      ).innerText = `${hours2} hours ${minutes2} minutes less`;
    } else if (hours2 <= 0 && minutes2 > 0) {
      document.querySelector(
        ".js-time-left"
      ).innerText = `${minutes2} minutes less`;
    }
  }
};

// 3 Met de data van de API kunnen we de app opvullen
let showResult = (queryResponse) => {
  // We gaan eerst een paar onderdelen opvullen
  // Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
  // Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
  document.querySelector(".js-sunrise").innerHTML =
    _parseMillisecondsIntoReadableTime(queryResponse.city.sunrise);
  document.querySelector(".js-sunset").innerHTML =
    _parseMillisecondsIntoReadableTime(queryResponse.city.sunset);
  document.querySelector(
    ".js-location"
  ).innerHTML = `${queryResponse.city.name}, ${queryResponse.city.country}`;
  // Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
  // Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
  updateTimeAndTimeLeft(queryResponse.city.sunset);
  const totalMinutes = Math.floor(
    (new Date(queryResponse.city.sunset) -
      new Date(queryResponse.city.sunrise)) /
      60
  );
  console.log("totalMinutes " + totalMinutes);
  placeSunAndStartMoving(totalMinutes, queryResponse.city.sunrise);
};

const getData = async (endpoint) => {
  return fetch(endpoint)
    .then((r) => r.json())
    .catch((e) => console.error(e));
};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = async (lat, lon) => {
  // Eerst bouwen we onze url op
  // Met de fetch API proberen we de data op te halen.
  // Als dat gelukt is, gaan we naar onze showResult functie.
  const data = await getData(
    `http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=31fea691686933c4c7c9a60320ade81c&units=metric&lang=nl&cnt=1`
  );
  console.log(data);
  showResult(data);
};

document.addEventListener("DOMContentLoaded", function () {
  console.log("Test");
  // 1 We will query the API with longitude and latitude.
  getAPI(50.8027841, 3.2097454);
});
