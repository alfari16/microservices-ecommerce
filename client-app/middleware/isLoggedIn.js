module.exports = (req, res, next) => {
  if (res.locals.userId) return next()
  res.redirect('/login')
}