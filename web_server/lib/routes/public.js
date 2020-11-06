//  Copyright 2010-2020 Robert Bosch Car Multimedia GmbH
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

'use strict';

var _ = require('underscore');

var common = new (require('../common'))();

var cB = new (require('../db/chartsBase'))();
var sB = new (require('../db/selectBase'))();

module.exports = function(app){
   //
   // POST REQUESTS public
   //
   ////////////////////////////////////////////////////////////////
   //Get content endpoint
   app.get(/\/tml\/public\/.*/, function (req, res) {
      var start = new Date().getTime();
      
      console.log(req['url'] + "-->" + JSON.stringify(req['query']));
      //console.log(req['body']);
      
      var reqChart=req['path'].match("/([a-zA-Z0-9]+)$")[1];    
      
      switch(reqChart) {
      case "getPublicPersistData":
         console.log(" Processing: get < getPublicPersistData");
      
         var response = {};
      
         _.each(_.allKeys(req['query']),function(val){              
            response[val]=global.ndCache.get(req.sessionID + "." + val);
         });
      
         console.log(response);
      
         common.sendJsonResponse(res,response);  
         break;                                                
      default:
      
      }
      
      var end = new Date().getTime();
      var time = end - start;
      console.log("Execution finished after:",time);
   });

   app.post(/\/tml\/public\/.*/, function (req, res) {
      var start = new Date().getTime();
      
      console.log(req['url'] + "-->" + JSON.stringify(req['query']));
      //console.log(req['body']);
      
      var reqChart=req['path'].match("/([a-zA-Z0-9]+)$")[1];   
      
      switch(reqChart) {
      case "setPublicPersistData":  
         console.log(" Processing: post > setPublicPersistData");
         
         //console.log(req['body']);
         _.each(_.allKeys(req['body']),function(val){
                                                      global.ndCache.set(req.sessionID + "." + val,req['body'][val]); 
                                                    });  
         
         var response = { data : "OK"};
         common.sendJsonResponse(res,response);  
         break;
      default:
      
      }
      
      var end = new Date().getTime();
      var time = end - start;
      console.log("Execution finished after:",time);
   });
}