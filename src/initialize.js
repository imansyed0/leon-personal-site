import StoreJson from './models/StoreJson'
import StoreJsonReadOnly from './models/StoreJsonReadOnly'
import fetchers from './lib/Fetcher'
import Controller from './lib/Controller'
import R from 'ramda'

const isntNull = n => n !== null
const filterNull = ls => R.filter(isntNull, ls)
const flattenfilterNull = ls => filterNull(R.flatten(ls))
let themFetchers

let config
try {
  config = require('./local.config.js').default
} catch (_) {
  config = require('./config.js').default
}

// Determine if we're running in a serverless environment (Vercel)
const isServerless = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME

export default callback => {
  // Use read-only storage in serverless environments
  const Storage = isServerless ? StoreJsonReadOnly : StoreJson
  
  return Promise.resolve().then(() => {
    return Object.keys(config).map(fType => {
      // skip config attrs that don't have corresponding fetchers
      if (!(fType in fetchers)) return null
      const FFetcher = fetchers[fType]
      return config[fType].map(sheet => {
        const otherArgs = { ...sheet }
        delete otherArgs.name
        delete otherArgs.tabs
        return {
          name: sheet.name,
          fetcher: new FFetcher(new Storage(), sheet.name, sheet.tabs, ...Object.values(otherArgs))
        }
      })
    })
  })
    .then(res => {
      themFetchers = flattenfilterNull(res)
    })
    .then(() => Promise.all(themFetchers.map(f => f.fetcher.authenticate(process.env))))
    .then(fetchers => {
      const config = R.zipObj(themFetchers.map(f => f.name), fetchers)
      const controller = new Controller(config)
      callback(controller)
    })
    .catch(err => {
      console.log(err)
      console.log(
        `ERROR: the server couldn't connect to all of the sheets you provided. Ensure you have granted access to ${
          process.env.SERVICE_ACCOUNT_EMAIL
        } on ALL listed sheets.`
      )
    })
}
