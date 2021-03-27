// Not being used in favor of 'express-async-errors'

module.exports = function (handler) {
  return async (req, res, next) => {
    try {
      await handler(req, res);
    } catch (e) {
      next(e);
    }
  };
};

// For async errors
// Name of function should be trycatch
