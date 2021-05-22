'use strict';

const {WrapperType} = require(`../../const`);

module.exports = (req, res, next) => {
  console.log(req._parsedOriginalUrl.pathname);

  if (WrapperType[req._parsedOriginalUrl.pathname]) {
    res.locals.wrapper = WrapperType[req._parsedOriginalUrl.pathname];
  }

  return next();
};
