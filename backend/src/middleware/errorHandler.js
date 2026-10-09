// Central error handler. Every error in the API ends up here and leaves
// in the same shape: { error: { message } }. Must be registered last.
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = status === 500 ? "Internal server error" : err.message;

  if (status === 500) console.error(err); // log real bugs, hide details

  res.status(status).json({ error: { message } });
}

module.exports = errorHandler;
