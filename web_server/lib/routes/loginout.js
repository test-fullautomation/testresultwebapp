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

var crypto = require("crypto");
var constants = require("constants");

var global = require('../global');
var common = new (require('../common'))();

var ActiveDirectory = require('activedirectory');
               
var ad = new ActiveDirectory(global.activeDirectoryOptions);

module.exports = function(app){

   function loginfail(res){
      console.log(" Login failed!")
      var response = { data : "login_fail"};
      common.sendJsonResponse(res,response);	
   }
   	 
   // Login endpoint
   app.post('/login', function (req, res) {
      console.log("Processing: post > login");
      
      var pwdDecrypted = crypto.privateDecrypt({ key : global.auth.privateKey,
                                                 padding : constants.RSA_PKCS1_PADDING }, 
                                                 new Buffer(req.body.pwd, "base64"));
      pwdDecrypted=pwdDecrypted.toString("utf8");
      
      if (!req.body.usr || !req.body.dom || pwdDecrypted.trim()=='' ) {
         loginfail(res);   
      } else {
    	  ad.authenticate(req.body.usr.trim()+"@"+req.body.dom.trim()+".bosch.com", pwdDecrypted, function(err, auth) {
    	     if (err) {
    	       loginfail(res);   
    	       return;
    	     } // if (err)
      
    	     if (auth) {
    	    	 console.log("auth OK")
    	    	 
    	    	 ad.findUser(req.body.usr.trim(), function(err, user) {
    	    		  if (err || !user) {
    	    			 console.log(err)
    	    			 console.log(user['displayName'])
    	    			 loginfail(res);
    	    		  } else {
    	    			 console.log(user['displayName'])
    	    			  
    	    			 req.session.displayName = user['displayName']
    	    			 req.session.user   = req.body.usr.trim();
    	    			 req.session.domain = req.body.dom.trim();
    	    		    req.session.admin  = true;
    	    			
    	    			 console.log(" Login successful!")
    	    			 var response = { data : "login_success", displayName :  user['displayName'] };
    	    			 common.sendJsonResponse(res,response);	  
    	    			  
    	    		  }
    	    	 }); // ad.findUser
    	    	    
    	     } else {    //if (auth)
    	    	loginfail(res);   
    	     }
    	  });
    	  
          
      }
   });
   
   
   //returns if logged in for initialization after opening URL
   app.get('/loggedin', function (req, res) {
      console.log("Processing: get < loggedin");	
      
      var response = { 'usr' : req.session.user, 
   		            'displayName' : req.session.displayName, 
   		            'admin' :req.session.admin };
      
      //this is required, otherwise express will not send
      //the session cookie to the browser.
      //loggedin is called at the very beginning of a sessin,
      //therefore let the session cookie create here.
      common.sessUpdate(req);
      
      common.sendJsonResponse(res,response);	
   });
      
   // Logout endpoint
   app.get('/logout', function (req, res) {
      console.log("Processing: get < logout");	
      req.session.admin = false;
      
      console.log(" Logout successful!")
      var response = { data : "logout_success"};
      
      common.sendJsonResponse(res,response);	
   });
   
   // Logout endpoint
   app.get('/getPubKey', function (req, res) {
      console.log("Processing: get < pubKey");	
      
      var response = { pubKey : global.auth.publicKey };
      
      common.sendJsonResponse(res,response);	  
   });
   
   //Logout endpoint
   app.get('/heartbeat', function (req, res) {
      console.log("Processing: get < heartbeat");	
     
      var sKeys = global.ndCache.keys();
      _.each(sKeys,function(val){ 
    	                           if (val.startsWith(req.sessionID + ".")){    
   		                         //rewind TTL counter
   	                             global.ndCache.ttl(val, global.sessionTTL);
   	                           } 
     }) //_.each
    
     var response = { data : "heartbeat_success"};
     common.sendJsonResponse(res,response);	
   });
		
}