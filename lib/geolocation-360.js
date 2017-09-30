'use strict'

const events = require('events')
const httpreq = require('httpreq')

module.exports = function() {
  const modules = {}
  const requiredKeys = ['mcc', 'mnc', 'lac', 'cid']

  modules.lacksParams = (params, provider) => {
    if (provider) {
      switch (provider) {
        case 'google':
          requiredKeys.push('apiKey')
          break
      }
    }
    for (let key in requiredKeys) {
      if (!params[requiredKeys[key]]) {
        return new Error(`Parameter ${requiredKeys[key]} is required`)
      } else {
        if (requiredKeys[key] == 'lac' || requiredKeys[key] == 'cid')
        params[requiredKeys[key]] = parseInt(params[requiredKeys[key]],16)
      }
    }
    return undefined
  }

  modules.requestGoogle = (params, callback) => {
    let lacks = modules.lacksParams(params, 'google')
    if (lacks) return callback(lacks)
    let googleParams = {
      cellTowers: [{
        cellId: params.cid,
        locationAreaCode: params.lac,
        mobileCountryCode: params.mcc,
        mobileNetworkCode: params.mnc
      }]
    }

    let options = {
      method: 'POST',
      url: `https://www.googleapis.com/geolocation/v1/geolocate?key=${params.apiKey}`,
      json: googleParams,
    }

    httpreq.doRequest(options, (err, res) => {
      let data = res && res.body || ''
      let error = null;

      try {
        data = JSON.parse(data);
      } catch (e) {
        error = new Error('invalid response')
        error.error = e
      }

      if (err) {
        error = new Error('request failed')
        error.error = err
      }

      if (data && data.error) {
        error = new Error('api error')
        error.error = data.error.errors
      }

      if (error) {
        error.statusCode = res && res.statusCode
        callback(error)
      } else {
        callback(null, data)
      }
    })
  }
  return modules
}