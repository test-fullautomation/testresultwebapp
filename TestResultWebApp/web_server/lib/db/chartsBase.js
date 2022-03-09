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

var pooledCon = require('../communication/mysqlPool');
var global = require('../global');
var common = new (require('../common'))();
var history = new (require('../history'))();
var moment = require('moment');

var _ = require('underscore');

module.exports = chartsBase;

function chartsBase(){
	
};

chartsBase.prototype.getAbortStatus = function getAbortStatus (query, req, res){
   
    pooledCon()
     .then(function(con) {
        var sql="SELECT abort_reason, msg_detail FROM " + global.mySQLOptions.database +  ".tbl_abort where test_result_id='" + query['version'] + "'";
        
        // This query return the abort reason of execution if it has been aborted
        // console.log(sql)
        
        con.query(sql, function(err,rows){
            var response={ 'aborted': false,
                           'reason' : "",
                           'message': ""};
            if (rows.length>0){
                response['aborted'] = true;
                response['reason']  = rows[0]['abort_reason'];
                response['message'] = JSON.parse(rows[0]['msg_detail']);
            }
            common.sendJsonResponse(res,response);         
        }); // con.query
        
        con.release();
      
     }, // pooledCon().then.function(con)
     function(err) {
        console.error("Error 001:",err);
     } // pooledCon().then.function(err);
     ); //pooledCon.then 
    
    
};

chartsBase.prototype.chartFailsOverTime = function chartFailsOverTime (query, req, res){
   
   pooledCon()
      .then(function(con) {
         var sCmptQueryFilter = '';
         if ((query['component']!=undefined) && (query['component'].trim()!="All Components")){
            sCmptQueryFilter = " AND t1.component='"+common.mapToLongComponentNames(query['component'].trim())+"'";
         }       
         var sql="SELECT t1.component, t1.name, DATE_FORMAT(t1.time_start,'%Y-%m-%dT%H:%i:%sZ') AS time, t1.result_main " + 
                  ", DATE_FORMAT(t2.time_end,'%Y-%m-%dT%H:%i:%sZ') AS end_time " + 
                  "FROM " + global.mySQLOptions.database +  ".tbl_case AS t1 " +
                  "JOIN " + global.mySQLOptions.database +  ".tbl_file AS t2 ON t1.file_id=t2.file_id " +
                  "WHERE t1.test_result_id='" + query['version'].trim() + "'" + //"' and result_main!='Passed' " + 
                  sCmptQueryFilter + " ORDER BY t1.time_start";
       
         // This query calculates also the run_time of a single test, but it is quite slow
         // Better solution is to calculate the difference in the browser on the fly... time[i+1] - time[i]
         //
         /*var sql="SELECT component, " +
                  "       name, " +
                  "       DATE_FORMAT(t1.time_start,'%Y-%m-%dT%H:%i:%sZ') as time, " + 
                  "       TIMESTAMPDIFF(SECOND, " +
                  "          t1.time_start, " +
                  "          (select min(time_start) from " + global.mySQLOptions.database +  ".tbl_case as t2 " +
                  "               where test_result_id='" + query['version'].trim() +  "' and t2.time_start>t1.time_start) " +
                  "       )  / 60 as run_time, " +
                  "       result_main " +
                  "FROM " + global.mySQLOptions.database +  ".tbl_case as t1 " +
                  "   where test_result_id='" + query['version'].trim() +  "' order by t1.time_start" */
         
         // console.log(sql)
       
         con.query(sql, 
                  function(err,rows){
         
               var response={ 'data'   : [],
                              'domain' : [] };
               
               // check length of rows before parsing into reponse to avoid server error
               if (rows.length>0){
                  response['domain'].push(rows[0].time)
                  response['domain'].push(rows[rows.length-1].time)
                  
                  rows.forEach(function(item){
                  
                     if (item.result_main!="__undefined__"){
                        var dataSet={ 'component' : common.mapToShortComponentNames(item.component),
                                    'name'      : item.name,
                                    'time'      : item.time,
                                    'end_time'  : item.end_time,
                                    'result_main' : item.result_main};

                        response['data'].push(dataSet);
                     }
                  });
               }
               
               common.sendJsonResponse(res,response);         
         }); // con.query
         
         con.release();
     
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
   
   
};

chartsBase.prototype.chartBarsAllResults = function chartBarsAllResults (query, req, res){	
	 var startDate = moment().subtract(89, 'days').format("DD.MM.YYYY");
    var endDate = moment().format("DD.MM.YYYY");

	//if (req.session.dpTRFReportRange){
    //   startDate=req.session.dpTRFReportRange.startDate;
    //   endDate=req.session.dpTRFReportRange.endDate;  
	//}
    var  dpTRFReportRange = global.ndCache.get(req.sessionID + ".dpTRFReportRange");
    if (dpTRFReportRange){
    	startDate = dpTRFReportRange['startDate'];
      endDate   = dpTRFReportRange['endDate'];
    		
    }
    
	pooledCon()
      .then(function(con) {       
         var sql="select t1.version_sw_target, pt_passed, pt_failed, pt_unknown, pt_aborted, num_resets from " + global.mySQLOptions.database +  ".evtbl_result_main as t1 " +
               "join " + global.mySQLOptions.database +  ".tbl_result as t2 on (t1.test_result_id=t2.test_result_id) " +
               "where t1.tbl_prj_project='"+ query['project'].trim() +"' and t1.tbl_prj_branch='"+ query['branch'].trim() +"' and " +
               "t2.result_state not in ('test died','test build','new report','in progress') and " +
               "t1.version_sw_target not like '%_S' and t1.version_sw_target not like '%_R' and " + 
               "t1.time_start BETWEEN STR_TO_DATE('" + startDate + "','%d.%m.%Y') AND DATE_ADD(STR_TO_DATE('" + endDate + "','%d.%m.%Y'), INTERVAL 1 DAY) "  +
               "order by t1.time_start";
         if ((query['component']!=undefined) && (query['component'].trim()!="All Components")){
            sql="select t1.version_sw_target, t2.num_passed, t2.num_failed, t2.num_unknown, t2.num_aborted, t2.num_resets from " + global.mySQLOptions.database +  ".tbl_result as t1 " +
                  "join " + global.mySQLOptions.database +  ".evtbl_failed_unknown_per_component as t2 on (t1.test_result_id=t2.test_result_id) " +
                  "where t1.project='"+ query['project'].trim() +"' and t1.branch='"+ query['branch'].trim() +"' and " +
                  "t1.result_state not in ('test died','test build','new report','in progress') and " +
                  "t1.version_sw_target not like '%_S' and t1.version_sw_target not like '%_R' and " + 
                  "t1.time_start BETWEEN STR_TO_DATE('" + startDate + "','%d.%m.%Y') AND DATE_ADD(STR_TO_DATE('" + endDate + "','%d.%m.%Y'), INTERVAL 1 DAY) "  +
                  "AND t2.component='"+common.mapToLongComponentNames(query['component'].trim())+"' "+
                  "order by t1.time_start";    
         }
         // console.log(sql);
      
         con.query(sql, function(err,rows){
      
            //console.log(rows);   
            var response= { labels     : [], 
                        pt_passed  : [],
                        pt_failed  : [],
                        pt_unknown : [],
                        pt_aborted : [],
                        num_resets : []
                        };
            if ((query['component']!=undefined) && (query['component'].trim()!="All Components")){
               for (var data in rows){
                  var item=rows[data];
                  response["num_resets"].push(item["num_resets"]);
                  // \\d+__\\d+ matches to the default version information if not different provided
                  // the TML Framework uses a timestamp with year,month,day__time
                  response["labels"].push(item["version_sw_target"].match("\\d+\\.\\d[FS]\\d+.*|\\d+__\\d+"));

                  // calculate result percentage for component base on result test counter
                  // percentage round to 1 digit after comma
                  var iTestSum = item["num_passed"] + item["num_failed"] + item["num_unknown"] + item["num_aborted"];
                  response["pt_failed"].push(Math.round(item["num_failed"]*1000/iTestSum)/10);
                  response["pt_unknown"].push(Math.round(item["num_unknown"]*1000/iTestSum)/10);
                  response["pt_aborted"].push(Math.round(item["num_aborted"]*1000/iTestSum)/10);
                  response["pt_passed"].push(Math.round(item["num_passed"]*1000/iTestSum)/10);
               } //for data in rows
            } else {
               for (var data in rows){
                  var item=rows[data];
                  // \\d+__\\d+ matches to the default version information if not different provided
                  // the TML Framework uses a timestamp with year,month,day__time
                  response["labels"].push(item["version_sw_target"].match("\\d+\\.\\d[FS]\\d+.*|\\d+__\\d+"));
                  
                  response["pt_failed"].push(item["pt_failed"]*100);
                  response["pt_unknown"].push(item["pt_unknown"]*100);
                  response["pt_aborted"].push(item["pt_aborted"]*100);
                  response["pt_passed"].push(100-(item["pt_failed"]*100)-
                                             (item["pt_unknown"]*100)-
                                             (item["pt_aborted"]*100));
                  response["num_resets"].push(item["num_resets"]);
               } //for data in rows
         
            //console.log(response);
            }
            common.sendJsonResponse(res,response);		   
         }); // con.query
         
         con.release();
      
      }, // pooledCon().then.function(con)
      function(err) {
         console.error("Error 001:",err);
      } // pooledCon().then.function(err);
      ); //pooledCon.then 
	
	
};

chartsBase.prototype.chartTestsPerComponentFlow = function chartTestsPerComponentFlow (query, req, res){   
   var startDate = moment().subtract(89, 'days').format("DD.MM.YYYY");
   var endDate = moment().format("DD.MM.YYYY");

  //if (req.session.dpTRFReportRange){
   //   startDate=req.session.dpTRFReportRange.startDate;
   //   endDate=req.session.dpTRFReportRange.endDate;  
  //}
   var  dpTRFReportRange = global.ndCache.get(req.sessionID + ".dpTRFReportRange");
   if (dpTRFReportRange){
     startDate = dpTRFReportRange['startDate'];
     endDate   = dpTRFReportRange['endDate'];
        
   }
   
  pooledCon()
   .then(function(con) {
      var sCmptQueryFilter = '';
      if ((query['component']!=undefined) && (query['component'].trim()!="All Components")){
         sCmptQueryFilter = " AND t3.component='"+common.mapToLongComponentNames(query['component'].trim())+"'";
      }     
      var sql="select t1.version_sw_target, t3.component, t3.num_passed + t3.num_failed + t3.num_unknown + t3.num_aborted as numberOfTests from " + global.mySQLOptions.database +  ".evtbl_result_main as t1 " +
              "join " + global.mySQLOptions.database +  ".tbl_result as t2 on (t1.test_result_id=t2.test_result_id) " +
              "join " + global.mySQLOptions.database +  ".evtbl_failed_unknown_per_component as t3 on (t1.test_result_id=t3.test_result_id) " +
              "where t1.tbl_prj_project='"+ query['project'].trim() +"' and t1.tbl_prj_branch='"+ query['branch'].trim() +"' and " +
              "t2.result_state not in ('test died','test build','new report','in progress') and " +
              "t1.version_sw_target not like '%_S' and t1.version_sw_target not like '%_R' and " + 
              "t1.time_start BETWEEN STR_TO_DATE('" + startDate + "','%d.%m.%Y') AND DATE_ADD(STR_TO_DATE('" + endDate + "','%d.%m.%Y'), INTERVAL 1 DAY)"  +
              sCmptQueryFilter + "order by t1.time_start, component"
      
      //console.log(sql);
     
      con.query(sql, 
                function(err,rows){
      
            //console.log(rows); 
            
            //prepare resonse data structure
            var response= { 'labels'     : [],
                            'label'      : [],
                            'data'       : []
                         };
            
            // Data need to be sent like this data structure
            // Therefore do some formatting...
            //
            //var inData={ 'labels' : ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
            //      'label'  : ['MPLAY', 'Tuner', 'Phone' , 'LCM'],
            //      'data' : [ [26, 36, 0, 38, 40, 30, 12] ,
            //                 [34, 44, 0, 24, 25, 28, 25] ,
            //                 [16, 13, 10, 33, 40, 33, 45] ,
            //                 [5, 9, 0, 9, 18, 19, 20]
            //      ]}
            
            var sVersion='';
            var sLabel='';
            var arData=[];
            var dCollector={}
            for (var data in rows)
            {
              var item=rows[data];
              
              //first finally search version numbers
              if (sVersion!=item['version_sw_target']){
                 sVersion=item['version_sw_target'];
                 response['labels'].push(sVersion);
              }
              
              //second finally search unique component names
              var sComponent=common.mapToShortComponentNames(item['component']);
              if (response['label'].indexOf(sComponent)<0){
                 if (sComponent.trim().length>0){
                    response['label'].push(sComponent);
                 }
              }
              
              //third prepare hash version_target.component.numberOfTests
              if (dCollector[item['version_sw_target']]==undefined){
                  dCollector[item['version_sw_target']]={};
              }
              dCollector[item['version_sw_target']][sComponent]=item['numberOfTests'];
              
            } //for data in rows
            
            //Now use collected data of dCollector and create data arrays fitting
            //to the comnponent names per version
            //if version doesn't have component, then use 0 tests.
            _.each(response['labels'],function(version_sw_target){
               for (var i=0; i<response['label'].length; i++){
                  var numOfTests=0;
                  if (dCollector[version_sw_target][response['label'][i]]!=undefined){
                     numOfTests=dCollector[version_sw_target][response['label'][i]];
                  }
                  if (response['data'][i]==undefined){
                     response['data'][i]=[];
                  }
                  response['data'][i].push(numOfTests)
               }
                
            })
            
            //make software version info short
            for (var i=0; i<response['labels'].length; i++){
               response['labels'][i]=response['labels'][i].match("\\d+\\.\\d[FS]\\d+.*|\\d+__\\d+");
            }
            
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
  
  
};

chartsBase.prototype.chartDoughnutResult = function chartDoughnutResult (query, res){
	
	//console.log(query);
	
	pooledCon()
      .then(function(con) {
         var sql = "SELECT num_passed,num_failed,num_unknown,num_aborted FROM " + global.mySQLOptions.database +  ".evtbl_result_main WHERE " +
         "tbl_prj_project='" + query['project'].trim() + "' AND " + 
         "tbl_prj_branch='" + query['branch'].trim() + "' AND " +
         "test_result_id='" + query['version'].trim() +"'";
         if ((query['component']!=undefined) && (query['component'].trim()!="All Components")){
            sql = "SELECT num_passed,num_failed,num_unknown,num_aborted"+
                  " FROM " + global.mySQLOptions.database+".evtbl_failed_unknown_per_component" +
                  " WHERE test_result_id='"+query['version'].trim() + "'" + 
                  " AND component='"+common.mapToLongComponentNames(query['component'].trim())+"'";

         }
         // console.log(sql)
         con.query(sql, function(err,rows){
         
               //console.log(rows);   
               var response = { labels : [], data: []};
               if (rows.length > 0){
                  response = { labels     : [ "passed", "failed", "unknown", "aborted" ], 
                              data  : [ rows[0]['num_passed'], rows[0]['num_failed'], rows[0]['num_unknown'], rows[0]['num_aborted']]
                           };
               }
               //console.log(response);
               
               common.sendJsonResponse(res,response);		   
         }); // con.query
         
         con.release();
      
      }, // pooledCon().then.function(con)
      function(err) {
         console.error("Error 001:",err);
      } // pooledCon().then.function(err);
      ); //pooledCon.then 
	
	
};

chartsBase.prototype.chartRadarFailedUnknownPerComponent = function chartRadarFailedUnknownPerComponent (query, res){
	
	//console.log(query);
	
	pooledCon()
      .then(function(con) {
         var sCmptQueryFilter = '';
         if ((query['component']!=undefined) && (query['component'].trim()!="All Components")){
            sCmptQueryFilter = " AND component='"+common.mapToLongComponentNames(query['component'].trim())+"'";
         }
         con.query("select component, num_passed, num_failed, num_unknown, num_aborted " +
                  "from " + global.mySQLOptions.database +  ".evtbl_failed_unknown_per_component where " +
                  "test_result_id='" + query['version'].trim() + "'" +sCmptQueryFilter, 
                  function(err,rows){
         
               //console.log(rows);
               
               var response = { labels     : [],
                                 num_passed : [],
                                 num_failed : [],
                                 num_unknown: [],
                                 num_aborted: [],
                                 pt_passed  : [],
                                 pt_failed  : [],
                                 pt_unknown : [],
                                 pt_aborted : []
                              };
               //var response= { labels     : [ "passed", "failed", "unknown", "aborted" ], 
               //		         data  : [ rows[0]['num_passed'], rows[0]['num_failed'], rows[0]['num_unknown'], rows[0]['num_aborted']]
               // 		        };
               rows.forEach(function(item){
                  
                  //var sComponentName=item['component'].trim();
                  //if (sComponentName=="") {
                  //   sComponentName = "unknown";
                  //}
                  response['labels'].push(common.mapToShortComponentNames(item['component']));
            
                  response['num_passed'].push(item['num_passed']);
                  response['num_failed'].push(item['num_failed']);
                  response['num_unknown'].push(item['num_unknown']);
                  response['num_aborted'].push(item['num_aborted']);
                  
                  var num_total=item['num_passed'] + 
                                 item['num_failed'] + 
                                 item['num_unknown'] +
                                 item['num_aborted']
                  
                  response['pt_passed'].push(Math.round((item['num_passed']  / num_total)*100));
                  response['pt_failed'].push(Math.round((item['num_failed']  / num_total)*100));
                  response['pt_unknown'].push(Math.round((item['num_unknown']/ num_total)*100));
                  response['pt_aborted'].push(Math.round((item['num_aborted']/ num_total)*100));

               });
               
               
               //console.log(response);
               
               common.sendJsonResponse(res,response);		   
         }); // con.query
         
         con.release();
      
      }, // pooledCon().then.function(con)
      function(err) {
         console.error("Error 001:",err);
      } // pooledCon().then.function(err);
      ); //pooledCon.then 
	
	
};

chartsBase.prototype.chartRuntime = function chartRuntime (query, res){
   
   //console.log(query);
   
   pooledCon()
      .then(function(con) {
         
         var sql= "SELECT distinct(t1.name), TIMESTAMPDIFF(SECOND,t1.time_start,t1.time_end)/60 as runtime, t2.component FROM " + global.mySQLOptions.database +  ".tbl_file as t1 " +
                  "inner join " + global.mySQLOptions.database +  ".tbl_case as t2 on t1.file_id=t2.file_id " +
                  "where t1.test_result_id='" + query['version'].trim() + "' order by t2.component"
         
         con.query(sql,      
                  function(err,rows){
         
            var response = { 'data' : [] };
            
            rows.forEach(function(item){
               
               var shortname=item['name'].replace(/^.*[\\\/]/, '');
               var name=item['name'];
               
               var dataset={
                  'key'          : name,
                  'component'    : item['component'],
                  'subcomponent' : shortname,
                  'value'        : item['runtime']  
               };
         
               response['data'].push(dataset);
      
            });
        
            //console.log(response);
               
            common.sendJsonResponse(res,response);         
         }); // con.query
         
         con.release();
      
      }, // pooledCon().then.function(con)
      function(err) {
         console.error("Error 001:",err);
      } // pooledCon().then.function(err);
   ); //pooledCon.then 
   
   
};

chartsBase.prototype.getExecutionTime = function getExecutionTime (query, res){
	
	//console.log(query);
	
	pooledCon()
      .then(function(con) {
         con.query("select TIMESTAMPDIFF(MINUTE, MIN(time_start), MAX(time_start)) as period from " + global.mySQLOptions.database +  ".tbl_case where " +
                  "test_result_id='" + query['version'].trim() + "'", 
                  function(err,rows){
         
               //console.log(rows);
               
            var response = { period : ''}
            if (rows.length>0){ 
               response = { period : rows[0]['period'] }
            }   
            //console.log(response);
            
            common.sendJsonResponse(res,response);		   
         }); // con.query
         
         con.release();
      
      }, // pooledCon().then.function(con)
      function(err) {
         console.error("Error 001:",err);
      } // pooledCon().then.function(err);
   ); //pooledCon.then 
	
	
};

chartsBase.prototype.getMetaData = function getMetaData (query, res){
   
   //console.log(query);
   
   pooledCon()
      .then(function(con) {
         var sql="select t1.tester_account, t1.tester_machine, t1.time_start, UPPER(t1.name) like \"%JENKINS%\" as isjenkins, t2.jenkinsurl FROM " + global.mySQLOptions.database +  ".tbl_file as t1 " + 
               "left join " + global.mySQLOptions.database +  ".tbl_result as t2 on t1.test_result_id=t2.test_result_id " +
               "where t1.test_result_id='" + query['version'].trim() + "' and " +
                     "t1.time_start = (select min(time_start) from " + global.mySQLOptions.database +  ".tbl_file where test_result_id='" + query['version'].trim() + "'); "
                     
         //console.log(sql)              
         
         con.query(sql, function(err,rows){
         
            //console.log(rows);
               
            var response = {  tester_account : '',
                              tester_machine : '',
                              time_start     : '',
                              isjenkins      : '',
                              jenkinsurl     : ''
                           };
            if (rows.length>0){
               response = {  
                              tester_account : rows[0]['tester_account'],
                              tester_machine : rows[0]['tester_machine'],
                              time_start     : rows[0]['time_start'],
                              isjenkins      : rows[0]['isjenkins'],
                              jenkinsurl     : rows[0]['jenkinsurl']
                           };
            }   
            //console.log(response);
               
            common.sendJsonResponse(res,response);         
         }); // con.query
         
         con.release();
      
      }, // pooledCon().then.function(con)
      function(err) {
         console.error("Error 001:",err);
      } // pooledCon().then.function(err);
   ); //pooledCon.then 
   
   
};

chartsBase.prototype.postSummerInterpretation = function postSummerInterpretation (body, res){
	var query="";
	var values= ""
	
	pooledCon()
    .then(function(con) {
    	
    	query = "update " + global.mySQLOptions.database +  ".tbl_result set ? where test_result_id='" + body['version'].trim() + "'";
      values = {
                 interpretation: body['data'],
               };
    	
       con.query(query, values, 
       		     function(err,rows){
       
             //console.log(rows);
       	   
       }); // con.query
       
       con.release();
     
    }, // pooledCon().then.function(con)
    function(err) {
       console.error("Error 001:",err);
    } // pooledCon().then.function(err);
    ); //pooledCon.then 
	
	var response={ data : 'OK' };
	common.sendJsonResponse(res,response);	
};

chartsBase.prototype.getSummerInterpretation = function getSummerInterpretation (query, res){
	
	//console.log(query);
	
	var response={};
	
	pooledCon()
      .then(function(con) {
         con.query("select interpretation from " + global.mySQLOptions.database +  ".tbl_result where " +
                  "test_result_id='" + query['version'].trim() + "'", 
                  function(err,rows){
         
               //console.log(rows);
            if(rows.length>0){   
               if (rows[0]['interpretation']===null){
                  response = { data :	"" };
               } else {
                  response = { data : rows[0]['interpretation'].toString()} ;
               }
            }   
            //console.log(response['data']);
            
            common.sendJsonResponse(res,response);		   
         }); // con.query
         
         con.release();
      
      }, // pooledCon().then.function(con)
      function(err) {
         console.error("Error 001:",err);
      } // pooledCon().then.function(err);
   ); //pooledCon.then 
	
	
};

chartsBase.prototype.getTestResultDataTable = function getTestResultDataTable (query, res){
   
   //console.log(query);
   
   pooledCon()
      .then(function(con) {
         var sComponentFilter='';
         if (query['component']!=undefined && query['component']!="All Components"){
            sComponentFilter="t1.component='" + common.mapToLongComponentNames(query['component']) + "' and "
         }
         
         //tc_filter in http request has |-separated test_case_ids.
         //Format this to SQL syntax...
         var sTcFilter='';
         if (query['tc_filter']!=undefined && query['tc_filter']!='undefined'){
            var arTC=query['tc_filter'].split("|");
            
            for (var i=arTC.length; i--;) {
               arTC[i] = 't1.test_case_id RLIKE "' + arTC[i] + "\"";
            }
            
            var sTcFilter=" and ( " + arTC.join(" or ") + " )";
         }
         
         con.query("select 'symbol', " +
                  "       concat('result:',t1.result_main) as result_main, " +
                  "       concat('result:',t1.result_state) as result_state, " +
                  "       case (t1.lastlog!='' and t1.lastlog is not null) " +
                  "          when 0 then null " +
                  "          when 1 then t1.test_case_id " +
                  "       end as lastlog, " +
                  "       concat(t2.name,concat('##',t2.file_id)) as filename, " +
                  "       t1.name as testname, " +
                  "       concat('component:',t1.component) as component, " +
                  "       t1.tcid as tcid, " +
                  "       t1.fid as fid, " +
                  "       t1.issue as issue, " +
                  
                  "       case (t1.lastlog!='' and t1.lastlog is not null or 1)" +
                  "          when t3.state is null then '?' " +
                  "          else concat(t3.state,concat('##',concat(t3.timestamp,concat('##', t3.user_name)))) " +
                  "       end as state, " +
                  "       t1.test_case_id " +
                  
                  
                  //"       concat(t3.state,concat('##',concat(t3.timestamp,concat('##', t3.user_name)))) as state " +
                  "   from " + global.mySQLOptions.database +  ".tbl_case as t1 " +
                  "   inner join " + global.mySQLOptions.database +  ".tbl_file as t2 on (t1.file_id=t2.file_id) " +
                  "   left join " + global.mySQLOptions.database +  ".tbl_usr_case as t3 on (t1.test_case_id=t3.test_case_id) " +
                  "where " + sComponentFilter + " t1.test_result_id='" + query['version'].trim() + "' " + sTcFilter +
                  "order by t1.time_start",                  
                  function(err,rows){
       
                  //console.log(rows);
                  
                  var response = { data : rows }
                  
                  //console.log(response);
                  
                  common.sendJsonResponse(res,response);         
         }); // con.query
       
          con.release();
     
      }, // pooledCon().then.function(con)
      function(err) {
         console.error("Error 001:",err);
      } // pooledCon().then.function(err);
   ); //pooledCon.then 
   
   
};


chartsBase.prototype.getDataTableFilterBadgeContent = function getDataTableFilterBadgeContent (query, res){
   
   //console.log(query);
   
   pooledCon()
   .then(function(con) {
      var sComponentFilter='';
      if (query['component']!=undefined && query['component']!="All Components"){
         sComponentFilter="component='" + common.mapToLongComponentNames(query['component']) + "' and "
      }
        
      var sql="select "+ 
      "sum(case when result_main<>'Passed' then 1 else 0 end) as not_passed, " +
      "sum(case when (t1.lastlog!='' and t1.lastlog is not null) and ((t2.state!='l' and t2.state!='n') or t2.state is null) then 1 else 0 end) not_analyzed, " +
      "sum(case when (tcid REGEXP '^\s*TC')= 0  then 1 else 0 end) as no_tcid, " +
      "sum(case when (fid REGEXP '^\s*SWF-') = 0 then 1 else 0 end) as no_fid " +
      "from " + global.mySQLOptions.database +  ".tbl_case as t1 " +
      "left join tbl_usr_case as t2 on t1.test_case_id=t2.test_case_id " +
      "where " + sComponentFilter + " test_result_id='" + query['version'].trim() + "' "
      
      //console.log(sql)
      
      con.query(sql,                  
                function(err,rows){
      
            //console.log(rows);
            
            var response = { data : rows[0] }
            
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
  
  
};


chartsBase.prototype.getLastLog = function getLastLog (query, res){
   
   //console.log(query);
   
   pooledCon()
      .then(function(con) {
      
         
         var sql="select lastlog from " + global.mySQLOptions.database +  ".tbl_case where test_case_id='" + query['lastlogid'].trim() + "' "
         
         //console.log(sql)
         
         con.query(sql, function(err,rows){
         
            //console.log(rows);
            
            var response = { data : ''};
            if (rows.length>0){
               response = { data : rows[0]['lastlog'].toString() }
            }
            
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
         }); // con.query
         
         con.release();
      
      }, // pooledCon().then.function(con)
      function(err) {
         console.error("Error 001:",err);
      } // pooledCon().then.function(err);
   ); //pooledCon.then 
  
  
};


chartsBase.prototype.getQualityGate = function getQualityGate (query, req, res){
   
   //console.log(query);
   
   pooledCon()
      .then(function(con) {
      
         
         var sql="select reporting_qualitygate from " + global.mySQLOptions.database +  ".tbl_result where test_result_id='" + query['version'].trim() + "'"
         
         //console.log(sql)
         
         con.query(sql, function(err,rows){
         
            //console.log(rows[0]);
            
            var response = {reporting_qualitygate: ''};
            if (rows.length>0){
               response = rows[0];
            }
            
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
         }); // con.query
         
         con.release();
      
      }, // pooledCon().then.function(con)
      function(err) {
         console.error("Error 001:",err);
      } // pooledCon().then.function(err);
   ); //pooledCon.then 
  
  
};

chartsBase.prototype.getTMLHeader = function getTMLHeader (query, req, res){
   
   //console.log(query);
   
   pooledCon()
      .then(function(con) {
         
         var sql="select " +
                  "t1.testtoolconfiguration_testtoolname,  " +
                  "t1.testtoolconfiguration_testtoolversionstring, " +
                  "t1.testtoolconfiguration_projectname, " +
                  "t1.testtoolconfiguration_logfileencoding, " +
                  "t1.testtoolconfiguration_pythonversion, " +
                  "t1.testtoolconfiguration_testfile, " +
                  "t1.testtoolconfiguration_logfilepath, " +
                  "t1.testtoolconfiguration_logfilemode, " +
                  "t1.testtoolconfiguration_ctrlfilepath, " +
                  "t1.testtoolconfiguration_configfile, " +
                  "t1.testtoolconfiguration_confname, " +
                  "t1.testfileheader_author, " +
                  "t1.testfileheader_project, " +
                  "t1.testfileheader_testfiledate, " +
                  "t1.testfileheader_version_major, " +
                  "t1.testfileheader_version_minor, " +
                  "t1.testfileheader_version_patch, " +
                  "t1.testfileheader_keyword, " +
                  "t1.testfileheader_shortdescription, " +
                  "t1.testexecution_useraccount, " +
                  "t1.testexecution_computername, " +
                  "t1.testrequirements_documentmanagement, " +
                  "t1.testrequirements_testenvironment, " +
                  "t1.testbenchconfig_name, " +
                  "t1.testbenchconfig_data, " +
                  "t1.preprocessor_filter, " +
                  "t1.preprocessor_parameters, " +
                  "t2.time_start, " +
                  "t2.time_end, " +
                  "t2.test_result_id " +
               "FROM " + global.mySQLOptions.database +  ".tbl_file_header as t1 " + 
               "left join " + global.mySQLOptions.database +  ".tbl_file as t2 on t1.file_id=t2.file_id " +
               "where t1.file_id='" + query['file_id'].trim() + "'"
            
         //console.log(sql)      
               
         con.query(sql, function(err,rows){
         
            //console.log(rows[0]);
            
            var response = {};
            if (rows.length>0){
               response = rows[0];
            }
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
         }); // con.query
         
         con.release();
      
      }, // pooledCon().then.function(con)
      function(err) {
         console.error("Error 001:",err);
      } // pooledCon().then.function(err);
   ); //pooledCon.then 
  
  
};


chartsBase.prototype.getTestCaseStabilityByTestName = function getTestCaseStabilityByTestName (query, req, res){
   
   //console.log(query);
   
   pooledCon()
   .then(function(con) {
        
      var sql="call " + global.mySQLOptions.database +  ".getTestCaseStabilityByTestName('','" + query['test_case_id'] + "')";

      //console.log(sql)      
              
      con.query(sql,                  
                function(err,rows){
      
            //console.log(rows[0]);
            
            var response = rows[0];
            
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
  
  
};

chartsBase.prototype.getTestCaseStabilityFlowByTestName = function getTestCaseStabilityFlowByTestName (query, req, res){
   
   //console.log(query);
   
   pooledCon()
   .then(function(con) {
        
      var sql="call " + global.mySQLOptions.database +  ".getTestCaseStabilityFlowByTestName('','" + query['test_case_id'] + "')";

      //console.log(sql)      
              
      con.query(sql,                  
                function(err,rows){
      
            //console.log(rows[0]);
            
            var response = rows[0];
            
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
  
  
};


chartsBase.prototype.setIssueStatus = function setIssueStatus (query, req, res){
   
   pooledCon()
   .then(function(con) {
         
      //var sql="select lastlog from tbl_case where test_case_id='" + query['issuestatus'].trim() + "' "
      var sql="insert into " + global.mySQLOptions.database +  ".tbl_usr_case ( test_case_id , state, timestamp, user_name ) values " +
                                               "('" + query['lastlogid'].trim() + "','" + query['issuestatus'].trim() + "',now(),'" + req.session.displayName + "') " +
              "on duplicate key update state='" + query['issuestatus'].trim() + "', timestamp=now(), user_name='" + req.session.displayName + "'";       
                        
      //console.log(sql)
      
      con.query(sql,                  
                function(err,rows){
      
            //console.log(rows);
            
            var response = { data : 'update_ok' }
            
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
};


chartsBase.prototype.postTestCaseComment = function postTestCaseComment (body, req, res){
   
   pooledCon()
    .then(function(con) {
      
      /*var sql = "insert into testdb.tbl_usr_comments set ?";
     
     
      var values = {
                 test_case_id : body['testcaseid'],
                 number       : body['number'],
                 user         :  req.session.user, 
                 user_name    :  req.session.displayName,
                 comment      : body['comment'],
               };
      
       con.query(sql, values, 
                 function(err,rows){
       
             console.log(rows);
            
       }); // con.query */
       
       var sql="select comment_id from " + global.mySQLOptions.database +  ".tbl_usr_comments where test_case_id=" + body['testcaseid'] + " and number=" + body['number']
         
       con.query(sql,
                 function(err,rows){
   
          var comment_id=null;
          if(rows.length>0){
             comment_id=rows[0]['comment_id'];
          }   
          
          if (comment_id==null){
             var sql = "insert into " + global.mySQLOptions.database +  ".tbl_usr_comments set ?";
             
             var values = {
                        test_case_id : body['testcaseid'],
                        number       : body['number'],
                        user         :  req.session.user, 
                        user_name    :  req.session.displayName,
                        comment      : body['comment'],
                      };
             
             //console.log(sql)
             
             con.query(sql, values, 
                       function(err,rows){
                                            //console.log(rows);
             }); // con.query */
          } else {
             var sql = "update  " + global.mySQLOptions.database +  ".tbl_usr_comments set ? where comment_id=" + comment_id;
             
             var values = {
                            comment      : body['comment'],
                            timestamp    : moment().format('YYYY-MM-DD HH:mm:ss') 
                          };
              
             //console.log(sql)
             con.query(sql, values, 
                       function(err,rows){
                                            // console.log(rows);
                                            // console.log(err);
             }); // con.query */
          }
           
          }); // con.query */
       
       con.release();
     
    }, // pooledCon().then.function(con)
    function(err) {
       console.error("Error 001:",err);
    } // pooledCon().then.function(err);
    ); //pooledCon.then 
   
   var response={ data : 'OK' };
   common.sendJsonResponse(res,response); 
};

chartsBase.prototype.getTestCaseComments = function getTestCaseComments (query, req, res){
   
   //console.log(query);
   
   pooledCon()
   .then(function(con) {
    
      if (!query['number']){
         //make timestamp plan string without meta information  
         //var sql="select number,user_name,user,concat(timestamp,'') as timestamp,comment from " + global.mySQLOptions.database +  ".tbl_usr_comments where test_case_id='" + query['testcaseid'].trim() + "' order by timestamp_created";
      
         var sql="select number,user_name,user,concat(timestamp,'') as timestamp,comment,test_case_id from " + global.mySQLOptions.database +  ".tbl_usr_comments " + 
                 "where test_case_id in (select test_case_id from " + global.mySQLOptions.database +  ".tbl_case where name=(select name from " + global.mySQLOptions.database +  ".tbl_case where test_case_id='" + query['testcaseid'].trim() + "') ) " +
                 "order by timestamp_created "
      
      
      } else {
         var sql="select number,user_name,user,concat(timestamp,'') as timestamp,comment from " + global.mySQLOptions.database +  ".tbl_usr_comments where test_case_id='" + query['testcaseid'].trim() + "' and number=" + query['number'] + " order by timestamp_created"
      }
         
      //console.log(sql)
      
      con.query(sql,                  
                function(err,rows){
      
            //console.log(rows);
            
            var response = { data : rows };
            
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
  
  
};


chartsBase.prototype.postDeleteTestCaseComment = function postDeleteTestCaseComment (query, req, res){
   
   //console.log(query);
   
   pooledCon()
   .then(function(con) {
      var sql="delete from " + global.mySQLOptions.database +  ".tbl_usr_comments where test_case_id='" + query['testcaseid'].trim() + "' and number=" + query['number']
      
      //console.log(sql)
      
      con.query(sql,                  
                function(err,rows){
      
            //console.log(rows);
            
            var response = { data : 'delete_ok' };
            
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
  
  
};

chartsBase.prototype.postIssueLink = function postIssueLink (body, req, res){
   
   pooledCon()
   .then(function(con) {
         
      var sql = "insert into " + global.mySQLOptions.database +  ".tbl_usr_links set ?";
      
      var values = {
                 test_case_id : body['testcaseid'],
                 number       : body['number'],
                 user         : req.session.user, 
                 user_name    : req.session.displayName,
                 url          : body['url'],
               };
      
      //console.log(sql)
      
      con.query(sql, values,                 
                function(err,rows){
            //console.log(rows);
            
            var response = { data : 'insert_ok' }
            
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
};

chartsBase.prototype.postDeleteIssueLink = function postDeleteIssueLink (query, req, res){
   
   //console.log(query);
   
   pooledCon()
   .then(function(con) {
      var sql="delete from " + global.mySQLOptions.database +  ".tbl_usr_links where test_case_id='" + query['testcaseid'].trim() + "' and number=" + query['number']
      
      //console.log(sql)
      
      con.query(sql,                
                function(err,rows){
      
            //console.log(err)
            //console.log(rows)
            //console.log(rows);
            
            var response = { data : 'delete_ok' };
            
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
  
  
};

chartsBase.prototype.getIssueLinks = function getIssueLinks (query, req, res){
   
   //console.log(query);
   
   pooledCon()
   .then(function(con) {
    
      if (!query['number']){
         //make timestamp plan string without meta information  
         var sql="select number,user_name,user,concat(timestamp_created,'') as timestamp, url, test_case_id from " + global.mySQLOptions.database +  ".tbl_usr_links " +
                 "where test_case_id in (select test_case_id from " + global.mySQLOptions.database +  ".tbl_case where name=(select name from " + global.mySQLOptions.database +  ".tbl_case where test_case_id='" + query['testcaseid'].trim() + "') ) " +
                 "order by timestamp_created";
      } else {
         var sql="select number,user_name,user,concat(timestamp_created,'') as timestamp,url from " + global.mySQLOptions.database +  ".tbl_usr_links where test_case_id='" + query['testcaseid'].trim() + "' and number=" + query['number'] + " order by timestamp_created"
      }
         
      //console.log(sql)
      
      con.query(sql,                  
                function(err,rows){
      
            //console.log(rows);
            
            var response = { data : rows };
            
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
  
  
};

chartsBase.prototype.chartNotAnalyzedIssues = function chartNotAnalyzedIssues (query, res){
   
   //console.log(query);
   
   pooledCon()
      .then(function(con) {
         var sql="call " + global.mySQLOptions.database +  ".getNotAnalyzedIssues(\"" + query['version'].trim() + "\")";
         
         con.query(sql, function(err,rows){
            //console.log(rows);
            
            var response = { labels : [],
                           not_analyzed : [],
                           };
            //sometimes we have here an empty response. To avoid a crash
            //better to use a try/catch block...
            try {          
               rows[0].forEach(function(item){
                  // consider to modify 'getNotAnalyzedIssues' stored procedure
                  // add component as input param 
                  if (query['component']!=undefined && query['component'].trim()!="All Components"){
                     if (common.mapToShortComponentNames(query['component'].trim()) === common.mapToShortComponentNames(item['component'])){
                     response['labels'].push(common.mapToShortComponentNames(item['component']));
                     response['not_analyzed'].push(item['not_analyzed']);                     
                     }
                  } else {
                  response['labels'].push(common.mapToShortComponentNames(item['component']));
                  response['not_analyzed'].push(item['not_analyzed']);
                  }
               });
               
            } catch (err) {
            //nothing to do if request returns empty result
            }
            
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
         }); // con.query
         
         con.release();
      
      }, // pooledCon().then.function(con)
      function(err) {
         console.error("Error 001:",err);
      } // pooledCon().then.function(err);
      ); //pooledCon.then 
   
   
};


chartsBase.prototype.chartResetVsComponentLine = function chartResetVsComponentLine (query, req, res){
   
   //console.log(query);
   
   pooledCon()
      .then(function(con) {
       //var sql="select t1.component, concat(t1.time_start,'') as time_start, t1.counter_resets from " + 
       //        "(select * from " + global.mySQLOptions.database + ".tbl_case where test_result_id=\"" + query['version'].trim() + "\" order by time_start ASC) t1 " + 
       //        "where counter_resets>0 group by counter_resets order by time_start ASC";
       
       
       //the chart requires a date for the time, therefore nomalize the passed time with min_time_start and add then a date as prefix again 
       // var sql="select t1.component, CONCAT('2016-01-01 ',CONCAT(TIMEDIFF(t1.time_start, t2.min_time_start),'')) as time_start, t1.counter_resets from " +
               // "(select * from tbl_case where test_result_id=\"" + query['version'].trim() + "\" and counter_resets>0 order by time_start ASC)  t1 " + 
               // "left join (select min(time_start) as min_time_start from tbl_case where test_result_id=\"" + query['version'].trim() + "\" ) t2 " + 
               // " on true " +
               // " group by counter_resets order by time_start ASC"; 
         var sCmptQueryFilter ='';
         if (query['component']!=undefined && query['component'].trim()!="All Components"){
            sCmptQueryFilter = " AND (component='"+common.mapToLongComponentNames(query['component'])+"' OR t1.counter_resets=0) ";
            // sCmptQueryFilter = " AND component='"+common.mapToLongComponentNames(query['component'])+"' ";
         }
         var sql=	"SELECT DISTINCT " +
					"t1.component, " +
					"CONCAT('2016-01-01 ', TIMEDIFF(t2.counter_time_start, t3.min_time_start)) AS time_start, " +
					"t1.counter_resets " +
				"FROM tbl_case AS t1 " +
				"JOIN " +
					"(SELECT " +
						"counter_resets, " +
						"MIN(time_start) AS counter_time_start " +
					"FROM tbl_case " +
					"WHERE test_result_id=\"" + query['version'].trim() + "\" " +
					"GROUP BY counter_resets) AS t2 " +
				"ON t1.counter_resets = t2.counter_resets " +
					"AND t1.time_start = t2.counter_time_start " +
				"JOIN " +
					"(SELECT min(time_start) as min_time_start FROM tbl_case WHERE test_result_id=\"" + query['version'].trim() + "\") AS t3 " +
				"WHERE test_result_id=\"" + query['version'].trim() + "\" "  + sCmptQueryFilter + 
				"ORDER BY time_start ASC"; 
	   
	  //console.log('sql: ', sql)

	   	   
	   // todo Fehlersuche START
	   
      con.query(sql, function(err,rows){
      
         //console.log(rows);
         
         var response = { labels : [],
                        time : [],
                        num_resets : []
                        };
         
         rows.forEach(function(item, index){
            // console.log(item)
            response['labels'].push(common.mapToShortComponentNames(item['component']));
            response['time'].push(item['time_start']);
            if (query['component']!=undefined && query['component'].trim()!="All Components"){
            response['num_resets'].push(index);
            } else {
            response['num_resets'].push(item['counter_resets']);
            }
            
         });
         
         // console.log(response);
         
         common.sendJsonResponse(res,response);         
      }); // con.query
      
      con.release();
     
	 
		// todo Fehlersuche END
		
		
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
   
   
};

chartsBase.prototype.postTags = function postTags (query, req, res){
   
   pooledCon()
   .then(function(con) {
         
      //var sql="select lastlog from tbl_case where test_case_id='" + query['issuestatus'].trim() + "' "
      var sql="insert into " + global.mySQLOptions.database +  ".tbl_usr_result ( test_result_id , tags ) values " +
                                               "('" + query['version'].trim() + "','" + query['tags'].trim() + "') " +
              "on duplicate key update tags='" + query['tags'].trim() + "'";      
                        
      //console.log(sql)
      
      con.query(sql,                  
                function(err,rows){
         
            var arTags=query['tags'].trim().split("###");
         
            _.each(arTags,function(tag){
               var tagsSql="insert into " + global.mySQLOptions.database +  ".tbl_usr_tags ( tag, user_id, origin ) values " +
                           "('" + tag + "','" + req.session.user + "','test_result') " +
                           "on duplicate key update user_id='" + req.session.user + "'";
               //console.log(">> " + tagsSql)
               con.query(tagsSql,function(err,rows){ /*don't care of results*/ });
            });
            //console.log(rows);
            
            var response = { data : 'update_ok' }
            
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
};


chartsBase.prototype.getTags = function getTags (query, req, res){
   
   //console.log(query);
   
   pooledCon()
   .then(function(con) {
    
      var sql="select tags from " + global.mySQLOptions.database + ".tbl_usr_result where test_result_id='" + query['version'].trim() + "'";
     
      //console.log(sql)
      
      con.query(sql,                  
                function(err,rows){
      
            //console.log(rows);
            
            var response = {tags : ''}; 
            if ( rows[0]!=undefined){
               response=rows[0];
            }
            
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
  
  
};

chartsBase.prototype.getDistinctTagList = function getDistinctTagList (query, req, res){
   
   //console.log(query);
   
   pooledCon()
   .then(function(con) {
    
      var sql="select distinct(tag) from " + global.mySQLOptions.database + ".tbl_usr_tags where origin='test_result'";
     
      //console.log(sql)
      
      con.query(sql,                  
                function(err,rows){
      
            //console.log(rows);
            
            var response = {tags : []}; 
            _.each(rows,function(row){
               response['tags'].push(row['tag']);
            });
            
            //console.log(response['tags']);
            
            common.sendJsonResponse(res,response['tags']);         
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
  
  
};

chartsBase.prototype.logHistory = function logHistory ( id, 
                                                        change_type,
                                                        change_text,
                                                        change_data,
                                                        req,
                                                        source){
   
   //if (change_type==history.enHistoryClass.interpretationChange)
   //{}
   
   pooledCon()
   .then(function(con) {
      
      if (source==history.enHistorySource.test_case){
         var sql="insert into " + global.mySQLOptions.database +  ".tbl_usr_case_history set ?";
      } else if (source==history.enHistorySource.test_suite){
         var sql="insert into " + global.mySQLOptions.database +  ".tbl_usr_result_history set ?";
      }
      
      //if (change_type==history.enHistoryClass.interpretationChange)
      //{
      //   change_data['data']=new Buffer(change_data['data'],'base64').toString();
      //}
      
      var values = {
            user         : req.session.user,
            user_name    : req.session.displayName, 
            change_type  : change_type,
            change_text  : change_text,
            change_data  : JSON.stringify(change_data)
          };
      
      if (source==history.enHistorySource.test_case){
         values['test_case_id']=id
      } else if (source==history.enHistorySource.test_suite){
         values['test_result_id']=id
      }
                                          
      //console.log(sql)
      //console.log(values)
      
      con.query(sql, values,                 
                function(err,rows){
      
            //console.log(rows);
            //console.log(err);
           
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
};

chartsBase.prototype.getHistory = function getHistory (query, req, res){
   
   //console.log(query);
   
   pooledCon()
   .then(function(con) {
      
      if (query['source']==history.enHistorySource.test_case){
         var sql="select user, user_name, change_type, change_text, change_data, concat(timestamp,'') as time_stamp from " + global.mySQLOptions.database + ".tbl_usr_case_history " +
         		"where test_case_id in (select test_case_id from " + global.mySQLOptions.database +  ".tbl_case where name=(select name from " + global.mySQLOptions.database +  ".tbl_case where test_case_id='" + query['testcaseid'].trim() + "') ) " +
         		"order by timestamp desc";
      } else if (query['source']==history.enHistorySource.test_suite){
         var sql="select user, user_name, change_type, change_text, change_data, concat(timestamp,'') as time_stamp from " + global.mySQLOptions.database + ".tbl_usr_result_history where test_result_id='" + query['version'].trim() + "' order by timestamp desc";  
      }
      
      //console.log(sql)
      
      con.query(sql,                  
                function(err,rows){
      
            //console.log(rows);
            //console.log(err);
            
            var response = rows;
            
            //console.log(response['tags']);
            
            common.sendJsonResponse(res,response);         
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
  
  
};


chartsBase.prototype.getTestSuiteState = function getTestSuiteState(query, req, res){
   
   //console.log(query);
   
   pooledCon()
   .then(function(con) {
    
      var sql="select result_state from " + global.mySQLOptions.database +  ".tbl_result where test_result_id='" + query['version'].trim() + "' "
      
      //console.log(sql)
      
      con.query(sql,                  
                function(err,rows){
      
            //console.log(rows);
            var response = {result_state: ''};
            if (rows.length>0){
               response = rows[0];
            }
            
            //console.log(response);
            
            common.sendJsonResponse(res,response);         
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
  
  
};


chartsBase.prototype.postTestSuiteState = function postTestSuiteState (query, req, res){
   
   pooledCon()
   .then(function(con) {
         
      //var sql="select lastlog from tbl_case where test_case_id='" + query['issuestatus'].trim() + "' "
      var sql="update " + global.mySQLOptions.database +  ".tbl_result set result_state='" + query['result_state'].trim() + "'" +
              "where test_result_id='"+ query['version'].trim() + "'"
                           
      //console.log(sql)
      
      con.query(sql,                
         function(err,rows){
      
            //console.log(err)
            //console.log(rows);
            
            var response = { data : 'update_ok' };
            // trigger Jenkins job to import released result
            if (global.bPublishReleasedResult && (query['result_state'].trim()=='limited release' || query['result_state'].trim()=='released')){
               var sqlJenkinsURL = "SELECT branch, project, jenkinsurl, version_sw_target FROM " + global.mySQLOptions.database + ".tbl_result WHERE test_result_id='"+ query['version'].trim() + "'";
               con.query(sqlJenkinsURL, function(err, rows){
                  if(err) throw err;
                  if(rows.length > 0 && rows[0]['branch']=='main' && rows[0]['project']=='rnaivi' && rows[0]['version_sw_target'].slice(-2)!='_S' && 
                     rows[0]['version_sw_target'].slice(-2)!='_R' && rows[0]['version_sw_target'].slice(-2)!='_U' && rows[0]['version_sw_target'].slice(-4)!='_U64'){
                     var sJenkinsURL = rows[0]['jenkinsurl'];
                     var arrURL = sJenkinsURL.split("/");
                     // Cover the url without "/" at the end
                     var sBVTBuildNo = arrURL[arrURL.length-1] != "" ? arrURL[arrURL.length-1] : arrURL[arrURL.length-2];
                     common.triggerJenkinsJob(sBVTBuildNo);
                  }
               });
            }

            common.sendJsonResponse(res,response);
      }); // con.query
      
      con.release();

    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
};

chartsBase.prototype.getTestSuiteRelationship = function getTestSuiteRelationship(query, req, res){

    pooledCon()
    .then(function(con) {

        // This method uses regexp_replace of mysql, test_result_id is used in query
        // But it only available from mysql version 8.0.4
        // var sql="SELECT test_result_id, version_sw_target, project FROM " + global.mySQLOptions.database + ".tbl_result " + 
        //         "WHERE branch='" + query['branch'] + "' AND version_sw_target LIKE "+
        //             "CONCAT(REPLACE((SELECT version_sw_target FROM " + global.mySQLOptions.database +  ".tbl_result "+
        //                 "WHERE test_result_id='" + query['version'].trim() + "'), '_[U,S]', ''), '%')"
                    // "CONCAT(REGEXP_REPLACE((SELECT version_sw_target FROM " + global.mySQLOptions.database +  ".tbl_result "+
                    //     "WHERE test_result_id='" + query['version'].trim() + "'), '_[U,S]$', ''), '%')"

        // remove prefix XXXX_XXXXXX_ and postfix _U, _R or _S
        // add wildcard character %
        // var sw_pattern = "%"+query['sw_version'].trim().substring(12).replace(/_[U,S,R]$/, '')+"%";
        var sw_pattern = query['sw_version'].substr(12).trim().replace(/_[U,S,R]$/, '').replace(/_U64$/, '')+"%";

        // return data without filter condition
        // it will be handled from client side

        var sql="SELECT test_result_id, project, version_sw_target, result_state, branch, category_main FROM " + global.mySQLOptions.database + ".tbl_result " + 
                "WHERE branch='" + query['branch'].trim() + "' AND SUBSTR(version_sw_target,13) LIKE '" + sw_pattern +"' ORDER BY project ASC, timestamp DESC";                    
        // console.log(sql)
        con.query(sql,                
            function(err,rows){
                if(err) throw err;

                var responseData = {};
                rows.forEach(function(item){
                    if (!(item.project in responseData)){
                        responseData[item.project] = [];
                    }
                    responseData[item.project].push(item);
                });

                common.sendJsonResponse(res,responseData);         
                // common.sendJsonResponse(res,rows);         
        }); // con.query
       
        con.release();
    }, // pooledCon().then.function(con)
    function(err) {
        console.error("Error 001:",err);
    } // pooledCon().then.function(err);
    ); //pooledCon.then     
};

chartsBase.prototype.getDiffExecutionResults = function getDiffExecutionResults(query, req, res){
   // accepted params:
   // case 1: selected version
   // - mandatory: SWversion, project, branch
   // - optional:  component
   // case 2: stack versions
   // - mandatory: version
   // - optional:  component

   pooledCon()
      .then(function(con) {
         var arrListVersions = [];

         var vProcessSQL = function(arrListVersions){
            var sListVersion = "SELECT '" + arrListVersions[0] + "' AS test_result_id, 0 AS order_idx "; 
            for (var i=1; i<arrListVersions.length; i++){
               sListVersion += "UNION SELECT '" + arrListVersions[i] + "' AS test_result_id, " + i +" AS order_idx ";
            }         
   
            // filter by component if it is provided in request's param
            var sCmptQueryFilter = '';
            if ((query['component']!=undefined) && (query['component'].trim()!="All Components")){
               sCmptQueryFilter = " AND t1.component='"+common.mapToLongComponentNames(query['component'].trim())+"'";
            } 
   
            // select all data of execution list
            var sql="SELECT t0.version_sw_target AS version, t0.test_result_id AS version_id, t0.result_state, t0.category_main, t0.branch, t0.variant, "+
                     "t2.name AS filename, t1.component, t1.name, t1.result_main, t2.tester_machine, t1.test_case_id, "+ 
                     "DATE_FORMAT(t1.time_start,'%Y-%m-%dT%H:%i:%sZ') AS time, " + 
                     "DATE_FORMAT(t2.time_end,'%Y-%m-%dT%H:%i:%sZ') AS end_time " + 
                     "FROM " + global.mySQLOptions.database +  ".tbl_result AS t0 " +
                     "JOIN (" + sListVersion + ") AS t3 ON t0.test_result_id=t3.test_result_id "+
                     "JOIN " + global.mySQLOptions.database +  ".tbl_case AS t1 ON t0.test_result_id=t1.test_result_id AND t1.repeatcount=1 " +
                     "JOIN " + global.mySQLOptions.database +  ".tbl_file AS t2 ON t1.file_id=t2.file_id " +
                     sCmptQueryFilter + " ORDER BY t3.order_idx, t1.time_start";
   
            // console.log(sql)
   
            // parse data from query result
            // response domain contains version, start and end time (runtime) of each execution
            con.query(sql, 
               // issue 1: we have same test name inside same component
               // full path file name is different but file name is the same
               // issue 2: test with repetition > 1 
               // issue 3: test case without test name, audio component
               // C:/JenkinsClient/workspace/cmd_relbin_main/5_gen3arm_rnaivi_bvt/view/ai_audio/_tmltest/components/AMCommandPlugin/tests/testcases/Other/CPUsage.tml
               // issue 3: test case with same name in same tml file, spi component
               // C:/JenkinsClient/workspace/cmd_relbin_main/5_gen3arm_rnaivi_bvt/view/ai_spi/components/adapter/_tmltest/components/SPI_CCA_TA/tests/testcases/BaiduCarlife/methods/SPI_GetTechnologyPreference.tml
               // issue 4: make sure only 3 records inside detail
               function(err,rows){
                  if(err) {
                     throw err;
                  } else {
                     var response={ 'data'   : [],
                                    'domain' : [],
                                    'version': [],
                                    'version_detail': {}
                                 };
                     var oTempData = {};
                     
                     // check length of rows before parsing into reponse to avoid server error
                     if(rows.length>0){
                        // group records by each version to get domain data
                        var oVersions = _.groupBy(rows, function(item){
                           return item.version_id;
                        })
                        _.each(oVersions, function(oVersion, version_id){
                           var domain = {};
                           domain['start_time'] = oVersion[0].time;
                           domain['end_time']   = oVersion[oVersion.length-1].end_time;
                           response.domain.push(domain);
                           response.version.push(version_id);
                           response.version_detail[version_id]={
                              "category": oVersion[0].category_main,
                              "state": oVersion[0].result_state,
                              "branch": oVersion[0].branch,
                              "variant": oVersion[0].variant,
                              "version_name": oVersion[0].version
                           }
                        });
   
                        // group records by component to avoid testcases which only existing in youngest version are pushed into last 
                        // That leads to component's data is splited in chart view
                        var oComponents = _.groupBy(rows, function(item){
                           return item.component;
                        })
                        _.each(oComponents, function(oComponent, sComponent){
                           _.each(oComponent, function(item, idx){
                              // calculate duration time of each test case
                              var duration = new Date(item.end_time) - new Date(item.time);
                              if(idx+1 < oComponent.length){
                                 if(oComponent[idx+1].end_time == item.end_time){
                                    duration = new Date(oComponent[idx+1].time) - new Date(item.time);
                                 } 
                              }
   
                              // we don't have testcase id to identify test case in each version
                              // some components have same name in same TML file - spi
                              // some components have blank name in same TML file - audio
                              // to identify them, I use the combination of TML path file and test name
                              var arrTMLpathPart = item.filename.split('/ai_');
                              if (arrTMLpathPart.length == 1){
                                 arrTMLpathPart = item.filename.split('/');
                              }
                              var sPrefixTestname = arrTMLpathPart[arrTMLpathPart.length-1];
                              var sIdentified_name = sPrefixTestname+":"+item.name;
   
                              // Check if identifed name is already existing in this version
                              // Avoid duplicated identified_name in same version
                              // Audio and spi have same test case name in same TML file
                              if ((sIdentified_name in oTempData) && 
                                 (response.version.indexOf(item.version_id) < oTempData[sIdentified_name].detail.length)){
                                 sIdentified_name = sIdentified_name+"-1";
                              }
   
                              // prepare dataset for each test case and detail for each version
                              var dataset ={
                                 'identified_name' : sIdentified_name,
                                 'component'       : sComponent,
                                 'name'            : item.name,
                                 'detail'          : []
                              }
   
                              var oVersionDetail = {
                                 'testcaseID': item.test_case_id,
                                 'result'    : item.result_main,
                                 'duration'  : duration, //unit is millisecond
                                 'version'   : item.version,
                                 'machine'   : item.tester_machine,
                                 'filename'  : item.filename
                              };
   
                              // check existing and add to oTempData
                              if(sIdentified_name in oTempData){
                                 // check order of version in detail array
                                 if (response.version.indexOf(item.version_id) > oTempData[sIdentified_name].detail.length){
                                    // add detail for previous missing version
                                    oTempData[sIdentified_name].detail.push({'result': 'not existing'})
                                 }
                                 oTempData[sIdentified_name].detail.push(oVersionDetail)
                              } else {
                                 for (var i = 0; i<response.version.indexOf(item.version_id); i++ ){
                                    dataset.detail.push({'result': 'not existing'})
                                 }
                                 dataset.detail.push(oVersionDetail)
                                 // Create new identified_name data
                                 oTempData[sIdentified_name] = dataset;
                              }
                           })
                        });
                        // get values of oTempData as response data
                        response.data = _.values(oTempData)
                     }
                     // response parsed data
                     common.sendJsonResponse(res,response);
                  }     
               }
            ); // con.query
            
            con.release();
         }         
         if ('SWversion' in query){
            var sVersion  = query['SWversion'];
            
            var sSuffix   = sVersion.slice(-2);
            if (sSuffix == '_S' || sSuffix == '_R'){
               sVersion = sVersion.slice(0,-2);
            }
            
            var sReleasedVersionsSQL = "SELECT test_result_id, version_sw_target FROM " + global.mySQLOptions.database + ".tbl_result "+
                                       "WHERE result_state NOT IN ('test died','test build','new report','in progress') "+
                                       "AND branch='" + query['branch'].trim() + "' "+
                                       "AND project='" + query['project'].trim() +"' "+
                                       "AND version_sw_target NOT LIKE '%_S' AND version_sw_target NOT LIKE '%_R' "+
                                       "ORDER BY timestamp DESC";
            // console.log(sReleasedVersionsSQL);
            con.query(sReleasedVersionsSQL, function(err, rows){
               if(err){
                  throw err;
               } else {
                  if(rows.length>0){
                     for(var i=0; i<rows.length; i++){
                        // Check if version is existing in query results
                        if (sVersion == rows[i].version_sw_target){
                           // Push latest version first
                           if(i>0){
                              arrListVersions.push(rows[i-1].test_result_id);
                           }
                           arrListVersions.push(rows[i].test_result_id);
                           // Push next versions
                           if(i+1 < rows.length){
                              arrListVersions.push(rows[i+1].test_result_id);
                           }
                           // Check length of list versions
                           if((arrListVersions.length < 3) && (i+2 < rows.length)){
                              arrListVersions.push(rows[i+2].test_result_id);
                           }                           
                           break;
                        }
                     }
                     // if version is not matched, return 3 latest versions
                     if (arrListVersions.length == 0){
                        arrListVersions.push(rows[0].test_result_id);
                        if (rows.length>1){ 
                           arrListVersions.push(rows[1].test_result_id);
                           if (rows.length>2){ 
                              arrListVersions.push(rows[2].test_result_id);
                           };
                        }
                     }
                  }
               }
               vProcessSQL(arrListVersions);
            })
         } else {
            // for stack versions
            vProcessSQL(query['versions'].split(";"));
         }
     
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
   
};

chartsBase.prototype.getReanimationStatus = function getReanimationStatus(query, req, res) {
   // This method use to get the number of reanimation during bvt test.
   pooledCon()
   .then(function(con) {
      var sql="SELECT num_of_reanimation FROM " + global.mySQLOptions.database +  ".tbl_result where test_result_id='" + query['version'] + "'";

      // console.log(sql)
      // This query returns the number of reanimation after finished bvt test
      con.query(sql, function(err,rows){
          var response={ 'reanimation': 0};
          if (rows.length>0){
              response['reanimation'] = rows[0]['num_of_reanimation'];
          }
          common.sendJsonResponse(res,response);         
      }); // con.query
      
      con.release();
    
   }, // pooledCon().then.function(con)
   function(err) {
      console.error("Error 001:",err);
   } // pooledCon().then.function(err);
   ); //pooledCon.then 
};