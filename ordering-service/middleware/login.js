require('dotenv').config()
const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
  try {
    const verify = jwt.verify(
      req.headers.authorization.split(' ')[1],
      process.env.SECRET
    )
    console.log(verify)
    if (!verify)
      return res.status(401).json({
        errorMsg: 'Not authenticated',
        isError: true
      })
    req.stateId = verify.id
    next()
  } catch (err) {
    console.error(err)
    res.status(401).json({ errorMsg: 'Not authenticated', isError: true })
  }
}
