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
var cBCCR = new (require('../db/chartsCCR'))();

module.exports = function(app){

   //
   //  GET REQUESTS
   //
   ////////////////////////////////////////////////////////////////
   app.get(/\/tml\/result\/base\/.*/, function (req, res) {
   	
   	//console.log(">>>>----------------------------------------------------------");
   	//console.log(req.session);
      //console.log(".");
      //console.log(req.cookies);
   	//console.log("----------------------------------------------------------<<<<");
   	
   	var start = new Date().getTime();
       	  	
      console.log(req['url'] + "-->" + JSON.stringify(req['query']));
     
      var reqChart=req['path'].match("/([a-zA-Z0-9]+)$")[1];
      
      switch(reqChart) {
      case "getAbortStatus":
         console.log(" Processing: get < getAbortStatus");
         cB.getAbortStatus(req['query'], req, res);
         break;            
      case "chartFailsOverTime":
         console.log(" Processing: get < chartFailsOverTime");
         cB.chartFailsOverTime(req['query'], req, res);
         break;
	   case "chartCCRBarsAllResults":
         console.log(" Processing: get < chartCCRBarsAllResults");
      	cBCCR.chartCCRBarsAllResults(req['query'], req, res);
         break;
      case "chartBarsAllResults":
      	console.log(" Processing: get < chartBarsAllResults");
      	cB.chartBarsAllResults(req['query'], req, res);
         break;
      case "chartTestsPerComponentFlow":
         console.log(" Processing: get < chartTestsPerComponentFlow");
         cB.chartTestsPerComponentFlow(req['query'], req, res);
         break;         
      case "chartResetVsComponentLine":
         console.log(" Processing: get < chartResetVsComponentLine");
         cB.chartResetVsComponentLine(req['query'], req, res);
         break;         
      case "chartDoughnutResult":
      	console.log(" Processing: get < chartDoughnutResult");
      	cB.chartDoughnutResult(req['query'], res);
      	break;
      case "chartRadarFailedUnknownPerComponent":
      	console.log(" Processing: get < chartRadarFailedUnknownPerComponent");
      	cB.chartRadarFailedUnknownPerComponent(req['query'], res);
      	break; 	
      case "chartNotAnalyzedIssues":
         console.log(" Processing: get < chartNotAnalyzedIssues");
         cB.chartNotAnalyzedIssues(req['query'], res);
         break;  	
      case "chartRuntime":
         console.log(" Processing: get < chartRuntime");
         cB.chartRuntime(req['query'], res);
         break;         
      case "getExecutionTime":
      	console.log(" Processing: get < getExecutionTime");
      	cB.getExecutionTime(req['query'], res);
      	break;  
      case "getMetaData":
         console.log(" Processing: get < getMetaData");
         cB.getMetaData(req['query'], res);
         break;
      case "getSummerInterpretation":
      	console.log(" Processing: get < getSummerInterpretation");
      	cB.getSummerInterpretation(req['query'], res);
      	break;
      case "getTestResultDataTable":
         console.log(" Processing: get < getTestResultDataTable");
         cB.getTestResultDataTable(req['query'], res);
         break; 
      case "getDataTableFilterBadgeContent":
         console.log(" Processing: get < getDataTableFilterBadgeContent");
         cB.getDataTableFilterBadgeContent(req['query'], res);
         break; 
      case "getLastLog":
         console.log(" Processing: get < getLastLog");
         cB.getLastLog(req['query'], res);
         break;    
      case "getTestCaseComments":
         console.log(" Processing: get < getTestCaseComments");
         cB.getTestCaseComments(req['query'], req, res);
         break; 
      case "getIssueLinks":
         console.log(" Processing: get < getIssueLinks");
         cB.getIssueLinks(req['query'], req, res);
         break; 
      case "getTags":
         console.log(" Processing: get < getTags");
         cB.getTags(req['query'], req, res);
         break; 
      case "getDistinctTagList":
         console.log(" Processing: get < getDistinctTagList");
         cB.getDistinctTagList(req['query'], req, res);
         break;
      case "getHistory":
         console.log(" Processing: get < getHistory");
         cB.getHistory(req['query'], req, res);
         break;   
      case "getTestSuiteState":
         console.log(" Processing: get < getTestSuiteState");
         cB.getTestSuiteState(req['query'], req, res);
         break; 
      case "getQualityGate":
         console.log(" Processing: get < getQualityGate");
         cB.getQualityGate(req['query'], req, res);
         break; 
      case "getTMLHeader":
         console.log(" Processing: get < getTMLHeader");
         cB.getTMLHeader(req['query'], req, res);
      break;  
      case "getTestCaseStabilityByTestName":
         console.log(" Processing: get < getTestCaseStabilityByTestName");
         cB.getTestCaseStabilityByTestName(req['query'], req, res);
      break;  
      case "getTestCaseStabilityFlowByTestName":
         console.log(" Processing: get < getTestCaseStabilityFlowByTestName");
         cB.getTestCaseStabilityFlowByTestName(req['query'], req, res);
      break; 
      case "selectBranch":
      	console.log(" Processing: get < selectBranch");
      	sB.selectBranch(req['query'], req, res);
         break;
      case "selectProjectVariant":
      	console.log(" Processing: get < selectProjectVariant");
      	sB.selectProjectVariant(req['query'], req, res);
         break;    
      case "selectVersion":
      	console.log(" Processing: get < selectVersion");
      	sB.selectVersion(req['query'], req, res);
         break; 
      case "selectComponent":
      	console.log(" Processing: get < selectComponent");
      	sB.selectComponent(req['query'], req, res);
      	break;         
      case "updateNav":
         console.log(" Processing: get < updateNav");
         sB.updateNav(req['query'], req, res);
         break; 
      case "getTestSuiteRelationship":
         console.log(" Processing: get < getTestSuiteRelationship");
         cB.getTestSuiteRelationship(req['query'], req, res);
         break;   	
      case "getDiffExecutionResults":
         console.log(" Processing: get < getDiffExecutionResults");
         cB.getDiffExecutionResults(req['query'], req, res);
         break;   	
      case "getReanimationStatus":
         console.log(" Processing: get < getReanimationStatus");
         cB.getReanimationStatus(req['query'], req, res);
         break;
      default:
          
      } 
     
   	var end = new Date().getTime();
   	var time = end - start;
   	console.log("Execution finished after:",time);
   
          
   }); // app.get('/base/abc')
}