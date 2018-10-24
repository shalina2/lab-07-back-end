'use strict';

const express = require('express');
const cors = require('cors');
const superagent =require('superagent');

require('dotenv').config();

const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());



//This will take the location name and run the searchtolatlong() which will store the location information as an object that contains latitude,longitude and location name.
app.get('/location', (request, response) => {
  // console.log('GET /location', request.query);
  
  //runs the searchtolatlong() which takes in the query data from the URL.
  searchToLatLong(request.query.data)
    .then( locationData => {//location data is the superagent return
      response.send(locationData);
    })
    //This will handle our errors
    .catch ( error => handleError(error,response));
});

app.listen(PORT, () => console.log(`App is up on http://localhost:${PORT}`));

//This function takes in the query and makes the request to the API,then format the data that it gets into the object that we need.
function searchToLatLong(query) {
  const URL = `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${process.env.GEOCODE_API_KEY}`;
  // console.log('getting',URL);

  return superagent.get(URL)
    .then( data => {
      let location = new Location(data.body.results[0]);

      //This line fills in the Actual search query to the object.
      // location.search_query = query;
      return location;
    })
    .catch(error => handleError(error));
}

function Location(data) {
  this.formatted_query = data.formatted_address;
  this.latitude = data.geometry.location.lat;
  this.longitude = data.geometry.location.lng;
}


/////weather

app.get('/weather', (request, response)=>{
  searchWeather(request.query.data)
    .then( weatherData => {
      response.send(weatherData);
    })
})

function searchWeather(location){
  const URL = `https://api.darksky.net/forecast/${process.env.WEATHER_API_KEY}/${location.latitude},${location.longitude}`;
  
  return superagent.get(URL)
    .then( data => {
      let weatherData = data.body.daily.data.map( day => {
        return new Weather(day);
      })
      return weatherData;
    })
}

function Weather (day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0,15);
}


////YELP


app.get('/yelp', (request, response) => {
  searchYelp(request.query.data)//this is the formatted location objecy
    .then( yelpData => {
      response.send(yelpData);
    })
})

function searchYelp(location){
  const URL = `https://api.yelp.com/v3/businesses/search?latitude=${location.latitude}&longitude=${location.longitude}`;

  return superagent.get(URL)
    .set( 'Authorization', `Bearer ${process.env.YELP_API_KEY}`)
    .then( data => {
      let yelpData = data.body.businesses.map( item => {
        return new Business(item);
      })
      console.log(yelpData);
      return yelpData;
    })
}

function Business(business) {
  this.name = business.name;
  this.image_url = business.image_url;
  this.price = business.price;
  this.rating = business.rating;
  this.url = business.url;
}

//////////errors
function handleError(error,response) {
  console.log('error',error);
  if(response){
    response.status(500).send('sorry there is no data')
  }
}

