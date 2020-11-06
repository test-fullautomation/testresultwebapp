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

module.exports = chartsCCR;

function chartsCCR(){
	
};

chartsCCR.prototype.chartCCRBarsAllResults = function chartCCRBarsAllResults (query, req, res){	
	 var startDate = moment().subtract(29, 'days').format("DD.MM.YYYY");
    var endDate = moment().format("DD.MM.YYYY");

	console.log("chartCCRBarsAllResults");
    var  dpTRFReportRange = global.ndCache.get(req.sessionID + ".dpTRFReportRange");
    if (dpTRFReportRange){
    	startDate = dpTRFReportRange['startDate'];
      endDate   = dpTRFReportRange['endDate'];
    		
    }
    
	pooledCon()
    .then(function(con) {
       var sql="select component_name, MEM_RSS, MEM_PSS, MEM_Anonymous, Storage, CPU " +
		     "from " + global.mySQLOptions.database +  ".tbl_ccr_components";
       
       //console.log(sql);
    	
       con.query(sql, 
       		     function(err,rows){
       
             console.log(rows);   
             var response= { component_name     : [], 
            		         MEM_RSS   : [],
            		         MEM_PSS  : [],
            		         MEM_Anonymous : [],
            		         Storage : [],
            		         CPU : []
            		        };
             
             for (var data in rows)
             {
             	var item=rows[data];
             	//response["labels"].push(item["version_sw_target"].match("\\d+\\.\\d[FS]\\d+_*\\d*"));
             	
             	response["component_name"].push(item["component_name"]);
             	response["MEM_RSS"].push(item["MEM_RSS"]);
             	response["MEM_PSS"].push(item["MEM_PSS"]);
				response["MEM_Anonymous"].push(item["MEM_Anonymous"]);
             	response["Storage"].push(item["Storage"]);
             	response["CPU"].push(item["CPU"]);
             } //for data in rows
          
            // console.log(response);
             
             common.sendJsonResponse(res,response);		   
       }); // con.query
       
       con.release();
     
    }, // pooledCon().then.function(con)
    function(err) {
       console.error("Error 001:",err);
    } // pooledCon().then.function(err);
    ); //pooledCon.then 
	
};
