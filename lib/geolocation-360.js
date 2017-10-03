'use strict'

const events = require('events')
const httpreq = require('httpreq')

const radioTypes = ['gsm', 'lte', 'cdma', 'wcdma']

let defaults = {
  mcc: '515',
  mnc: '03',
  radioType: radioTypes[0],
  timeout: 3000
}

const Geolocation360 = {
  initialize: (params) => {
    for (let key in params) {
      defaults[key] = params[key]
    }
  },

  lacksParams: (params, provider) => {
    let requiredKeys = ['mcc', 'mnc', 'lac', 'cid']
    if (provider) {
      switch (provider) {
        case 'google':
          requiredKeys.push(`${provider}ApiKey`)
          break
        case 'openCellId':
          requiredKeys.push(`${provider}ApiKey`)
          break
      }
    }
    for (let key in requiredKeys) {
      if (!params[requiredKeys[key]]) {
        if (requiredKeys[key].indexOf('ApiKey') > -1) {
          if (!defaults[requiredKeys[key]]) {
            return new Error(`Parameter ${requiredKeys[key]} is required`)
          } else {
            params[requiredKeys[key]] = defaults[requiredKeys[key]]
          }
        } else {
          return new Error(`Parameter ${requiredKeys[key]} is required`)
        }
      } else {
        if (requiredKeys[key] == 'lac' || requiredKeys[key] == 'cid') {
          if (!params.isChecked) params[requiredKeys[key]] = parseInt(params[requiredKeys[key]],16)
        }
      }
    }
    params.isChecked = true
    return undefined
  },

  requestGoogle: (params, callback) => {
    let lacks = Geolocation360.lacksParams(params, 'google')
    if (lacks) return callback(lacks)
    let requestBody = {
      radioType: params.radioType || defaults.radioType,
      cellTowers: [{
        cellId: params.cid,
        locationAreaCode: params.lac,
        mobileCountryCode: params.mcc || defaults.mcc,
        mobileNetworkCode: params.mnc || defaults.mnc
      }]
    }

    let options = {
      timeout: params.timeout || defaults.timeout,
      method: 'POST',
      url: `https://www.googleapis.com/geolocation/v1/geolocate${params.googleApiKey ? '?key=' + params.googleApiKey : ''}`,
      json: requestBody,
    }

    httpreq.doRequest(options, (err, res) => {
      let data = res && res.body || ''
      let error = null
      let parsedData = null

      try {
        parsedData = JSON.parse(data)
        data = {
          provider: 'Google',
          latitude: parsedData.location.lat,
          longitude: parsedData.location.lng,
          accuracy: parsedData.accuracy
        }
      } catch (e) {
        error = new Error('Google: invalid response')
        error.error = e
      }

      if (err) {
        error = new Error('Google: request failed')
        error.error = err
      }

      if (parsedData && parsedData.error) {
        if (parsedData.error.errors) {
          error = new Error(`Google: ${parsedData.error.errors[0].domain}`)
        } else {
          error = new Error(`Google: api error`)
        }
        error.error = parsedData.error.errors
      }

      if (error) {
        error.statusCode = res && res.statusCode
        callback(error)
      } else {
        callback(null, data)
      }
    })
  },

  requestOpenCellId: (params, callback) => {
    let lacks = Geolocation360.lacksParams(params, 'openCellId')
    if (lacks) return callback(lacks)
    let requestBody = {
      token: params.openCellIdApiKey,
      cells: [{
        radio: params.radioType || defaults.radioType,
        cid: params.cid,
        lac: params.lac,
        mcc: params.mcc || defaults.mcc,
        mnc: params.mnc || defaults.mnc
      }],
      fallbacks: {
        lacf: 2
      }
    }

    let options = {
      timeout: params.timeout || defaults.timeout,
      method: 'POST',
      url: 'https://ap1.unwiredlabs.com/v2/process.php',
      json: requestBody,
    }

    httpreq.doRequest(options, (err, res) => {
      let data = res && res.body || ''
      let error = null
      let parsedData = null

      try {
        parsedData = JSON.parse(data)
        data = {
          provider: 'OpenCellId',
          latitude: parsedData.lat,
          longitude: parsedData.lon,
          accuracy: parsedData.accuracy
        }
      } catch (e) {
        error = new Error('OpenCellId: invalid response')
        error.error = e
      }

      if (err) {
        error = new Error('OpenCellId: request failed')
        error.error = err
      }

      if (parsedData && parsedData.status && parsedData.status == 'error') {
        if (parsedData.message) {
          error = new Error(`OpenCellId: ${parsedData.message}`)
        } else {
          error = new Error(`OpenCellId: api error`)
        }
        error.error = parsedData
      }

      if (error) {
        error.statusCode = res && res.statusCode
        callback(error)
      } else {
        callback(null, data)
      }
    })
  },

  request: (params, callback) => {
    let providers = []
    for (let key in params) {
      if (key.indexOf('ApiKey') > -1) {
        let s = key.replace('ApiKey', '')
        s = s[0].toUpperCase() + s.slice(1)
        if (!(providers.indexOf(s) > -1)) providers.push(s)
      }
    }
    for (let key in defaults) {
      if (key.indexOf('ApiKey') > -1) {
        let s = key.replace('ApiKey', '')
        s = s[0].toUpperCase() + s.slice(1)
        if (!(providers.indexOf(s) > -1)) providers.push(s)
      }
    }
    if (providers.length) {
      let count = providers.length
      Geolocation360.processRequest(params, providers, 0, [], callback)
    } else {
      callback(new Error('No api key provided.'))
    }
  },

  processRequest: (params, providers, index, errors, callback) => {
    Geolocation360[`request${providers[index]}`](params, (err, result) => {
      if (result) {
        callback(null, result)
      } else {
        errors.push(err)
        if (index + 1 == providers.length) {
          let error = new Error('No succesful return from providers')
          error.errors = errors
          callback(error)
        } else {
          index++
          Geolocation360.processRequest(params, providers, index, errors, callback)
        }
      }
    })
  }
}

module.exports = Geolocation360