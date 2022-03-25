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

var uuid = require('node-uuid');

module.exports = common;

function common(){
	
};

common.prototype.sendJsonResponse = function sendJsonResponse(res,response){
   // allow cross-site access
   res.setHeader("Access-Control-Allow-Origin", global.domain);
   res.setHeader("Access-Control-Allow-Credentials", true);
   
   //deactivate caching
   res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate"); // HTTP 1.1.
   res.setHeader("Pragma", "no-cache"); // HTTP 1.0.
   res.setHeader("Expires", "0"); // Proxies.
   
   //finally send JSON message
   res.writeHead( 200, { "Content-Type": "application/json"});
   res.write(JSON.stringify(response));
   res.end();
}

common.prototype.sessUpdate = function sessUpdate(req){
	req.session.uuid=uuid.v4();
	req.session.save();
}

common.prototype.mapToShortComponentNames = function mapToShortComponentNames(sName){
   
   var mapNames={ 'AutomotiveGateway'          : 'AutoGW',
                  'Reception/Tuner'            : 'Rec/Tun',
                  'Reception/TunerMaster'      : 'Rec/TunMaster',
                  'Connectivity/Telephone'     : 'Con/Phone',
                  'Connectivity/PhoneBook'     : 'Con/PhnBk',
                  'Connectivity/BTSettings'    : 'Con/BTSett',
                  'MediaPlayer'                : 'Mplay',
                  'SW_UPDATE'                  : 'SWU',
                  'Conn/BTSettings'            : 'Con/BTSett',
                  'Conn/PhoneBook'             : 'Con/PhnBk',
                  'Phone'                      : 'Con/Phone',
                  'Conn/Telephone'             : 'Con/Phone'
                };
   
   var sRetName=sName;
   if (sName in mapNames){
      sRetName=mapNames[sName];
   }
   
   return sRetName;
   
}

common.prototype.mapToLongComponentNames = function mapToLongComponentNames(sName){
   
   var mapNames={ 'AutoGW'        : 'AutomotiveGateway',          
                  'Rec/Tun'       : 'Reception/Tuner',            
                  'Rec/TunMaster' : 'Reception/TunerMaster',      
                  'Con/Phone'     : 'Connectivity/Telephone',     
                  'Con/PhnBk'     : 'Connectivity/PhoneBook',     
                  'Con/BTSett'    : 'Connectivity/BTSettings',    
                  'Mplay'         : 'MediaPlayer',                
                  'SWU'           : 'SW_UPDATE'                  
                };
   
   var sRetName=sName;
   if (sName in mapNames){
      sRetName=mapNames[sName];
   }
   
   return sRetName;
   
}

common.prototype.triggerJenkinsJob = function triggerJenkinsJob(sBVTBuildNo){
   if(Number.isInteger(Number(sBVTBuildNo))){
      process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
      var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
      var sResURL = global.jenkinsOptions.host+"/job/"+global.jenkinsOptions.jobName
                  +"/buildWithParameters?token="+global.jenkinsOptions.jobToken+"&BVT_BUILD_NUMBER="+sBVTBuildNo;
      // in case port is provided in Jenkins options 
      if (global.jenkinsOptions.port != ''){
         sResURL = global.jenkinsOptions.host+":"+global.jenkinsOptions.port+"/job/"+global.jenkinsOptions.jobName
                  +"/buildWithParameters?token="+global.jenkinsOptions.jobToken+"&BVT_BUILD_NUMBER="+sBVTBuildNo;
      }
      var method = "POST"
      var xhr = new XMLHttpRequest();
      xhr.open(method, sResURL, true, global.jenkinsOptions.user, global.jenkinsOptions.APIToken);
      xhr.onreadystatechange = function(){
         if(xhr.readyState==4){
            if (xhr.status==201) {  
               console.log("Trigger Jenkins job "+global.jenkinsOptions.jobName+" successfully!")
            } else {
               console.error("Error when triggering Jenkins job. Reason: ", xhr.statusText); 
            }
         }
      }
      xhr.send();
   }else {
      console.error("Error when triggering Jenkins job. Reason: BVT build number: '"+sBVTBuildNo+"' is not a integer.")
   }
}