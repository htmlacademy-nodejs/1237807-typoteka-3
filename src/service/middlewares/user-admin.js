'use strict';

const {HttpCode} = require(`../../const/server.const`);

module.exports = (logger) => (req, res, next) => {

  const {isAdmin} = req.query;

  if (!isAdmin) {
    res.status(HttpCode.FORBIDDEN).send(`You are not allowed to perform this action`);
    return logger.error(`User is not admin`);
  }

  return next();
};
