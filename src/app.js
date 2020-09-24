require('dotenv').config()
const MOVIES = require('./movie-data.json')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const helmet = require('helmet')
const { NODE_ENV } = require('./config')


const app = express()

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption))
app.use(helmet())
app.use(cors())

app.use(authorization)

app.use(function authorization(req, res, next){
  const apiToken = process.env.API_TOKEN
  console.log("Hello api Key", apiToken)
  const userToken = req.get('Authorization').split(' ')[1]
  
  if(!userToken || userToken !== apiToken){
    return res.status(401).json({ error: 'Unauthorized request' })
  }

  next()
  
})

app.get('/movie', (req, res) => {
  let response = MOVIES;

  if(req.query.genre){
    response = response.filter(movie => movie.genre.toLowerCase().includes(req.query.genre.toLowerCase()))
  }

  if(req.query.country){
    response = response.filter(movie => movie.country.toLowerCase().includes(req.query.country.toLowerCase()))
  }

  if(req.query.avg_vote){
    response = response.filter(movie => Number(movie.avg_vote) >= Number(req.query.avg_vote))
  }

  res.status(200);
  res.json(response);
})

app.use(function errorHandler( error, req, res, next ) {
  let response
  if( NODE_ENV === 'production' ){
    response = { error: { message: 'server error' } }
  }else {
    console.error(error)
    response = { message: error.message, error }
  }res.status(500).json(response)
})

module.exports = app