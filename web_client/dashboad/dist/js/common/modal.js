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

function showGenericModal(mType, mHeader, mMessage){
	   
   var iconType="fa fa-info";
   var modalClass="modal-info";
   switch (mType){
   case 'error':
      iconType="fa fa-ban";
      modalClass="modal-danger";
      break;
   default:
   }
   
   var d=bootbox.confirm({
      title: '<i class="fa ' + iconType + ' fa-2x" style="vertical-align: middle;"></i> ' + mHeader,
      message: mMessage,
      buttons: {
          confirm: {
              label: 'OK'
          }
      },
      callback: function (result) {
         //nothing to do here... 
      }, //callback
      
  }); // bootbox.confirm
   
  d.init(function(){
     d.find('.modal-header').addClass(modalClass);
     d.find("div.modal-dialog").css("width","70%");
     d.find(".btn-default").addClass("hidden");
  }); //d.init
}

function showSessionExpiredModal(){
	
   var d=bootbox.confirm({
      title: '<i class="fa fa-ban fa-2x" style="vertical-align: middle;"></i> Login required!',
      message: 'Please login with your windows login data before you do the wanted operation...',
      buttons: {
          confirm: {
              label: 'OK'
          }
      },
      callback: function (result) {
         //nothing to do here... 
      }, //callback
      
  }); // bootbox.confirm
   
  d.init(function(){
     d.find('.modal-header').addClass('modal-danger');
     d.find("div.modal-dialog").css("width","70%");
     d.find(".btn-default").addClass("hidden");
  }); //d.init
}

function showLoginModal(){
	if (!$('#ddLogin').hasClass("disabled")){
	   $('#loginModal').modal("show");
	}
}

function showCopyLinkModal(sURL){
   var d=bootbox.prompt({
      title: 'Copy link to clipboard',
      value: sURL,
      closeButton: true,
      buttons: {
         confirm: {
            label: 'Copy & close',
         },
         cancel: {
            label: '',
            className: 'hidden'
         },         
      },      
      callback: function (result) {
         d.find('input.bootbox-input')[0].select();       
         if (result){
            document.execCommand("copy");    
         }
      }, //callback
      
   }); // bootbox.prompt
   d.init(function(){
      // select text inside input tag
      $('input.bootbox-input').one("webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend", 
         function(){
            this.select();
         }
      )
      // modified default modal styles
      d.find("div.modal-dialog").css("vertical-align","top");
      d.find("div.modal-footer").css("text-align","center");
   }); //d.init
}