export const appRequestInterceptor = (error, req, res, next) => {
  console.log("Request Interceptor: ", req.method, req.url);
  console.log("Request Body: ", req.body);
  console.log("Request Headers: ", req.headers);
  next(error);
}