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

var crypto = require("crypto");
var constants = require("constants");

global.domain = 'http://localhost';

global.mySQLOptions = {
   host     : 'your_mysql_host', 
   port     : 3306,
   
   user     : 'your_username',
   password : 'your_password',
   database : 'your_database' 
    
}

global.mySQLStoreOptions = {
   host     : 'your_mysql_host',
   port     : 3306,
   user     : 'your_session_username',
   password : 'your_session_password',
   database : 'express_session'
};

global.sessionOptions = {
   key     : 'your_session',
   name    : 'your_session',
   secret  : 'your_secret',
   expires : new Date("2025-01-01")
};



global.sessionTTL = 60 * 5;
var NodeCache = require("node-cache");
global.ndCache = new NodeCache( { stdTTL      : global.sessionTTL,  // 5 minutes ttl for persisted objects => to be rewinded by heartbeat
	                               checkperiod : global.sessionTTL   // check all 5 minutes if object are expired
	                             });

global.auth = {
   privateKey: "-----BEGIN RSA PRIVATE KEY-----\n" +
               "your_RSA_PRIVATE_KEY" +
               "-----END RSA PRIVATE KEY-----",
      
   publicKey:  "-----BEGIN PUBLIC KEY-----\n" +
               "your_RSA_PUBLIC_KEY" +
               "-----END PUBLIC KEY-----"   
};

var pwd = "your_password";
try {
   pwd=crypto.privateDecrypt({ key : global.auth.privateKey,
                               padding : constants.RSA_PKCS1_PADDING }, 
                             new Buffer(  
                             'your_encrypted_password', "base64"
                             )
                            ).toString("utf8")
} catch(err) {
}

global.activeDirectoryOptions = { 
      url: 'ldap://your_ldap_server',
      baseDN: 'DC=your_domain,DC=your_toplevel_domain',
      username: 'your_user_name',
      password:  pwd,
                              
      referrals: {
                    enabled: true,
                    excluded: [ ]
                 }
   }; 

global.bPublishReleasedResult = true;
global.jenkinsOptions = {
   host     : "https://your_jenkins_host",
   port     : "",
   jobName  : "Publish_to_RQM",
   jobToken : "your_job_token",
   user     : "your_username",
   APIToken : "your_jenkins_API_token",
}

module.exports = global;