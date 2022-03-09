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

var dHTML_TEMPLATE = {
   //Datatable: issueStatus dropdown box
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
   //
   // Interface
   //   'TEST_CASE_ID'    :  test_case_id
   //   'USER_NAME'       :  USER_NAME (e.g. Pollersp�ck Thomas)
   //   'DATETIME'        :  timestamp
   //   'STATUS_ENVELOPE' :  'hidden' or empty 
   //   'STATUS_TEXT'     :  text of selected item (?,a,l,n)
   //   'STATUS_TEXT_QUOTED'   :   selected item (questionmark,a,l,n)   
   //   'DROPDOWN_TYPE'   :  NOTPASSED or PASSED
   //   
   'ddIssueStatus' : '<div class="ddIssueStatus btn-group" style="margin-left:5px; margin-bottom:-1px;">'+
                        '<button id="btIssueStatus_${TEST_CASE_ID}" type="button" class="btn btn-default btn-xs dropdown-toggle gray" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
                           '<span class="round round-xs char_${STATUS_TEXT_QUOTED}_${DROPDOWN_TYPE}" style="margin-bottom:-3px;" >${STATUS_TEXT}</span> <span class="caret"></span>' +
                        '</button>' +
                        '<ul class="dropdown-menu" data-ddtype="${DROPDOWN_TYPE}" style="padding-top:0px">' +
                           
                           //info field who set the status
                           '<li style="background-color:#F0F0F0;">' +
                                 '<a id="btIssueStatus_MAILTO_${TEST_CASE_ID}" href="mailto:${USER_NAME}">' +
                                 '<span style="font-size:0.85em; color:#0000FF;"><b><i class="fa fa-clock-o" aria-hidden="true"></i> <span id="txtDateTime_${TEST_CASE_ID}">${DATETIME}</span></b></span></br>' +
                                 '<span id="txtUserName_${TEST_CASE_ID}">' +
                                    '<i id="symEnvelope_${TEST_CASE_ID}" class="fa fa-envelope-o pull-right ${STATUS_ENVELOPE}" style="margin-right:-17px; margin-top:-22px"></i> ${USER_NAME}' + 
                                 '</span>' +
                               '</a>' +
                           '</li>' +
                           '<li class="divider"></li>' +
                           //function selectors
                           '<li class="dropdown-header" style="background-color: #F7F7F7; margin-top: -10px;">test case menu</li>' +
                           
                           '<li class="divider" style="margin-top:0px"></li>' +
                           '<li style="margin-top: -8px"><a id="btIssueStatus_NE_${TEST_CASE_ID}" href="#"><span class="round round-xs char_questionmark_${DROPDOWN_TYPE}" style="margin-left:-10px; padding-bottom:6px;">?</span> new issue</a></li>' +
                           '<li><a id="btIssueStatus_AN_${TEST_CASE_ID}" href="#"><span class="round round-xs char_a_${DROPDOWN_TYPE}" style="margin-left:-10px; padding-bottom:6px;">a</span>  issue in analysis</a></li>' +
                           '<li><a id="btIssueStatus_LI_${TEST_CASE_ID}" href="#"><span class="round round-xs char_l_${DROPDOWN_TYPE}" style="margin-left:-10px; padding-bottom:6px;">l</span> link with ticket</a></li>' +
                           '<li><a id="btIssueStatus_NI_${TEST_CASE_ID}" href="#"><span class="round round-xs char_n_${DROPDOWN_TYPE}" style="margin-left:-10px; padding-bottom:6px;">n</span> no (new) issue</a></li>' +
                           '<li class="divider"></li>'+
                           '<li><a id="btIssueStatus_CO_${TEST_CASE_ID}" href="#" class="disabled"><i class="fa fa-comment-o" aria-hidden="true" style="margin-left:-10px;"></i> add comment ...</a></li>' +
                           '<li class="divider"></li>' +
                           '<li><a id="btIssueStatus_CL_${TEST_CASE_ID}" href="#"><i class="fa fa-clipboard" aria-hidden="true" style="margin-left:-10px;"></i> copy test URL ...</a></li>' +
                           '<li class="divider"></li>' +
                           '<li><a id="btIssueStatus_HI_${TEST_CASE_ID}" href="#"><i class="fa fa-history" aria-hidden="true" style="margin-left:-10px;"></i> history ...</a></li>' +
                        ' </ul>'+
                     '</div>',
   
   //Datatable: panel holding comments
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////  
   //
   // Interface
   //   'TEST_CASE_ID'    :  test_case_id
   //   'COMMENT_ID'      :  0 at start (first comment), each new comment of a test case increments the comment_id counter
   //   'COMMENT_TEXT'    :  Text of the comment
   //   'DATETIME'        :  timestamp  
   //   'USER_NAME'       :  USER_NAME (e.g. Pollersp�ck Thomas) 
   //   'USER_BADGE_COLOR'      :  color of user badge
   //   'USER_BADGE_LETTER'     :  character of user badge 
   //   'STATUS_EDITBUTTONS'    :  'hidden' if not visible                    
                     
   'panComment'    : '<div id="panComment_${TEST_CASE_ID}_${COMMENT_ID}" class="panel panel-info" style="margin-bottom:9px;">' +
                        '<div style="height: 25px;padding:2px;"  class="panel-heading">'+ 
                        '<div class="row">' +
                           '<div class="col-sm-7" style="white-space: nowrap;">' +
                             '<span class="round round-comment" style="background-color:${USER_BADGE_COLOR}; margin-top:-3px;margin-left:-15px;">${USER_BADGE_LETTER}</span>' +
                             '<span style="font-size:0.85em; color:#0000FF; margin-top:-1px;"><b> <i class="fa fa-clock-o" aria-hidden="true"></i> <span id="txtCommentDateTime_${TEST_CASE_ID}">${DATETIME}</span></b></span>'+' <span>${USER_NAME}</span>' +
                           '</div>' +
                           '<div class="col-sm-5" style="float:right;">'+
                              // dropdownbox of comments
                              //'<div class="pull-right ${STATUS_EDITBUTTONS}" style="background-color: #D9EDF7; border: 2px solid #D9EDF7; border-radius: 4px; display: inline-block; margin-top:-10px; margin-right:-4px;" >' +
                              '<div class="panel-info-functions pull-right ${STATUS_EDITBUTTONS} ">' +
                              '<div class="ddCommentFeatures btn-group pull-right">'+
                                 '<button id="btCommentFeatures_${TEST_CASE_ID}" type="button" class="btn btn-default btn-sm dropdown-toggle gray" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
                                    '<span class="caret"></span>' +
                                 '</button>' +
                                 '<ul class="dropdown-menu" style="">' +
                                    '<li><a id="btCommentFeatures_DEL_${TEST_CASE_ID}" style="cursor: pointer" onClick="deleteComment(\'${TEST_CASE_ID}\',${COMMENT_ID});"><i class="fa fa-eraser fa-1x"></i> delete comment</a></li>' +
                                 '</ul>'+
                              '</div>' +
                              // edit/save button
                              '<button type="button" class="btn btn-default btn-sm pull-right" onClick="editComment_save(\'${TEST_CASE_ID}\',${COMMENT_ID})"><i class="fa fa-save fa-1x"></i></button>' +
                              '<button type="button" class="btn btn-default btn-sm pull-right" onClick="editComment_edit(\'${TEST_CASE_ID}\',${COMMENT_ID})"><i class="fa fa-edit fa-1x"></i></button>' +
                              '</div>' +
                           '</div>'+
                        '</div>' +
                      '</div>' +   
                      '<div id="editComment_${TEST_CASE_ID}_${COMMENT_ID}" class="panel-body" style="padding:5px; ">${COMMENT_TEXT}</div>' +
                     '</div>',
   
    //Datatable: issue column Ticket buttons
    //
    // Interface
    //   'TEST_CASE_ID'    :  test_case_id   
    //   'LINK_ID'         :  0 at start (first link), each new link of a test case increments the link_id counter
    //   'BTN_STYLE'       :  'info' as default. Any other bootstrap style
    //   'BTN_URL'         :  external Ticket URL
    //   'BTN_TEXT'        :  Text to be displayed at button (RTC-NNNNN, G3GB_NNNN)
    //   'STATUS_DELETE'   :  'hidden' for tickets which come from TML code (can't be deleted, TML code must be changed)                     
                     
   'btnTicket'     : '<div id="btnTicket_${TEST_CASE_ID}_${LINK_ID}" class="btn-group">' +
                        '<a type="button" class="btn btn-xs btn-${BTN_STYLE}" href="${BTN_URL}" target="_blank">${BTN_TEXT}</a>' +
                        '<button type="button" class="btn btn-xs btn-default ${STATUS_DELETE}" onClick="deleteTicketLink(\'${TEST_CASE_ID}\',${LINK_ID})"><i style="font-size: 0.85em; color: #BBB;" class="fa fa-times"></i></button>' +
                     '</div></br>', 

   //header for history entries
   ///////////////////////////////////////////////////////////////////////////////////////////////////////////////  
   //
   // Interface
   //   'DATETIME'        :  timestamp  
   //   'USER_NAME'       :  USER_NAME (e.g. Pollersp�ck Thomas) 
   //   'USER_BADGE_COLOR'      :  color of user badge
   //   'USER_BADGE_LETTER'     :  character of user badge 
   //   'ACTION'                :  action done in history (e.g. "update comment"
   //   'ICON'                  :  icon to be displayed in front of "ACTION" 
   //   'BADGE_NUMBER'          :  e.g. 2 in case of the second comment     
   //   'HISTORY_BODY'          :  body content of this history listitem                   
   'historyListItem' :  '<div class="list-group-item history-listitem" style="margin-bottom: -15px;">' +
                           '<div class="row">' +
                             '<div class="col-sm-7" style="white-space: nowrap;">' +
                               '<span class="round round-comment" style="background-color:${USER_BADGE_COLOR}; margin-top:-3px;margin-left:-10px;">${USER_BADGE_LETTER}</span>' +
                               '<span style="font-size:0.85em; color:#0000FF; margin-top:-1px;"><b> <span style="padding-left: 3px;">${DATETIME}</span></b></span>'+' <span>${USER_NAME}</span>' +
                             '</div>' +
                             '<div class="col-sm-5" style="white-space: nowrap;">' +
                                '<span class="pull-right label label-warning" style="font-size: 0.9em;"><i class="fa ${ICON}"></i> ${ACTION} <span class="badge" style="font-size: 0.70em;">${BADGE_NUMBER}</span></span>' +
                             '</div>' +
                           '</div>' +      
       
                           '<div class="history-body">' +
                             '${HISTORY_BODY}' +
                           '</div>' + 
                        '</div>',

    //panel holding comments for history entries
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////  
    //
    // Interface
    //   'COMMENT_TEXT'    :  Text of the comment           
    'historyPanComment'  : '<div class="panel panel-info">' +
                              '<div class="panel-heading hidden" style="height: 0px;; padding: 0px;"></div>'+  
                              '<div class="panel-body" style="padding:5px; ">${COMMENT_TEXT}</div>' +
                           '</div>',
    
    //TML header content of a executed TML case file
    //used by data table
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////  
    //
    // Interface
    // TESTTOOLCONFIGURATION_TESTTOOLNAME       
    // TESTTOOLCONFIGURATION_TESTTOOLVERSIONSTRING
    // TESTTOOLCONFIGURATION_PROJECTNAME       
    // TESTTOOLCONFIGURATION_LOGFILEENCODING
    // TESTTOOLCONFIGURATION_PYTHONVERSION       
    // TESTTOOLCONFIGURATION_TESTFILE            
    // TESTTOOLCONFIGURATION_LOGFILEPATH          
    // TESTTOOLCONFIGURATION_LOGFILEMODE          
    // TESTTOOLCONFIGURATION_CTRLFILEPATH        
    // TESTTOOLCONFIGURATION_CONFIGFILE          
    // TESTTOOLCONFIGURATION_CONFNAME             
    // TESTFILEHEADER_AUTHOR                      
    // TESTFILEHEADER_PROJECT                     
    // TESTFILEHEADER_TESTFILEDATE                
    // TESTFILEHEADER_VERSION_MAJOR               
    // TESTFILEHEADER_VERSION_MINOR             
    // TESTFILEHEADER_VERSION_PATCH              
    // TESTFILEHEADER_KEYWORD                    
    // TESTFILEHEADER_SHORTDESCRIPTION           
    // TESTEXECUTION_USERACCOUNT                  
    // TESTEXECUTION_COMPUTERNAME                
    // TESTREQUIREMENTS_DOCUMENTMANAGEMENT        
    // TESTREQUIREMENTS_TESTENVIRONMENT                                   
    // TEST_TIME_START
    // TEST_TIME_END
    // UUID                           
    'tmlHeader'         :  '<div><pre>' +
                           '> <span class="TMLHeaderTitle">[Test started: ${TEST_TIME_START}]</span><br>' +
                           '<br>'+
                           '> <span class="TMLHeaderTitle">[Test tool configuration: \'${TESTTOOLCONFIGURATION_CONFNAME}\']</span><br>' +
                           '  * Test tool name.....: ${TESTTOOLCONFIGURATION_TESTTOOLNAME}<br>' +
                           '  * Test tool version..: ${TESTTOOLCONFIGURATION_TESTTOOLVERSIONSTRING}<br>' +
                           '  * Project name.......: ${TESTTOOLCONFIGURATION_PROJECTNAME}<br>' +
                           '  * Logfile encoding...: ${TESTTOOLCONFIGURATION_LOGFILEENCODING}<br>' +
                           '  * Python version.....: ${TESTTOOLCONFIGURATION_PYTHONVERSION}<br>' +
                           '  * Test file..........: ${TESTTOOLCONFIGURATION_TESTFILE}<br>' +
                           '  * Log file path......: ${TESTTOOLCONFIGURATION_LOGFILEPATH}<br>' +
                           '  * Log file mode......: ${TESTTOOLCONFIGURATION_LOGFILEMODE}<br>' +
                           '  * Ctrl file path.....: ${TESTTOOLCONFIGURATION_CTRLFILEPATH}<br>' +
                           '  * Config file........: ${TESTTOOLCONFIGURATION_CONFIGFILE}<br>' +
                           '  * UUID...............: ${UUID}<br>' +
                           '<br>' +
                           '> <span class="TMLHeaderTitle">[Test file header]</span><br>' +
                           '  * Author.............: ${TESTFILEHEADER_AUTHOR}<br>' +
                           '  * Project............: ${TESTFILEHEADER_PROJECT}<br>' +
                           '  * Source file date...: ${TESTFILEHEADER_TESTFILEDATE}<br>' +
                           '  * Source file version: ${TESTFILEHEADER_VERSION_MAJOR} / ${TESTFILEHEADER_VERSION_MINOR} / ${TESTFILEHEADER_VERSION_PATCH}<br>' +
                           '  * Keyword............: ${TESTFILEHEADER_KEYWORD}<br>' +
                           '  * Short description..: ${TESTFILEHEADER_SHORTDESCRIPTION}<br>' +
                           '<br>' +
                           '> <span class="TMLHeaderTitle">[Test execution]</span><br>' +
                           '  * User account.......: ${TESTEXECUTION_USERACCOUNT}<br>' +
                           '  * Computer name......: ${TESTEXECUTION_COMPUTERNAME}<br><br>' +
                           '> <span class="TMLHeaderTitle">[Test requirements]</span><br>' +
                           '  * Document management: ${TESTREQUIREMENTS_DOCUMENTMANAGEMENT}<br>' +
                           '  * Test environment...: ${TESTREQUIREMENTS_TESTENVIRONMENT}<br>' +
                           '<br>' +
                           '> <span class="TMLHeaderTitle">[Test done: ${TEST_TIME_END}]</span><br>' +
                           '${EXTENDED_TMLHEADER}' +                     
                           '</pre></div>',   
    //Extended TML header content of testbench config and preprocessor parameters
    //These info are not existing for old tests so the exetended-tmlHeader will be invisible for old tests
    //used by data table
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////  
    //
    // Interface
    // TESTBENCHCONFIG_NAME       
    // TESTBENCHCONFIG_DATA                                                 
    // PREPROCESSOR_PARAMETERS                                                 
    'extended-tmlHeader':  '<br>' +
                           '> <span class="TMLHeaderTitle">[${TESTBENCHCONFIG_NAME}]</span><br>' +
                           '<span class="TMLHeaderJSON">${TESTBENCHCONFIG_DATA}<br></span>' +
                           '<br>' +
                           '> <span class="TMLHeaderTitle">[Preprocessor Parameters${PREPROCESSOR_FILTER}]</span><br>' +  
                           '<span class="TMLHeaderTable">${PREPROCESSOR_PARAMETERS}</span>',

    //html icon element corresponding to version status
    'iconStateVersion'  : '<span>' + 
                            '<span class="fa-stack">' +
                              '<i style="color: ${STATE_COLOR};" class="fa fa-stack-1x fa-square fa-2x"></i>' +
                              '<i style="color: black;" class="fa fa-stack-1x ${TESTTYPE_CLASSES}"></i>' +
                            '</span>' +
                            '<span class="fa-stack" style="margin-left: -22px; margin-bottom: -10px">' +
                              '<i style="font-size: 10px; color: ${STATE_COLOR};" class="fa fa-stack-1x fa-square fa-2x"></i>' +
                              '<i style="font-size: 7px; color: black;" class="fa fa-stack-1x ${STATE_CLASSES}"></i>' +
                            '</span>' +
                            '<span class="text" style="margin-left:-3px;">${SW_VERSION}</span>' +
                          '</span>',

   // html template for 404 page not found
   'pageNotFound'       :  '<div class="row row-dashboard">' +
                              '<div class="col-lg-12">' +
                                  '<h1 class="page-header" style="font-size: 1.0em;"> Page not found - 404</h1>' +
                               '</div>' +
                               '<div class="col-lg-12">' +
                                  '<table align="center" style="border: 0px;">' +
                                     '<tr>' +
                                        '<th>' +
                                           '<h2><i class="fa fa-exclamation-triangle text-danger"></i> Oops, page not found!</h2>' +
                                           '<br>' +
                                           '<p class="h5">We are sorry that we could not find that page for you! It could have been moved, or possibly deleted. Please try one of the following:</p>' +
                                           
                                           '<ul>' +
                                           '<li><p class="h5">If you bookmarked the page, please use the navigation at the left side to find what you are looking for.</p></li>' +
                                           '<li><p class="h5">If you typed in the address, be sure it was entered correctly.</p></li>' +
                                           '<li><p class="h5">If you clicked on a link from another page, use your back button and try again.</p></li>' +
                                           '<li><p class="h5">If you still need help finding what you are looking for, visit our <a href="./index.html">start page</a>.</p></li>' +
                                           '</ul>' +
                                        '</th>' +
                                     '</tr>' +
                                  '</table>' +
                               '</div>' +
                           '</div>'
}; //dHTML_TEMPLATE

var dMENU_TEMPLATE = { 
   
   'testSuiteState' : {
                        'in progress' : { 'style' : ['fa fa-refresh fa-spin fa-fw','#aefcf9'],
                                          'menu'  : [ ['new report','fa fa-star','#efefef'],
                                                      ['test died','fa fa-exclamation-triangle','#ff5656'],
                                                    ],
                                        },
                                       
                        //directly include icon: 'test died' :   { 'style' : ['icon_dead','#ff5656'],                                        
                        'test died' :   { 'style' : ['fa fa-exclamation-triangle','#ff5656'],
                                          'menu'  : [ ['new report','fa fa-star','#efefef'], 
                                                      //['delete report','','']  
                                                    ],
                                         },

                        'new report' :  { 'style' : ['fa fa-star','#efefef'],
                           
                                          'menu'  : [ ['releasing','fa fa-ellipsis-h','#b5d1ff'],
                                                      ['released','fa fa-check','#5ef97d'],
                                                      ['limited release','fa fa-thumbs-o-down','#ffc4c4'],
                                                      ['blocked release','fa fa-ban','#ff9696'],
                                                      
                                                      ['divider','',''],
                                                      
                                                      ['test build','fa fa-question','#f7f4aa'],
                                                      
                                                      ['divider','',''],
                                                      
                                                      ['test died','fa fa-exclamation-triangle','#ff5656']
                                                      //['delete report','fa fa-eraser',''] 
                                                    ],
                                        },
                        'releasing' :   { 'style' : ['fa fa-ellipsis-h','#b5d1ff'],
                                          'menu'  : [['released','fa fa-check','#5ef97d'],
                                                     ['limited release','fa fa-thumbs-o-down','#ffc4c4'],
                                                     ['blocked release','fa fa-ban','#ff9696'],
                                                     
                                                     ['divider','',''],
                                                     
                                                     ['new report','fa fa-star','#efefef'], 
                                                    ],
                                        },
                        'test build' :  { 'style' : ['fa fa-question','#f7f4aa'],
                                           'menu'  : [['new report','fa fa-star','#efefef'], ],
                                         },
                        'released' :    { 'style' : ['fa fa-check','#5ef97d'],
                                          'menu'  : [['new report','fa fa-star','#efefef'], ],
                                        },
                        
                        'blocked release' :  { 'style' : ['fa fa-ban','#ff9696'],
                                               'menu'  : [['new report','fa fa-star','#efefef'], ],
                                             },
                        
                        'limited release' :  { 'style' : ['fa fa-thumbs-o-down','#ffc4c4'],
                                               'menu'  : [['new report','fa fa-star','#efefef'], ],
                                             },                                                                                       
                      },
}; //dMENU_TEMPLATE

function templateToHtml(templateName,dData){
   var sHtml=dHTML_TEMPLATE[templateName];
   
   //console.log(dData)
   
   _.each(dData,function(val,key){
      var replaceText="\\$\\{" + key.toUpperCase() + "\\}";
      
      var re=new RegExp(replaceText,"g");
      var sHtmlOld=sHtml;
      sHtml=sHtml.replace(re, val);
      if (sHtmlOld==sHtml){
         console.log("ATTENTION: template placeholders not used: '" + templateName +"' " + key.toUpperCase());   
      }
   });
   
   
   var arPlaceHolder=sHtml.match(/\$\{.*?\}/g);
   if (arPlaceHolder && arPlaceHolder.length>0){
      console.log("ATTENTION: template placeholders open: '" + templateName +"' " + arPlaceHolder.toString());
   }
   
   return sHtml;
 };