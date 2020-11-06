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

var enHistoryClass   = { 'issueStatusChange'     : 'issueStatusChange',
                         'issueCommentChange'    : 'issueCommentChange',
                         'issueLinkChange'       : 'issueLinkChange',
                         'interpretationChange'  : 'interpretationChange',
                         'tagChange'             : 'tagChange',
                         'testSuiteStateChange'  : 'testSuiteStateChange'
                       };

var enHistoryAction  = { 'changedIssueStatus' : 'changed issue status',
      
                         'updatedComment' : 'updated comment',
                         'deletedComment' : 'deleted comment',
      
                         'addedIssueLink'        : 'added issue link',
                         'deletedIssueLink'      : 'deleted issue link',
                         'deletedLastIssueLink'  : 'deleted last issue link',  
                         
                         'updatedInterpretation' : 'updated interpretation',
                         
                         'addedTag'              : 'added tag',
                         'deletedTag'            : 'deleted tag',
                         
                         'changedTestSuiteState' : 'changed test suite state'
                       };

var enHistorySource   = { 'test_case'  : 'test_case',
                          'test_suite'  : 'test_suite'
                        };

function _createCommentHistoryEntry(historyEntry){
   var change_data=JSON.parse(historyEntry['change_data']); 
   
   var sBody='';
   if (change_data['comment']!=undefined && change_data['comment']!=""){
      sBody=templateToHtml('historyPanComment',{ 
                                                 'COMMENT_TEXT'    : b64DecodeUnicode(change_data['comment']),
                          });
   };
   
   var sCommentEntry=templateToHtml('historyListItem',{  'DATETIME'        :  getTimeToText(historyEntry['time_stamp']),
                                                         'USER_NAME'       :  historyEntry['user_name'],
                                                         'USER_BADGE_COLOR'    : getUserColor(historyEntry['user_name']),
                                                         'USER_BADGE_LETTER'   : historyEntry['user_name'].split(" ")[1].charAt(0).toUpperCase(),
                                                         'ACTION'                :  historyEntry['change_text'],
                                                         'ICON'                  :  'fa-comment-o',
                                                         'BADGE_NUMBER'          :  change_data['number'],
                                                         'HISTORY_BODY'          :  sBody
                                                      });

   return sCommentEntry;
}

function _createLinkHistoryEntry(historyEntry){
   var change_data=JSON.parse(historyEntry['change_data']); 
   
   //only change reason can be that link was deleted.
   //therefore no body required
   var sBody='';
   
   var sCommentEntry=templateToHtml('historyListItem',{  'DATETIME'        :  getTimeToText(historyEntry['time_stamp']),
                                                         'USER_NAME'       :  historyEntry['user_name'],
                                                         'USER_BADGE_COLOR'    : getUserColor(historyEntry['user_name']),
                                                         'USER_BADGE_LETTER'   : historyEntry['user_name'].split(" ")[1].charAt(0).toUpperCase(),
                                                         'ACTION'                :  historyEntry['change_text'],
                                                         'ICON'                  :  'fa-link',
                                                         'BADGE_NUMBER'          :  change_data['number'],
                                                         'HISTORY_BODY'          :  sBody
                                                      });

   return sCommentEntry;
}

function _createTagHistoryEntry(historyEntry){
   var change_data=JSON.parse(historyEntry['change_data']); 
   
   //only change reason can be that link was deleted.
   //therefore no body required
   var sBody='<span class="label label-info">' + change_data['action_data'] + '</span>';
   
   var sCommentEntry=templateToHtml('historyListItem',{  'DATETIME'        :  getTimeToText(historyEntry['time_stamp']),
                                                         'USER_NAME'       :  historyEntry['user_name'],
                                                         'USER_BADGE_COLOR'    : getUserColor(historyEntry['user_name']),
                                                         'USER_BADGE_LETTER'   : historyEntry['user_name'].split(" ")[1].charAt(0).toUpperCase(),
                                                         'ACTION'                :  historyEntry['change_text'],
                                                         'ICON'                  :  'fa-tag',
                                                         'BADGE_NUMBER'          :  '',
                                                         'HISTORY_BODY'          :  sBody
                                                      });

   return sCommentEntry;
}

function _createStatusHistoryEntry(historyEntry){
   var change_data=JSON.parse(historyEntry['change_data']); 
  
   var sStatusText='new issue';
   switch (change_data['issuestatus']){
   case '?':
      sStatusText='new issue';
      break;
   case 'a':
      sStatusText='issue in analysis';
      break;
   case 'l':
      sStatusText='link with ticket';
      break;
   case 'n':
      sStatusText='no (new) issue';
      break;   
      
   default:
      sStatusText='new issue';
   };
   
   var ddType=change_data['ddtype'];
   if (ddType==undefined) { ddType="NOTPASSED"; };
   
   var sBody='<span><span class="round round-xs char_' + ((change_data['issuestatus']=="?") ? "questionmark" : change_data['issuestatus']) + '_' + ddType +'" style="margin-bottom:-3px;">' + change_data['issuestatus'] + '</span> ' + sStatusText + '</span>';
   
   var icon="fa-cog";
   if (historyEntry['change_text']==enHistoryAction.addedIssueLink){
      icon="fa-link";
   }

   var BTN_BADGE = ''; 
   if (change_data['action_data']!=undefined){
      var BTN_URL  = change_data['action_data'].split("####")[0];
      var BTN_TEXT = 'RTC-' + change_data['action_data'].split("####")[1]; 
      BTN_BADGE = change_data['action_data'].split("####")[2];  
      
      sBody += ' <div class="btn-group">' +
                  '<a type="button" class="btn btn-xs btn-info" href="' + BTN_URL + '" target="_blank">' + BTN_TEXT + '</a>' +
               '</div>';
   }
   
   var sStatusHistoryEntry=templateToHtml('historyListItem',{  'DATETIME'        :  getTimeToText(historyEntry['time_stamp']),
                                                               'USER_NAME'       :  historyEntry['user_name'],
                                                               'USER_BADGE_COLOR'    : getUserColor(historyEntry['user_name']),
                                                               'USER_BADGE_LETTER'   : historyEntry['user_name'].split(" ")[1].charAt(0).toUpperCase(),
                                                               'ACTION'                :  historyEntry['change_text'],
                                                               'ICON'                  :  icon,
                                                               'BADGE_NUMBER'          :  BTN_BADGE,
                                                               'HISTORY_BODY'          :  sBody
                                         });
   
   return sStatusHistoryEntry;
   
}

function _createInterpretationHistoryEntry(historyEntry){
   var change_data=JSON.parse(historyEntry['change_data']); 
   
   var sBody='';
   if (change_data['data']!=undefined && change_data['data']!=""){
      sBody=templateToHtml('historyPanComment',{ 
                                                 'COMMENT_TEXT'    : b64DecodeUnicode(change_data['data']),
                          });
   };
   
   var sCommentEntry=templateToHtml('historyListItem',{  'DATETIME'        :  getTimeToText(historyEntry['time_stamp']),
                                                         'USER_NAME'       :  historyEntry['user_name'],
                                                         'USER_BADGE_COLOR'    : getUserColor(historyEntry['user_name']),
                                                         'USER_BADGE_LETTER'   : historyEntry['user_name'].split(" ")[1].charAt(0).toUpperCase(),
                                                         'ACTION'                :  historyEntry['change_text'],
                                                         'ICON'                  :  'fa fa-exclamation-triangle',
                                                         'BADGE_NUMBER'          :  '',
                                                         'HISTORY_BODY'          :  sBody
                                                      });

   return sCommentEntry;
}

function _createTestSuiteStateHistoryEntry(historyEntry){
   var change_data=JSON.parse(historyEntry['change_data']); 
   
   var sSymbol   = dMENU_TEMPLATE['testSuiteState'][change_data['action_data']]['style'][0];
   var sBackColor=  dMENU_TEMPLATE['testSuiteState'][change_data['action_data']]['style'][1];
   
   sBackColor=LightenDarkenColor(sBackColor,-10);
   
   //only change reason can be that link was deleted.
   //therefore no body required
   var sBody='<button type="button" class="btn btn-default" style="background-color: ' + sBackColor + ';">' + 
             '<i class="' + sSymbol + '"></i> ' + change_data['action_data'] + '</button>';
   
   var sCommentEntry=templateToHtml('historyListItem',{  'DATETIME'        :  getTimeToText(historyEntry['time_stamp']),
                                                         'USER_NAME'       :  historyEntry['user_name'],
                                                         'USER_BADGE_COLOR'    : getUserColor(historyEntry['user_name']),
                                                         'USER_BADGE_LETTER'   : historyEntry['user_name'].split(" ")[1].charAt(0).toUpperCase(),
                                                         'ACTION'                :  historyEntry['change_text'],
                                                         'ICON'                  :  'fa fa-certificate',
                                                         'BADGE_NUMBER'          :  '',
                                                         'HISTORY_BODY'          :  sBody
                                                      });

   return sCommentEntry;
  
}

function createHistoryList(response){
   var sHistory='';
   
   //console.log(response);
   
   _.each(response,function(historyEntry){
      
      if (historyEntry['change_type']==enHistoryClass.issueStatusChange){
         sHistory+=_createStatusHistoryEntry(historyEntry);
      } else if (historyEntry['change_type']==enHistoryClass.issueCommentChange){
         sHistory+=_createCommentHistoryEntry(historyEntry);
      } else if (historyEntry['change_type']==enHistoryClass.issueLinkChange && historyEntry['change_text']!=enHistoryAction.addedIssueLink){
         sHistory+=_createLinkHistoryEntry(historyEntry);
      } else if (historyEntry['change_type']==enHistoryClass.interpretationChange){
         sHistory+=_createInterpretationHistoryEntry(historyEntry);
      } else if (historyEntry['change_type']==enHistoryClass.tagChange){
         sHistory+=_createTagHistoryEntry(historyEntry);
      } else if (historyEntry['change_type']==enHistoryClass.testSuiteStateChange){ 
         sHistory+=_createTestSuiteStateHistoryEntry(historyEntry);
      }
   });
   
   if (sHistory==''){
      sHistory="</br>This was never a change. Therefore there is no history available!";
   }
   
   
   return sHistory;
}