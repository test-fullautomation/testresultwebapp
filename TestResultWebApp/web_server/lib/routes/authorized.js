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

var global = require('../global');
var common = new (require('../common'))();
var history = new (require('../history'))();

var cB = new (require('../db/chartsBase'))();
var sB = new (require('../db/selectBase'))();

module.exports = function(app){
  
   //Authentication and Authorization Middleware
   var auth = function(req, res, next) {
     if (req.session && req.session.admin){
       return next();
     } else { 
        console.log("not_authorized");
        var response = { data : "not_authorized"};
     
        common.sendJsonResponse(res,response);  
     };
   };
   
   // Get content endpoint
   app.get(/\/tml\/auth\/.*/, auth, function (req, res) {
      var start = new Date().getTime();
      
      console.log(req['url'] + "-->" + JSON.stringify(req['query']));
      //console.log(req['body']);
       
      var reqChart=req['path'].match("/([a-zA-Z0-9]+)$")[1];   
       
      switch(reqChart) {

      default:
         
      }
       
      var end = new Date().getTime();
      var time = end - start;
      console.log("Execution finished after:",time);
   });
   
   //
   // POST REQUESTS only allowed after login
   //
   ////////////////////////////////////////////////////////////////
   app.post(/\/tml\/auth\/.*/, auth, function (req, res) {
      var start = new Date().getTime();
      
      //console.log(req['body']);
      
      var reqChart=req['path'].match("/([a-zA-Z0-9]+)$")[1];  
        
      switch(reqChart) {
      case "setIssueStatus":
         console.log(req['url'] + "-->" + JSON.stringify(req['body']));
         console.log(" Processing: post > setIssueStatus"); 
         
         cB.setIssueStatus(req['body'], req, res);
         cB.logHistory( req['body']['lastlogid'].trim(),
                        history.enHistoryClass.issueStatusChange,
                        req['body']['action'], 
                        req['body'],
                        req,
                        history.enHistorySource.test_case);
         break;
      case "summerInterpretation":
         console.log(req['url'] + "-->" + JSON.stringify(req['body']['version']+ " " + req['body']['data'].length));  
         console.log(" Processing: post > summerInterpretation");
         
         cB.postSummerInterpretation(req['body'], res);  
         cB.logHistory( req['body']['version'].trim(),
                        history.enHistoryClass.interpretationChange,
                        req['body']['action'], 
                        req['body'],
                        req,
                        history.enHistorySource.test_suite);
         break;
      case "postTestCaseComment":
         console.log(req['url'] + "-->" + JSON.stringify(req['body']['testcaseid'] + " " + req['body']['number']+ " " + req['body']['comment'].length));  
         console.log(" Processing: post > postTestCaseComment");
         
         cB.postTestCaseComment(req['body'], req, res); 
         cB.logHistory( req['body']['testcaseid'].trim(),
                        history.enHistoryClass.issueCommentChange,
                        req['body']['action'], 
                        req['body'],
                        req,
                        history.enHistorySource.test_case);
         break; 
      case "postDeleteTestCaseComment":
         console.log(req['url'] + "-->" + JSON.stringify(req['body']));
         console.log(" Processing: post > postDeleteTestCaseComment");
         
         cB.postDeleteTestCaseComment(req['body'], req, res);
         cB.logHistory( req['body']['testcaseid'].trim(),
                        history.enHistoryClass.issueCommentChange,
                        req['body']['action'], 
                        req['body'],
                        req,
                        history.enHistorySource.test_case);
         break; 
      case "postIssueLink":
         console.log(req['url'] + "-->" + JSON.stringify(req['body']));
         console.log(" Processing: post > postIssueLink");
         
         cB.postIssueLink(req['body'], req, res); 
         cB.logHistory( req['body']['testcaseid'].trim(),
                        history.enHistoryClass.issueLinkChange,
                        req['body']['action'], 
                        req['body'],
                        req,
                        history.enHistorySource.test_case);
         break;  
      case "postDeleteIssueLink":
         console.log(req['url'] + "-->" + JSON.stringify(req['body']));
         console.log(" Processing: post > postDeleteIssueLink");
         
         cB.postDeleteIssueLink(req['body'], req, res); 
         cB.logHistory( req['body']['testcaseid'].trim(),
                        history.enHistoryClass.issueLinkChange,
                        req['body']['action'], 
                        req['body'],
                        req,
                        history.enHistorySource.test_case);
         break; 
         
      case "postTags":
         console.log(req['url'] + "-->" + JSON.stringify(req['body']));
         console.log(" Processing: post > postTags");
         
         cB.postTags(req['body'], req, res);
         cB.logHistory(  req['body']['version'].trim(),
                         history.enHistoryClass.tagChange,
                         req['body']['action'], 
                         req['body'],
                         req,
                         history.enHistorySource.test_suite);
         break;
         
      case "postTestSuiteState":
         console.log(req['url'] + "-->" + JSON.stringify(req['body']));
         console.log(" Processing: post > postTestSuiteState");
         
         cB.postTestSuiteState(req['body'], req, res);
         cB.logHistory(  req['body']['version'].trim(),
                         history.enHistoryClass.testSuiteStateChange,
                         req['body']['action'], 
                         req['body'],
                         req,
                         history.enHistorySource.test_suite);
         break;
                
      case "setAuthPersistData":   
         console.log(req['url'] + "-->" + JSON.stringify(req['body']));
         console.log(" Processing: post > setAuthPersistData");
         
         //console.log(req['body']);
         _.each(_.allKeys(req['body']),function(val){
                                                  req.session[val]=req['body'][val];
                                                  })  
         common.sessUpdate(req);
         var response = { data : "persisted_ok"};
         common.sendJsonResponse(res,response); 
      default:
      
      }
      
      var end = new Date().getTime();
      var time = end - start;
      console.log("Execution finished after:",time);
   });

}