const geolocation = require('./lib/geolocation-360')()

let params = {
	cid: 31719,
	lac: 11020,
	mcc: 515,
	mnc: 03,
	apiKey: 'AIzaSyDCv4Q5PZgs6G4RIirGqKXZlXpelDDA5C4'
}

console.log(geolocation)

// let a = () => {
	geolocation.requestGoogle(params, (err, result) => {
		if (result) {
			console.log(result)
		} else {
			console.log(err)
		}
	})
// }

// setInterval(a, 5000)