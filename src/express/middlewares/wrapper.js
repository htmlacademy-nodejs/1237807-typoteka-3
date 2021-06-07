'use strict';

const {WrapperType} = require(`../../const/view.const`);

module.exports = (req, res, next) => {

  if (WrapperType[req._parsedOriginalUrl.pathname]) {
    res.locals.wrapper = WrapperType[req._parsedOriginalUrl.pathname];
  }

  return next();
};
