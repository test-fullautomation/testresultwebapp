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


module.exports = selectBase;

function selectBase(){
	
};

selectBase.prototype.selectBranch = function selectBranch (query, req, res){
	
	//console.log(query);
	
	pooledCon()
    .then(function(con) {
       con.query("select distinct(branch) from " + global.mySQLOptions.database +  ".tbl_prj order by branch ASC", 
       		     function(err,rows){
        
    	  var response = { data: [] };  
    	   
    	  for (var data in rows){
    		 var item=rows[data];
    	     response['data'].push(item['branch']);
    	  };
    	  
    	  response['selected']=global.ndCache.get(req.sessionID + ".branch");
             
    	  common.sendJsonResponse(res,response);	   
       }); // con.query
       
       con.release();
     
    }, // pooledCon().then.function(con)
    function(err) {
       console.error("Error 001:",err);
    } // pooledCon().then.function(err);
    ); //pooledCon.then 
	
	
};

selectBase.prototype.selectProjectVariant = function selectProjectVariant (query, req, res){
	
	//console.log(query);
   
   global.ndCache.set(req.sessionID + ".branch", query['branch'].trim());
   
	pooledCon()
    .then(function(con) {
       //con.query("select distinct(CONCAT(project, \".\", variant)) as project_variant from testdb.tbl_prj order by project ASC", 
       con.query("select distinct(project) from " + global.mySQLOptions.database +  ".tbl_prj where branch='" + query['branch'].trim() + "' order by project ASC", 
       		     function(err,rows){
        
    	  //console.log(rows); 
    	   
    	  var response = { data: [] };  
    	   
    	  for (var data in rows){
    		 var item=rows[data];
    	     response['data'].push(item['project']);
    	  };
        
    	  response['selected']=global.ndCache.get(req.sessionID + ".project");
    	  
    	  common.sendJsonResponse(res,response);		   
       }); // con.query
       
       con.release();
     
    }, // pooledCon().then.function(con)
    function(err) {
       console.error("Error 001:",err);
    } // pooledCon().then.function(err);
    ); //pooledCon.then 
	
	
};

selectBase.prototype.selectVersion = function selectVersion (query, req, res){
	
	//console.log(query);
   
   global.ndCache.set(req.sessionID + ".project", query['project'].trim());
	
	pooledCon()
    .then(function(con) {
       
        //ATTENTION!!!
        //In order to avoid problems currently the "in progress" state is not returned.
        //This need to be activated if "in progress" data should be displayed
       
        var sql="select test_result_id, version_sw_target, result_state, category_main, category_sub from " + global.mySQLOptions.database +  ".tbl_result "+ 
                "   where branch='" + query['branch'].trim() + "' and project='"+ query['project'].trim() + 
               //  "' and result_state!='in progress'" +
                "' order by time_start DESC";	
    	     
       //console.log(sql); 
        
       con.query(sql, function(err,rows){
        
    	  //console.log(rows); 
    	   
    	  var response = { data: [] };  
    	   
    	  for (var data in rows){
    		 var item=rows[data];
    	     response['data'].push( { "id" : item['test_result_id'], 
    	    	                      "text" : item['version_sw_target'],
    	    	                      "state": item['result_state'] ,
    	    	                      "category_main": item['category_main'] ,
    	    	                      "category_sub" : item['category_sub'] 
    	    	                      } ); 
    	  };
    	  
    	  response['selected']=global.ndCache.get(req.sessionID + ".version");
    	  
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

selectBase.prototype.selectComponent = function selectComponent(query, req, res){

   global.ndCache.set(req.sessionID + ".version", query['version'].trim());
	
	pooledCon()
      .then(function(con) {
       
        //ATTENTION!!!
        //In order to avoid problems currently the "in progress" state is not returned.
        //This need to be activated if "in progress" data should be displayed
       
         var sql="select component from " + global.mySQLOptions.database +  ".evtbl_failed_unknown_per_component where " +
                "test_result_id='" + query['version'].trim() + "'";	
    	     
         //console.log(sql); 
        
         con.query(sql, function(err,rows){
        
    	      var response = { data: [] };  
    	   
            for (var data in rows){
               var item=rows[data];
               response['data'].push(item['component']);
            };
        
    	      response['selected']=global.ndCache.get(req.sessionID + ".component");
    	  
    	      common.sendJsonResponse(res,response);		   
         }); // con.query
       
         con.release();
     
      }, // pooledCon().then.function(con)
      function(err) {
         console.error("Error 001:",err);
      } // pooledCon().then.function(err);
   ); //pooledCon.then 
};

selectBase.prototype.updateNav = function updateNav (query, req, res){
   
   //console.log(query);
   
   if (query['branch']){
      global.ndCache.set(req.sessionID + ".branch", query['branch'].trim());
   } else {
      global.ndCache.set(req.sessionID + ".branch", undefined );   
   }
   if (query['project']){
      global.ndCache.set(req.sessionID + ".project", query['project'].trim());
   } else {
      global.ndCache.set(req.sessionID + ".project", undefined );   
   }
   if (query['version']){
      global.ndCache.set(req.sessionID + ".version", query['version'].trim());
   } else {
      global.ndCache.set(req.sessionID + ".version", undefined ); 
   }
      
   
   var response = { data : "OK" };
   common.sendJsonResponse(res,response);        
 
};
