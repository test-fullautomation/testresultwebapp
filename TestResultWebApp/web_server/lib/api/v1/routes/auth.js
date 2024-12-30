const common = new (require('../../../common'))();

module.exports = function Auth(req, res, next) {
   // return next();
   if (req.session && req.session.admin){
     return next();
   } else { 
      console.log("not_authorized");
      const response = {
         "success": false,
         "message": "authentication is required",
         "data": {}
      };
      common.sendJsonResponse(res, response, 401);  
   };
};