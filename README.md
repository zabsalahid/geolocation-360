# geolocation-360
A library for getting coordinates from mobile country code(MCC), mobile network code(MNC), location area code(LAC) and Cell ID(CID).

## Node package
Using npm:
```shell
$ npm i --save geolocation-360
```

In Node.js:
```javascript
var geolocation = require('geolocation-360');
```

## Code examples

### Initialization

```javascript
var init = {
	googleApiKey: 'google api key',
	openCellIdApiKey: 'open cell id token',
	mcc: '515', //supply for default value
	mnc: '03', //supply for default value
};

geolocation.initialize(init)
```

#### Requests

```javascript
var params = {
	lac: '2b0c',
	cid: '7be7',
	mcc: '515', //will use default value on init if not supplied
	mnc: '05', //will use default value on init if not supplied
}

``will use requests available in order of api key provided
geolocation.request(params, (error, result) => {
	if (result) {
		//prints
		//{
		//	provider: 'GooglePrimite | Google | OpenCellId',
		//	latitude: 14.498896,
		//	longitude: 121.003997
		//}
		console.log(result)
	} else {
		//prints `Provider` error: `Provider`: usageLimits | `error message`
		console.log(result)
	}
})

geolocation.requestGooglePrimitive(params, (error, result))
geolocation.requestGoogle(params, (error, result))
geolocation.requestOpenCellId(params, (error, result))
```
