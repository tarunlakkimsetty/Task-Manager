/**
 * Async Handler Wrapper
 * Wraps async route handlers to catch errors automatically
 * Eliminates need for try-catch in every route handler
 */

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = asyncHandler;
