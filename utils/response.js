const sendResponse = async (res, status, message, data = null) => {
  return  await res.status(status).send({
    status,
    message,
    data,
  });
};

const isBadRequestError = (error) => {
  return (
    error?.name === "ValidationError" ||
    error?.name === "CastError" ||
    error?.code === 11000
  );
};

module.exports = { sendResponse, isBadRequestError };
