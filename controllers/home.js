var mongodb = require('mongodb').MongoClient
var urls

mongodb.connect(process.env.MONGODB, (err, db) => {
  if (err) {
    console.log('Unable to connect to the MongoDB server. Error: ', err)
    return
  }
  urls = db.collection('urls')
  console.log('connected to server *******')
  // db.close()
})

exports.index = (req, res) => {
  res.render('home', {
    title: 'Home'
  })
}

exports.shortenUrl = (req, res) => {
  let originalUrl = req.body.url // requested url
  let resObject = { title: 'Home', request: originalUrl, response: 'failed' }
  let resUrl = req.protocol + '://' + req.get('host') + req.originalUrl // responsed url

  // verify the url
  if (!isValid(originalUrl)) {
    resObject.response = 'Please enter a fully valid url, with "https://"'
    res.render('home', resObject)
  }
  // count the number of collections
  urls.count((err, num) => {
    if (err) {
      resObject.response = 'Can not retreive data from database!'
      res.render('home', resObject)
    }
    // insert new url into collection
    urls.insert({ id: ++num, url: originalUrl }, (err, result) => {
      if (err) { throw err }
      // update responseUrl
      resUrl += num.toString()
      resObject.response = resUrl
    })
    // response
    res.render('home', resObject)
  })
}

function isValid (str) {
  var pattern = new RegExp('^(https?:\/\/)?' + // protocol
    '((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|' + // domain name
    '((\d{1,3}\.){3}\d{1,3}))' + // OR ip (v4) address
    '(\:\d+)?(\/[-a-z\d%_.~+]*)*' + // port and path
    '(\?[;&a-z\d%_.~+=-]*)?' + // query string
    '(\#[-a-z\d_]*)?$', 'i') // fragment locater
  if (!pattern.test(str)) {
    return false
  }
  return true
}

exports.redirect = (req, res) => {
  urls.find({ id: +req.params.id }).toArray((err, data) => {
    if (data)
      res.redirect(data[0].url)
  })
}
