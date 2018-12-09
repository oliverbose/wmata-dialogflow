const express = require('express')
const https = require('https')
const app = express()
const port = 443

app.get('/', (request, response) => {
    get('1002475', response)
})

app.listen(port, (err) => {
    if (err) {
        return console.log('something bad happened', err)
    }

    console.log(`server is listening on ${port}`)
})

function get(stop, response) {
    var options = {
        proto: 'https',
        host: 'api.wmata.com',
        port: 443,
        path: '/NextBusService.svc/json/jPredictions?StopID=' + stop,
        method: 'GET',
        headers: { 'api_key': 'e13626d03d8e4c03ac07f95541b3091b' },
        data: ''
    };
    https.request(options, (resp) => {
        let data = '';

        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on('end', () => {
            let wmata = JSON.parse(data)
            let stopName = wmata.StopName;
            let result = 'Departures for ' + stopName + '.';
            let predictions = wmata.Predictions;
            predictions.forEach(prediction => {
                result += 'Bus ' + prediction.RouteID + ' will depart in ' + prediction.Minutes + ' minutes.';
            });
            var jsonResult = {}
            jsonResult['speech'] = result;
            jsonResult['displayText'] = result;
            jsonResult['source'] = 'WMATA';

            response.send(JSON.stringify(jsonResult))

        });

    }).on("error", (err) => {
        console.log("Error: " + err.message);
        response.send(err.message)
    }).end();
}

function requestLogger(httpModule) {
    var original = httpModule.request
    httpModule.request = function (options, callback) {
        console.log(options.href || options.proto + "://" + options.host + options.path, options.method)
        return original(options, callback)
    }
}

requestLogger(require('https'))

/*
{
  "StopName": "Sherman Circle + Crittenden St",
  "Predictions": [
    {
      "RouteID": "62",
      "DirectionText": "South to Georgia Ave - Petworth Station",
      "DirectionNum": "1",
      "Minutes": 16,
      "VehicleID": "7340",
      "TripID": "880684070"
    },
    {
      "RouteID": "62",
      "DirectionText": "South to Georgia Ave - Petworth Station",
      "DirectionNum": "1",
      "Minutes": 41,
      "VehicleID": "7220",
      "TripID": "880683070"
    }
  ]
}
*/