const logger = require('./logger')
const jwt = require('jsonwebtoken')
const User = require('../models/user')

const requestLogger = (request, response, next) => {
    logger.info('Method:', request.method)
    logger.info('Path:  ', request.path)
    logger.info('Body:  ', request.body)
    logger.info('---')
    next()
}

const getTokenFrom = (request, response, next) => {
    const authorization = request.get('authorization')
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.replace('Bearer ', '')
      request.token = token
    }
    else{
        request = {...request, token: null}
    }
    next()
  }

const userExtractor = async (request, response, next) => {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    console.log(decodedToken)
  if(!decodedToken.id){
    return response.status(401).json({ error: 'token invalid'})
  }

  request.user = await User.findById(decodedToken.id)
  console.log(request.user)
  next()
}

const errorHandler = (error, request, response, next) => {
    logger.error(error.message)

    if(error.name == 'ValidationError') {
        return response.status(400).json({error: error.message})
    } else if (error.name ===  'JsonWebTokenError') {
        return response.status(400).json({ error: error.message })
    }
    next(error)
}

module.exports = {
    userExtractor,
    getTokenFrom,
    requestLogger,
    errorHandler
}