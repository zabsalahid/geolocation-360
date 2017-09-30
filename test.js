'use strict'

const geolocation = require('./lib/geolocation-360')()

let params = {
	mcc: '515',
	mnc: '03',
	lac: '2b0c',
	cid: '7be7',
	apiKey: 'apiKey'
}

geolocation.requestGoogle(params, (err, result) => {
	if (result) {
		console.log(result)
	} else {
		console.log('nag error: ' + err.message)
	}
})