/**
 * GET /
 */
var mongodb = require('mongodb').MongoClient
var url = require('url')
var urls

mongodb.connect(process.env.MONGODB, (err, db) => {
  if (err) {
    console.log('Unable to connect to the MongoDB server. Error: ', err)
    return
  }
  urls = db.collection('urls')
  console.log('connected to server *******')
  //db.close()
})

exports.index = (req, res) => {
  res.render('home', {
    title: 'Home'
  })
}

exports.shortenUrl = (req, res) => {
  let originalUrl = req.body.url // requested url
  let responseUrl = req.protocol + '://' + req.get('host') + req.originalUrl // responsed url
  let response = { title: 'Home', request: originalUrl, response: 'failed' }
  // verify the url

  // count the number of collections
  urls.count((err, num) => {
    if (err) throw err
    // insert new url into collection
    urls.insert({ id: ++num, url: originalUrl }, (err, result) => {
      if (err) { throw err }
      // update responseUrl
      responseUrl += num.toString()
      response.response = responseUrl

      // response
      res.render('home', response)
    })
  })


}

exports.redirect = (req, res) => {
  // urls.find({id: req.params.url}, (err, data) => {

  // })
}