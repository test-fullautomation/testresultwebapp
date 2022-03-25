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

var global = require('./lib/global');

var express = require('express');
var compression = require('compression');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var app = express();
app.use(compression());

//for local GUI tests deliver static HTML 
//content from port 3000
// app.use(express.static("../web_client/dashboad/")); 
// app.use('/CMD_BVT', express.static('../web_client/dashboad'));

var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

var sessionStore = new MySQLStore(global.mySQLStoreOptions);

app.use(session({
    key    : global.sessionOptions.key,
    name   : global.sessionOptions.name,
    secret : global.sessionOptions.secret,
    store  : sessionStore,
    resave : true,
    saveUninitialized: false,
    cookie: { path : '/',
    	        secure: false, 
    	        httpOnly: false,
    	        expires: global.sessionOptions.expires
    	      }
}));

app.use(cookieParser());

app.use(bodyParser.json({limit: '50mb'}));                         // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' })); // for parsing application/x-www-form-urlencoded

require('./lib/routes/loginout.js')(app);
require('./lib/routes/authorized.js')(app);
require('./lib/routes/public.js')(app);
require('./lib/routes/db_charts.js')(app);
require('./lib/routes/db_statistics.js')(app);

app.listen(3000, function () {
  console.log('testdb_app successfully listening on port 3000!');
}); 






