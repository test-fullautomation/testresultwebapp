'use strict';
const common = new (require('../../../common'))();
const ResourceService = require("../services/dbService");

const sampleRes = {
   "success": false,
   "message": "Internal server error",
   "data": {}
}
const prepareRes = (rows, error, req, resource, condition="") => {
   let return_code = 500;
   let response = { ...sampleRes };
   const actionMsg = {
      "POST": "create new",
      "GET" : "get",
      "DELETE": "delete",
      "PATCH": "update"
   }

   if (error) {
      if (error.code == "ER_DUP_ENTRY"){
         return_code = 409;
         response.message = `${resource}${condition} already exists`;
      }
   } else if (rows.constructor.name == "OkPacket") {
      if (rows.affectedRows > 0) {
         if (req.method == "POST"){
            return_code = 201;
            response.data = {'id': rows.insertId};
            response.success = true;
         } else {
            return_code = 200;
            response.success = true;
         }
         response.message = `${actionMsg[req.method]} ${resource}${condition} successfully`;
      } else {
         return_code = 405;
         response.message = `cannot ${actionMsg[req.method]} ${resource}${condition}`;
      }
   } else if (rows.length > 0) {
      return_code = 200;
      response.success = true;
      // request with param => response single row
      if (req.url.startsWith("/last")){
         response.message = `${actionMsg[req.method]} last ${resource} id successfully`;
         response.data = rows[0];
         // response.data = Object.values(rows[0])[0]
      }
      else if (Object.keys(req.params).length){
         response.message = `${actionMsg[req.method]} ${resource}${condition} successfully`;
         response.data = rows[0];
      } else {
         response.message = `${actionMsg[req.method]} all ${resource}s successfully`;
         response.data = rows;
      }
   } else {
      return_code = 404;
      response.message = `cannot find ${resource}${condition}`;
   }

   return [response, return_code];
}

const verifySchema = (resData, schema=null) =>{
   const response = { ...sampleRes };
   response.success = true;
   response.message = "request body is valid";

   if (schema != null){
      const { value, error } = schema.validate(resData);
      if (error) {
         response.success = false;
         response.message = error.details[0].message.replaceAll("\"", "'");
      }
      return [response, value];
   }

   return [response, resData];
}

function ResourceController(name, table, identifier, createSchema, updateSchema, querySchema=null){
   this.name = name;
   this.table = table;
   this.identifier = identifier;
   this.createSchema = createSchema;
   this.updateSchema = updateSchema;
   this.querySchema = querySchema;
   this.service = new ResourceService.DBService(this.name, this.table, this.identifier);
}
ResourceController.prototype.get = function(req, res){
   if (Object.keys(req.query).length > 0){
      this.getByQuery(req, res);
   } else {
      this.getAll(req, res);
   }
}
ResourceController.prototype.getAll = function(req, res){
   this.service.getAllResources(function(rows, error){
      const [objRes, returnCode] = prepareRes(rows, error, req, this.name);
      common.sendJsonResponse(res, objRes, returnCode);
   }.bind(this))
}
ResourceController.prototype.getByID = function(req, res){
   const condition = ` with ${this.identifier}=${req.params[this.identifier]}`;
   this.service.getResourceByID(req.params[this.identifier], function(rows, error) {
      const [objRes, returnCode] = prepareRes(rows, error, req, this.name, condition);
      common.sendJsonResponse(res, objRes, returnCode);
   }.bind(this))
}
ResourceController.prototype.getLast = function(req, res){
   const [response, value] = verifySchema(req.query, this.querySchema);
   if (!response.success) {
      common.sendJsonResponse(res, response, 400);
   } else {
      this.service.getLast(value, function(rows, error) {
         const [objRes, returnCode] = prepareRes(rows, error, req, this.name);
         common.sendJsonResponse(res, objRes, returnCode);
      }.bind(this))
   }
}
ResourceController.prototype.getByQuery = function(req, res){
   const [response, value] = verifySchema(req.query, this.querySchema);
   if (!response.success) {
      common.sendJsonResponse(res, response, 400);
   } else {
      this.service.getByReqQuery(req.query, function(rows, error) {
         const [objRes, returnCode] = prepareRes(rows, error, req, this.name);
         common.sendJsonResponse(res, objRes, returnCode);
      }.bind(this))
   }
}
ResourceController.prototype.create = function(req, res){
   const [response, value] = verifySchema(req.body, this.createSchema);
   if (!response.success) {
      common.sendJsonResponse(res, response, 400);
   } else {
      this.service.createResource(value, function(rows, error){
         const [objRes, returnCode] = prepareRes(rows, error, req, this.name);
         common.sendJsonResponse(res, objRes, returnCode);
      }.bind(this))
   }
}
ResourceController.prototype.updateByID = function(req, res){
   const [response, value] = verifySchema(req.body, this.updateSchema);
   if (!response.success) {
      common.sendJsonResponse(res, response, 400);
   } else {
      this.service.updateResourceByID(req.params[this.identifier], value, function(rows, error){
         const [objRes, returnCode] = prepareRes(rows, error, req, this.name);
         common.sendJsonResponse(res, objRes, returnCode);
      }.bind(this))
   }
}
ResourceController.prototype.deleteByID = function(req, res){
   this.service.deleteResourceByID(req.params[this.identifier], function(rows, error){
      const [objRes, returnCode] = prepareRes(rows, error, req, this.name);
      common.sendJsonResponse(res, objRes, returnCode);
   }.bind(this))
}
ResourceController.prototype.notImplementedMethod = (req, res) => {
   const notImplementedRes = { ...sampleRes };
   notImplementedRes['message'] = "The requested functionality is not implemented yet."
   common.prototype.sendJsonResponse(res, notImplementedRes, 501);
}

module.exports = ResourceController