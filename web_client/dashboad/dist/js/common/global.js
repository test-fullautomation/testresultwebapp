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

//internal global variables
////////////////////////////////////////////////////
var dQUERY_STRING = {};
var dPAGE_CHARTS = {};
var bSELECT_LISTENERS_INSTALLED = false;

//global variables for configuration
////////////////////////////////////////////////////
var dNAV      = { branch: [], variant: [], version : [] };
//this provides the initial values for branch and variant.
//use undefined if not known
var dNAV_INIT = { branch: undefined, variant: undefined };
//var dNAV_INIT = { branch: 'main', variant: 'rnaivi' };

//domain must be same like WebApp Server, otherwise
//access will be blocked due to cross site access
var sDOMAIN = 'http://localhost';
var sSubFolder = '/CMD_BVT';
var oIntervalTimer;
var bLoading = false;
var sPreStackVersions = "";

// global variables for reloading content for 'in progress' result
var bForceUpdateDashboard = false;
var oReloadTimer;       //timer object
var iReloadSecond = 5;  //time(second) to reload content