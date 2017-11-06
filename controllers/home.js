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
  if (!isUrlValid(originalUrl)) {
    resObject.response = 'Please enter a fully valid url, with "https://"'
    res.render('home', resObject)
    return
  }
  // count the number of collections
  urls.count((err, num) => {
    if (err) {
      // can not get data
      resObject.response = 'Can not retreive data from database!'
      res.render('home', resObject)
      return
    }
    // insert new url into collection
    urls.insert({ id: ++num, url: originalUrl }, (err, result) => {
      if (err) {
        console.log(err)
        resObject.response = 'Can not insert new document into database!'
      } else {
        // update responseUrl
        resUrl += num.toString()
        resObject.response = resUrl
      }
      // response
      res.render('home', resObject)
    })
  })
}

function isUrlValid (str) {
  // credits: https://stackoverflow.com/a/45567717/5706403

  let pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?' + // port
    '(\\/[-a-z\\d%@_.~+&:]*)*' + // path
    '(\\?[;&a-z\\d%@_.,~+&:=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i') // fragment locator
  return pattern.test(str)
}

exports.redirect = (req, res) => {
  urls.find({ id: +req.params.id }).toArray((err, data) => {
    if (err) {
      throw err
    }
    if (data.length > 0) { res.redirect(data[0].url) }
  })
}
