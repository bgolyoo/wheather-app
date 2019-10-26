const app = require("express")();

const fakeResponse = {
  coord: {
    lon: -0.13,
    lat: 51.51
  },
  weather: [
    {
      id: 521,
      main: "Rain",
      description: "shower rain",
      icon: "09d"
    }
  ],
  base: "stations",
  main: {
    temp: 287.03,
    pressure: 1020,
    humidity: 66,
    temp_min: 284.15,
    temp_max: 289.26
  },
  visibility: 10000,
  wind: {
    speed: 2.1,
    deg: 10
  },
  rain: {
    "1h": 0.51
  },
  clouds: {
    all: 24
  },
  dt: 1557578585,
  sys: {
    type: 1,
    id: 1414,
    message: 0.0092,
    country: "GB",
    sunrise: 1557548128,
    sunset: 1557603505
  },
  id: 2643743,
  name: "London",
  cod: 200
};

app.use("/**", (req, res) => {
  console.log(`[${new Date().toISOString()}] INFO - Sending fake data`);
  res.send(fakeResponse);
});

app.listen(3001, () =>
  console.log("Fake open weather server listening on port 3001...")
);
