'use strict';
const common = new (require('../../../common'))();
const DBService = require("../services/dbService");

const sampleRes = {
   "success": false,
   "message": "Internal server error",
   "data": {}
}

function callEvtblResults(req, res){
   const objRes = { ...sampleRes };
   DBService.callRoutine('update_evtbls', function(rows, err){
      let returnCode = 400;
      if (err) {
         objRes.message = err;
      } else {
         returnCode = 201;
         objRes.success = true;
         objRes.message = "call update_evtbls() successfully";
         objRes.data = rows;
      }
      common.sendJsonResponse(res, objRes, returnCode);
   })
}

function callEvtblResult(req, res){
   const objRes = { ...sampleRes };
   DBService.callRoutine('update_evtbl', function(rows, err){
      let returnCode = 400;
      if (err) {
         objRes.message = err.message;
      } else {
         returnCode = 200;
         objRes.success = true;
         objRes.message = `call update_evtbl(${req.params['test_result_id']}) successfully`;
         objRes.data = rows;
      }
      common.sendJsonResponse(res, objRes, returnCode);
   }, [req.params['test_result_id']])
}

module.exports = {
   callEvtblResults,
   callEvtblResult
}