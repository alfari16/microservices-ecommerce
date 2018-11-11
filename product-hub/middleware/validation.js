const joi = require('joi')

module.exports = {
  login: {
    Authorization: joi
      .string()
      .regex(/^Bearer.+/)
      .required()
  }
}
