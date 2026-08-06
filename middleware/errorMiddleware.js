// middleware/errorMiddleware.js

const notFound = (req, res) => {
  res.status(404).render("error", {
    title: "Page Not Found",
    statusCode: 404,
    message: `The page "${req.originalUrl}" doesn't exist.`,
    layout: "layout-public",
  });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).render("error", {
    title: "Something Went Wrong",
    statusCode,
    message: process.env.NODE_ENV === "production" ? "An unexpected error occurred." : err.message,
    layout: "layout-public",
  });
};

module.exports = { notFound, errorHandler };
