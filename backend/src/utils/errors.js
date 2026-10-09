// Small helpers for throwing HTTP errors from controllers.
// Express 5 passes errors thrown in async handlers to the error middleware.
function fail(status, message) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

module.exports = { fail };
