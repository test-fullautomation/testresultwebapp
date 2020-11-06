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

function getFromDB(path,params,callback){
 	
    //console.log(path + " --- " + params);
   
	 var deferred=$.Deferred();
	
	 $.ajax({
	      type: 'GET',
	      url: sDOMAIN +':3000' + path +"?" + params,
	      crossDomain: true,
	      //cache:false causes that a timestamp is added to
	      //            each request
	      cache: true,
	      data: "",
	      dataType: 'json',
	      async : true,
	            
	      headers: {
	                 //'Accept-Encoding' : 'gzip,deflate'
	               }, 	            
	      
	      xhrFields: { withCredentials:true } // required that coockies are sent
	      
	      })
	      
	     .done( function(response) 
	      {
	    	  callback(response, deferred);
	    	  
	      }) // ajax success
	      
	     .fail( function (response) 
	      {
	          console.warn(response);
	          //missing heartbeat response should not create an error popup.
	          if (path.toLowerCase().indexOf("heartbeat") < 0){
	             //alert("An unexpected error occurred. \nCause: GET < '" + sDOMAIN +':3000' + path +"?" + params + "'");
	          }
	      }); //ajax error
	        
	return deferred; 
	
} // function getFromDB

function postToDB(path,data,callback){
   
    //console.log(path + " --- " + data);
 	
	 var deferred=$.Deferred();
	
	 $.ajax({
	      type: 'POST',
	      url: sDOMAIN +':3000' + path,
	      crossDomain: true,
	      data: data,
	      dataType: 'json',
	      async : true,
	      
	      xhrFields: { withCredentials:true } 
	      })
	      
	     .done( function(response) 
	      {
	    	  callback(response, deferred);
	    	  
	      }) // ajax success
	      
	     .fail( function (response) 
	      {
	          console.warn(response);
	          //alert("An unexpected error occurred- \nCause: POST > '" + sDOMAIN +':3000' + path + "'");
	      }); //ajax error
	        
	return deferred; 
	
} // function sendToDB

function heartBeat() {
    setTimeout(function(){ 
    	                    getFromDB("/heartbeat","", function( ) { heartBeat(); });
                         },
               1000 * 60 );
} //function heartBeat

heartBeat();  // start the heartbeat