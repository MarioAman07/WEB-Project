// middleware/auth.js (Новый файл)
module.exports = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).send('Unauthorized: Please log in');
  }
  next();
};