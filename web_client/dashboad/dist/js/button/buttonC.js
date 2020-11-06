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

function setIssueStatus(testCaseId, sStatusTxt, action, action_data){
   
   var ddType=$("#btIssueStatus_" + testCaseId).next("ul").attr('data-ddtype');

   postToDB("/tml/auth/setIssueStatus", {
      'lastlogid' : testCaseId,
      'issuestatus' : sStatusTxt,
      'action' : action,
      'action_data' : action_data,
      'ddtype' : ddType
   }, function(response) {
      if (response['data'] == "not_authorized") {
         showSessionExpiredModal();
      } else {
         
         $("#btIssueStatus_" + testCaseId).html(
               '<span class="round round-xs char_' + ((sStatusTxt=="?") ? "questionmark" : sStatusTxt) + '_' + ddType + '" style="margin-bottom:-3px;">'
                     + sStatusTxt + '</span> <span class="caret"></span>');

         $("#txtDateTime_" + testCaseId).text("just now");
         $("#txtUserName_" + testCaseId).text($("#badgeUserText").attr('data-original-title'));

         //pol2hi commented out 21.03.2017
         //This is disturbing because comments will be reloaded and rendered again.
         //Can be activated if there is a better concept for loading comments.
         //getFromDB("/tml/result/base/getTestResultDataTable", "version="
         //      + $('#selectVersion').find("option:selected").val() + "&component=" + $('#btSelectedComponent').text(),
         //      function(response) {
         //         updateTestResultDataTable(response, false);
         //      });
         

         getFromDB("/tml/result/base/getDataTableFilterBadgeContent", "version="
               + $('#selectVersion').find("option:selected").val() + "&component=" + $('#btSelectedComponent').text(),
               function(response) {
                  updateDataTableFilterBadgeContent(response);
               });
         // $("#symEnvelope_" + testCaseId).removeClass("hidden");
      } // if not OK
   } // function(response)
   ); // postToDB "setIssueStatus"

};

function saveLinkAndCreateButton(testCaseId, btnURL, btnText){
   // search for the first panComment_nnn inside commentField.
   // extrract the comment number and increment it. This is the new commentId.
   var nLinkId = 0;
   var sLinkId = ($("#linkField_" + testCaseId + " > div:last").attr('id'));
   if (sLinkId != undefined) {
      nLinkId = parseInt(sLinkId.split("_")[2]) + 1;
   }

   var sButtonTicket = templateToHtml('btnTicket', {
      'TEST_CASE_ID' : testCaseId,
      'LINK_ID' : nLinkId,
      'BTN_STYLE' : 'info',
      'BTN_URL' : btnURL,
      'BTN_TEXT' : 'RTC-' + btnText,
      'STATUS_DELETE' : ''
   });

   postToDB("/tml/auth/postIssueLink", {
      url : btnURL + "####" + btnText,
      testcaseid : testCaseId,
      number : nLinkId,
      'action' : enHistoryAction.addedIssueLink
   }, function(response) {
      if (response['data'] == "not_authorized") {
         showSessionExpiredModal();
      } else {
         // attach the new comment (panel) to the top
         $("#linkField_" + testCaseId).append(sButtonTicket);

         setIssueStatus(testCaseId, 'l', enHistoryAction.addedIssueLink, btnURL + "####" + btnText + "####" + nLinkId);
      }

   });

};


function linkWithTicket(testCaseId){
   var d=bootbox.prompt({
      title: '<i class="fa fa-external-link fa-2x" style="vertical-align: middle;"></i> Link issue with <a class="btn btn-info btn-xs" href="https://rb-alm-20-p.de.bosch.com/ccm/web/projects/" target="_blank">RTC</a> ticket',
      
      buttons: {
          cancel: {
              label: 'Cancel'
          },
          confirm: {
              label: 'OK'
          }
      },
      callback: function (result) {

               if (result != null && result.trim() != "") {
                  var arRes = result.trim().match(/viewWorkItem&id=(\d+)$/);

                  if (arRes == null) {
                     $("#txtLinkIssueError").removeClass("hidden").hide().slideDown(500);
                     return false;
                  }

                  saveLinkAndCreateButton(testCaseId, result, arRes[1]);
                  $("#txtLinkIssueError").addClass("hidden");

               } else if (result != null && result.trim() == "") {
                  $("#txtLinkIssueError").removeClass("hidden").hide().slideDown(500);
                  return false;
               }
               ;
            }, // callback

         }); // bootbox.confirm
	 
   d.init(function() {
     d.find('.modal-header').addClass('modal-info');
     d.find("div.modal-dialog").css("width", "70%");
     d.find(".modal-body").append('<div class="hidden" id="txtLinkIssueError"><span style="color: #FF0000;">Please provide a correct link to a RTC work item!</span></div>');
         }); // d.init
};

function deleteTicketLink(id, nr) {
   if (!isLoggedIn()) {
      showSessionExpiredModal();
      return false;
   }

   var d = bootbox.confirm({
      title : '<i class="fa fa-question-circle fa-2x" style="vertical-align: middle;"></i> Delete ticket link',
      message : "Do you really want to delete below ticket link?",
      buttons : {
         cancel : {
            label : 'Cancel'
         },
         confirm : {
            label : 'Yes'
         }
      },
      callback : function(result) {
         if (result == true) {

            postToDB("/tml/auth/postDeleteIssueLink", {
               testcaseid : id,
               number : nr,
               'action' : enHistoryAction.deletedIssueLink
            }, function(response) {
               if (response['data'] == "not_authorized") {
                  showSessionExpiredModal();
               } else {
                  $("#btnTicket_" + id + "_" + nr).addClass("hidden");

                  getFromDB("/tml/result/base/getIssueLinks", "testcaseid=" + id, function(response) {

                     if (response['data'].length < 1) {
                        setIssueStatus(id, 'a', enHistoryAction.deletedLastIssueLink);
                     } // if (response['data'].length<1)

                  }); // getFromDB
               }
            }); // postToDB
         }
      }, // callback

   }); // bootbox.confirm

   d.init(function() {
      d.find('.modal-header').addClass('modal-warning');
      d.find("div.modal-dialog").css("width", "70%");

      getFromDB("/tml/result/base/getIssueLinks", "testcaseid=" + id + "&number=" + nr, function(response) {
         var link = response['data'][0];
         var sButtonTicket = templateToHtml('btnTicket', {
            'TEST_CASE_ID' : id,
            'LINK_ID' : link['number'],
            'BTN_STYLE' : 'info',
            'BTN_URL' : link['url'].split("####")[0],
            'BTN_TEXT' : 'RTC-' + link['url'].split("####")[1],
            'STATUS_DELETE' : 'hidden'
         });

         d.find('.modal-body').append('<div style="margin: 15px;">' + sButtonTicket + '</div>');
      }); // getFromDB

   }); // d.init
};

function addComment(testCaseId) {
   if (isLoggedIn()) {

      var sDateTime = "just now";

      // search for the first panComment_nnn inside commentField.
      // extrract the comment number and increment it. This is the new
      // commentId.
      var nCommentId = 0;
      var sCommentId = ($("#commentField_" + testCaseId + " > div:last").attr('id'));
      if (sCommentId != undefined) {
         nCommentId = parseInt(sCommentId.split("_")[2]) + 1;
      }

      var sComment = templateToHtml('panComment', {
         'TEST_CASE_ID' : testCaseId,
         'COMMENT_ID' : nCommentId,
         'COMMENT_TEXT' : '',
         'DATETIME' : sDateTime,
         'USER_NAME' : getDisplayName(),
         'USER_BADGE_COLOR' : getUserColor(getDisplayName()),
         'USER_BADGE_LETTER' : getDisplayName().split(" ")[1].charAt(0).toUpperCase(),
         'STATUS_EDITBUTTONS' : ''
      });

      // attach the new comment (panel) to the top
      $("#commentField_" + testCaseId).append(sComment);
      // open the editor to edit comment.
      $("#editComment_" + testCaseId + '_' + nCommentId).summernote({
         focus : true,
         placeholder : 'put your comment here...'
      });

   } else {
      showSessionExpiredModal();
   }
};

function showHistory(id, source) {
   //console.log(id)
   //console.log(source)
   
   var titleType="Issue";
   var idName="testcaseid";
   if (source == enHistorySource.test_case){
      titleType="Issue";
      idName="testcaseid";
   } else if (source == enHistorySource.test_suite){
      titleType="Test suite";
      idName="version";
   }
   
   //console.log(titleType)
   //console.log(idName)
   
   var d = bootbox.confirm({
      title : '<i class="fa fa-info fa-2x" style="vertical-align: middle;"></i> ' + titleType + ' history',
      message : '<div id="tblHistory"><pre><code>loading...</code></pre></div>',
      buttons : {
         confirm : {
            label : 'OK'
         }
      },
      callback : function(result) {
         // nothing to do here...
      }, // callback

   }); // bootbox.confirm

   d.init(function() {
      d.find('.modal-header').addClass('modal-info');
      d.find("div.modal-dialog").css("width", "60%");
      d.find(".btn-default").addClass("hidden");
   
      getFromDB("/tml/result/base/getHistory", idName + "=" + id + "&source=" + source, function(response) {
         $("#tblHistory").html('<div class="list-group">' + createHistoryList(response) + "</div>");
      }); // getFromDB*/
   }); // d.init
};

function installButtonListeners(){
   $('#testsuiteRelationship').on('click', function(){
      // wait until the css transition completed
      $(this).one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend",
         function(event) {
            var expandedVariants = [];
            var expendVariantElems = $('#testsuiteRelationship').find(".variantExecutions[aria-expanded='true']");
            // add expanded variants to sessionStorage
            _.each(expendVariantElems, function(elem){
               expandedVariants.push(elem.id);
            })
            sessionStorage.setItem("expandedVariants", expandedVariants);				
      });			

   }) //#testsuiteRelationship.on

   $('#tblTestResult').on('click', '.ddIssueStatus > ul > li > a', function(ev) {

      var arId = this.id.split("_");
      var testCaseId = arId[2];

      if (this.id == "btIssueStatus_MAILTO_" + testCaseId) {
         if ($("#btIssueStatus_MAILTO_" + testCaseId).text().trim() == "select an item") {
            ev.preventDefault();
         }

      } else {
         ev.preventDefault();

         switch ($("#" + this.id).text().trim()) {
         case 'add comment ...':
            addComment(testCaseId);
            break;
         case 'history ...':
            showHistory(testCaseId , enHistorySource.test_case);
            break;
         case 'copy test URL ...':
            copyLinkToClipboard(testCaseId);
            break   
         default:
            var txt = $("#" + this.id + " span:first-child").text(); 

            var bAbortAction = false;

            if (txt.trim() == "l") {
               if (isLoggedIn()) {
                  linkWithTicket(testCaseId);
               } else {
                  showSessionExpiredModal();
                  bAbortAction = true;
               }
            }

            if (bAbortAction == false && txt != "l") {
               setIssueStatus(testCaseId, txt, enHistoryAction.changedIssueStatus);

           
            };
         } // witch this.id.text
      } // else btIssueStatus_MAILTO
   }); // on click ddIssueStatus
}

function editComment_edit(id, nr) {
   $("#editComment_" + id + '_' + nr).summernote({
      focus : true,
      placeholder : 'put your comment here...'
   });
};

function editComment_save(id, nr) {
   var sComment = $("#editComment_" + id + '_' + nr).summernote('code');
   var s = b64EncodeUnicode(sComment);
   $('#panComment_'+id+'_'+nr+' #txtCommentDateTime_'+id).text('just now')

   if (s.length > 45 * 10E6) {
      showGenericModal(
                        'error',
                        "Comment too large!",
                        "The size of the comment exceeds the allowed maximum data length. <br/> Please reference pictures or videos with a link!"
	              );
      return false;
   }

   $("#editComment_" + id + '_' + nr).summernote('destroy');

   postToDB("/tml/auth/postTestCaseComment", {
      comment : s,
      testcaseid : id,
      number : nr,
      'action' : enHistoryAction.updatedComment
   }, function(response) {
      if (response['data'] == "not_authorized") {
         showSessionExpiredModal();
      }
   });

};

function deleteComment(id, nr) {
   var d = bootbox.confirm({
      title : '<i class="fa fa-question-circle fa-2x" style="vertical-align: middle;"></i> Delete comment',
      message : "Do you really want to delete below comment?",
      buttons : {
         cancel : {
            label : 'Cancel'
         },
         confirm : {
            label : 'Yes'
         }
      },
      callback : function(result) {
         if (result == true) {

            postToDB("/tml/auth/postDeleteTestCaseComment", {
               testcaseid : id,
               number : nr,
               'action' : enHistoryAction.deletedComment
            }, function(response) {
               if (response['data'] == "not_authorized") {
                  showSessionExpiredModal();
               } else {
                  // $("#panComment_" + id + "_" + nr).addClass("hidden");
                  // removing all duplicated comments from same name tests
                  _.each($("[id=panComment_" + id + "_" + nr+"]"), function(elem){
                     $(elem).addClass("hidden");
                  })
               }
            }); // postToDB
         }
      }, // callback

   }); // bootbox.confirm

   d.init(function() {
      d.find('.modal-header').addClass('modal-warning');
      d.find("div.modal-dialog").css("width", "70%");

      getFromDB( "/tml/result/base/getTestCaseComments", 
                 "testcaseid=" + id + "&number=" + nr,
                 function(response){ 
     
          if (response.data.length!=0){
         
             var comment = response['data'][0];
            
             var sDateTime = getTimeToText(comment['timestamp']);
            
             var sCommentText = '';
             if (comment['comment'] != '') {
                sCommentText = b64DecodeUnicode(comment['comment']);
             }            
            
             var sComment = templateToHtml('panComment', {
                'TEST_CASE_ID' : id,
                'COMMENT_ID' : nr,
                'COMMENT_TEXT' : sCommentText,
                'DATETIME' : sDateTime,
                'USER_NAME' : comment['user_name'],
                'USER_BADGE_COLOR' : getUserColor(comment['user_name']),
                'USER_BADGE_LETTER' : comment['user_name'].split(" ")[1].charAt(0).toUpperCase(),
                'STATUS_EDITBUTTONS' : 'hidden'
             });
          
          } else { //if (response.data.length!=0)
            var sComment="Comment is already deleted. Please refresh your view!";
          } //if (response.data.length!=0)
          
     
          d.find('.modal-body').append('<div style="margin: 15px;">' + sComment + '</div>');
      }); // getFromDB

   }); // d.init
};

function editResultInterpretation_edit() {
   $('#editResultInterpretation').summernote({
      focus : true
   });
};

function editResultInterpretation_save() {
   // var markup = $('.click2edit').summernote('code');

   var summernoteText = $('#editResultInterpretation').summernote('code');
   // console.log(summernoteText);

   var s = b64EncodeUnicode(summernoteText);
   $('#editResultInterpretation').summernote('destroy');

   postToDB("/tml/auth/summerInterpretation", {
      'data'    : s,
      'version' : $('#selectVersion').find("option:selected").val(),
      'action'  : enHistoryAction.updatedInterpretation
   }, function(response) {
      if (response['data'] == "not_authorized") {
         showSessionExpiredModal();
      }
   });

};

function filterDataTable(bt, filter, column) {
   if (bt!=null){
      if ($("#" + bt).hasClass("active")) {
         filter = '';
      }
      $("#" + bt).toggleClass("active");
   }
   
   var oTable = $('#tblTestResult').dataTable();

   // $('#tblTestResult').dataTable()
   // table.search( filter ).draw();

   // as per
   // http://stackoverflow.com/questions/406230/regular-expression-to-match-line-that-doesnt-contain-a-word
   // table.fnFilter('^((?!result:passed).)*$',1,true,true,true,true);
   // table.fnFilter('^(?!TC).*$',8,true,true,true,true);
   // table.fnFilter('^(?!SWF-).*$',8,true,true,true,true);
   oTable.fnFilter(filter, column, true, true, true, true);
   
};

function filterDataTableClear() {
   var oTable = $('#tblTestResult').dataTable();

   oTable
      .api()
      .search( '' )
      .columns().search( '' )
      .draw();

   $("#bt_notPassed").removeClass("active");
   $("#bt_noTcid").removeClass("active");
   // $("#bt_duplicatedTcid").removeClass("active");
   $("#bt_noFid").removeClass("active");
   
   
   //if a tc_filter was provided with the http request, then unblock HMI now
   // $('#btddSelectedComponent').prop('disabled', false);
   // $('#btSelectedComponent').prop('disabled', false);
   $('#bt_notPassed').prop('disabled', false);
   $('#bt_notAnalyzed').prop('disabled', false);
   $('#bt_noTcid').prop('disabled', false);
   $('#bt_noFid').prop('disabled', false);
   
   $('#bt_clearAllFilters').removeClass('btn-danger').addClass('btn-info');
   
   //Clear all filters button is also used to clear tc_filter if applied.
   //Therefore remove filter from http query and update the dashboard.
   if (dQUERY_STRING['tc_filter']!=undefined){
      dQUERY_STRING['tc_filter']=undefined;
      updateDashboard();
   };
   

};

function updateBtArComponents(responseData){
   var sHTML='<li><a href="#">All Components</a></li>' +
             '<li role="separator" class="divider"></li>' +
             '<ARBUTTONS>';

   var sArButtons = '';
   _.each(_.sortBy(responseData['data']), function(val) {
      sArButtons += '<li><a href="#">' + val + '</a></li>';

   });

   $("#btArComponents").html(sHTML.replace('<ARBUTTONS>', sArButtons));

};

function updateDataTableFilterBadgeContent(responseData) {
   $("#bt_notPassed_badge").text(responseData['data']['not_passed']);
   $("#bt_notAnalyzed_badge").text(responseData['data']['not_analyzed']);
   $("#bt_noTcid_badge").text(responseData['data']['no_tcid']);
   $("#bt_noFid_badge").text(responseData['data']['no_fid']);
};

function showLastLog(bt, lastlogId) {

   var d = bootbox.confirm({
      title : '<i class="fa fa-info fa-2x" style="vertical-align: middle;"></i> Traceback',
      message : '<div id="txtLastLog"><pre><code>loading...</code></pre></div>',
      buttons : {
         confirm : {
            label : 'OK'
         }
      },
      callback : function(result) {
         // nothing to do here...
      }, // callback

   }); // bootbox.confirm

   d.init(function() {
      d.find('.modal-header').addClass('modal-danger');
      d.find("div.modal-dialog").css("width", "70%");
      d.find(".btn-default").addClass("hidden");

      getFromDB("/tml/result/base/getLastLog", "lastlogid=" + lastlogId, function(response) {
         
         //lastlog can have multiple entries separated by [SEPERATOR],
         //last lastlog entry can be the [Callstack]
         
         //separate and create per entry a pre block with syntax highlighting
         var arLastLogEntries=b64DecodeUnicode(response['data']).split("[SEPARATOR]")
       
         var sLastlogHTML='';  
         _.each(arLastLogEntries,function(val){
            val=val.replace(/[\s\t\r\n]+$/,"")
            if (val.includes("[Callstack]")==true){
               val=val.trim();
            };
            
            if (val.trim()!=''){
               sLastlogHTML+='<pre style="color: #CCC; background-color: #202020;"><code>' + hljs.highlight('bash', val).value + '</code></pre>';
            };
         });
         
         $("#txtLastLog").html(sLastlogHTML);
      }); // getFromDB
   }); // d.init

}

function showFileHeader(file_id){
   if ($("#tmlheader_" + file_id ).hasClass("hidden")){
       getFromDB("/tml/result/base/getTMLHeader", "file_id=" + file_id, function(response) {
          // Extended TMLHeader is invisible for the tests which old tests - lack of those information
          var txtExtendedTMLHeader = '';
          if (response['testbenchconfig_name'] != null && response['testbenchconfig_data'].trim() != ""){
            var sFilter = "";
            if (response['preprocessor_filter'] == "true"){
               sFilter = " (filtered)";
            }
            txtExtendedTMLHeader=templateToHtml('extended-tmlHeader', 
                                          {
                                             'testbenchconfig_name'                        : response['testbenchconfig_name'],
                                             'testbenchconfig_data'                        : highlightJSON(response['testbenchconfig_data'].trim()),
                                             'preprocessor_filter'                         : sFilter,                                          
                                             'preprocessor_parameters'                     : JSON2Table(response['preprocessor_parameters'].trim()),                                          
                                          });
          }
          
          var txtTMLHeader=templateToHtml('tmlHeader',
                                          {          
                                            'testtoolconfiguration_testtoolname'          : response['testtoolconfiguration_testtoolname'],
                                            'testtoolconfiguration_testtoolversionstring' : response['testtoolconfiguration_testtoolversionstring'],
                                            'testtoolconfiguration_projectname'           : response['testtoolconfiguration_projectname'],
                                            'testtoolconfiguration_logfileencoding'       : response['testtoolconfiguration_logfileencoding'],
                                            'testtoolconfiguration_pythonversion'         : response['testtoolconfiguration_pythonversion'],
                                            'testtoolconfiguration_testfile'              : response['testtoolconfiguration_testfile'],
                                            'testtoolconfiguration_logfilepath'           : response['testtoolconfiguration_logfilepath'],
                                            'testtoolconfiguration_logfilemode'           : response['testtoolconfiguration_logfilemode'],
                                            'testtoolconfiguration_ctrlfilepath'          : response['testtoolconfiguration_ctrlfilepath'],
                                            'testtoolconfiguration_configfile'            : response['testtoolconfiguration_configfile'],
                                            'testtoolconfiguration_confname'              : response['testtoolconfiguration_confname'],
                                            'testfileheader_author'                       : response['testfileheader_author'],
                                            'testfileheader_project'                      : response['testfileheader_project'],
                                            'testfileheader_testfiledate'                 : response['testfileheader_testfiledate'],
                                            'testfileheader_version_major'                : response['testfileheader_version_major'],
                                            'testfileheader_version_minor'                : response['testfileheader_version_minor'],
                                            'testfileheader_version_patch'                : response['testfileheader_version_patch'],
                                            'testfileheader_keyword'                      : response['testfileheader_keyword'],
                                            'testfileheader_shortdescription'             : response['testfileheader_shortdescription'],
                                            'testexecution_useraccount'                   : response['testexecution_useraccount'],
                                            'testexecution_computername'                  : response['testexecution_computername'],
                                            'testrequirements_documentmanagement'         : response['testrequirements_documentmanagement'],
                                            'testrequirements_testenvironment'            : response['testrequirements_testenvironment'],
                                            'extended_tmlheader'                          : txtExtendedTMLHeader,
                                            'test_time_start'                             : moment(response['time_start']).format("DD.MM.YYYY HH:mm:ss"),
                                            'test_time_end'                               : moment(response['time_end']).format("DD.MM.YYYY HH:mm:ss"),
                                            'UUID'                                        : response['test_result_id']
                                          }                                            
                                         );
          $("#tmlheader_" + file_id ).removeClass("hidden");
          $("#tmlheadertext_" + file_id ).hide().html(txtTMLHeader).slideDown("slow");
            
       }); // getFromDB
       
   } else {
       $("#tmlheadertext_" + file_id ).slideUp("slow",
                                               function(){ $("#tmlheader_" + file_id ).addClass("hidden"); } 
                                              ); 
   }
      
}

// Auto reload for 'in progress' version
function displayAutoReloadBtn(){
   $('#btReloadContent').removeClass("hidden");
}

function hideAutoReloadBtn(){
   // change button to default - deactive state
   var btn = $('#btReloadContent button');
   btn.attr('title', "Click to active auto reload for 'in progress' version");
   btn.removeClass('btn-info').addClass('btn-default');
   btn.find("i").removeClass('fa-spin');
   // hide reload button
   $('#btReloadContent').addClass("hidden");
}

function autoReload(el){
   var btn = $(el);

   clearInterval(oReloadTimer); // Clear existing timer
   if (btn.hasClass('btn-info')){
      // change button to deactive state
      btn.attr('title', "Click to active auto reload for 'in progress' version");
      btn.removeClass('btn-info').addClass('btn-default');
      btn.find("i").removeClass('fa-spin');
   } else {
      // change button to active state
      btn.attr('title', "Click to deactive auto reload.");
      btn.removeClass('btn-default').addClass('btn-info');
      btn.find("i").addClass('fa-spin');

      // active reload function
      oReloadTimer = setInterval(function(){
         bForceUpdateDashboard = true;
         // console.log("auto reload");
         initSelectVersion();
      }, iReloadSecond * 1000);
   }

}