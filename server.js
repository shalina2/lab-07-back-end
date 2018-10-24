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
  // console.log('gettog',URL);

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
  searchYelp(request.query.data)
    // .then( weatherData => {
    //   response.send(weatherData);
    // })
})

function searchYelp(location){
  const URL = `https://api.yelp.com/v3/${process.env.YELP_API_KEY}/${location.latitude},${location.longitude}`;
  
  return superagent.get(URL)
    .then( data => {
      let yelpData = data.body.daily.data.map( day => {
        return new Weather(day);
      })
      return weatherData;
    })
}

//name
data.businesses[0].name
//image URL
data.businesses[0].image_url
//price
data.businesses[0].price
//rating
data.business[0].rating
//url
data.business[0].url

// {
//   "total": 8228,
//   "businesses": [
//     {
//       "rating": 4,
//       "price": "$",
//       "phone": "+14152520800",
//       "id": "E8RJkjfdcwgtyoPMjQ_Olg",
//       "alias": "four-barrel-coffee-san-francisco",
//       "is_closed": false,
//       "categories": [
//         {
//           "alias": "coffee",
//           "title": "Coffee & Tea"
//         }
//       ],
//       "review_count": 1738,
//       "name": "Four Barrel Coffee",
//       "url": "https://www.yelp.com/biz/four-barrel-coffee-san-francisco",
//       "coordinates": {
//         "latitude": 37.7670169511878,
//         "longitude": -122.42184275
//       },
//       "image_url": "http://s3-media2.fl.yelpcdn.com/bphoto/MmgtASP3l_t4tPCL1iAsCg/o.jpg",
//       "location": {
//         "city": "San Francisco",
//         "country": "US",
//         "address2": "",
//         "address3": "",
//         "state": "CA",
//         "address1": "375 Valencia St",
//         "zip_code": "94103"
//       },
//       "distance": 1604.23,
//       "transactions": ["pickup", "delivery"]
//     },
//     // ...
//   ],
//   "region": {
//     "center": {
//       "latitude": 37.767413217936834,
//       "longitude": -122.42820739746094
//     }
//   }
// }
////////////////////////////////////
// [
//   {
//     "name": "Pike Place Chowder",
//     "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/ijju-wYoRAxWjHPTCxyQGQ/o.jpg",
//     "price": "$$   ",
//     "rating": "4.5",
//     "url": "https://www.yelp.com/biz/pike-place-chowder-seattle?adjust_creative=uK0rfzqjBmWNj6-d3ujNVA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=uK0rfzqjBmWNj6-d3ujNVA"
//   },
//   {
//     "name": "Umi Sake House",
//     "image_url": "https://s3-media3.fl.yelpcdn.com/bphoto/c-XwgpadB530bjPUAL7oFw/o.jpg",
//     "price": "$$   ",
//     "rating": "4.0",
//     "url": "https://www.yelp.com/biz/umi-sake-house-seattle?adjust_creative=uK0rfzqjBmWNj6-d3ujNVA&utm_campaign=yelp_api_v3&utm_medium=api_v3_business_search&utm_source=uK0rfzqjBmWNj6-d3ujNVA"
//   },
//   ...
// ]

function Weather (day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toString().slice(0,15);
}


//////////errors
function handleError(error,response) {
  console.log('error',error);
  if(response){
    response.status(500).send('sorry there is no data')
  }
}

