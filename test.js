'use strict'

const geolocation = require('./lib/geolocation-360')

let init = {
	googleApiKey: 'google api key',
	openCellIdApiKey: 'open cell id token',
	mcc: '515',
	mnc: '03',
}
geolocation.initialize(init)

let params = {
	lac: '2b0c',//11020
	cid: '7be7',//31719
}

	geolocation.requestGoogle(params, (err, result) => {
		if (result) {
			console.log('google', result)
		} else {
			console.log('google error: ' + err.message)
		}
	})

	geolocation.requestOpenCellId(params, (err, result) => {
		if (result) {
			console.log('openCellId', result)
		} else {
			console.log('openCellId error: ' + err.message)
		}
	})

	geolocation.request(params, (err, result) => {
		if (result) {
			console.log('main', result)
		} else {
			console.log('main', err)
		}
	})