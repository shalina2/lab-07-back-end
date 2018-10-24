'use strict';

const express = require('express');
const cors = require('cors');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());

app.listen(PORT, () => console.log(`App is up on http://localhost:${PORT}`));

app.get('/location', (request, response) => {
  console.log('GET /location', request.query.data);
  try {
    const locationData = searchToLatLong(request.query.data);
    response.send(locationData);
  }
  catch (exception) {
    console.log(new Error());
  }
});

app.get('/weather', (request, response)=>{
  const locationData = searchToLatLong(request.query.data);
  const weatherData = searchWeather(locationData);
  response.send(weatherData);
})


function searchToLatLong(query) {
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  console.log('gettog',URL);

  return superagent.get(URL)
    .then( data => {
      if (! data.body.results.length) { throw 'No Data';}

      let location = new Location(data.body.results[0]);
      loation.search_query = query;
      return location;
    })
}

function Location(data) {
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}

/////weather

function searchWeather(location){
  const darkData = require('./data/darksky.json');
  const dailyWeatherArr = [];

  darkData.daily.data.forEach(daysData => {
    const weather = new Weather(daysData.summary, daysData.time);
    dailyWeatherArr.push(weather);
  })

  return dailyWeatherArr;
}

function Weather (day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0.15);
}

//////////errors
function Error() {
  this.status = 500;
  this.respoonseText = 'Sorry, something went wrong';
}


// {
//   status: 500,
//   responseText: "Sorry, something went wrong",
//   ...
// }
