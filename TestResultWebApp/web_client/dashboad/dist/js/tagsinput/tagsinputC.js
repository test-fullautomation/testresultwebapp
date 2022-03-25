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


function installTagsInputListener(){
   $('#tagsInput').on('itemAdded', function(event) {
      // event.item: contains the item
      saveTagsInputContent(event.item, enHistoryAction.addedTag);
      
    });
      
};

function deleteTag(tag){
   if (!isLoggedIn()){
      showSessionExpiredModal();
      return false;
   }
   
   var d=bootbox.confirm({
      title: '<i class="fa fa-question-circle fa-2x" style="vertical-align: middle;"></i> Delete tag',
      message: "Do you really want to delete below tag?",
      buttons: {
          cancel: {
              label: 'Cancel'
          },
          confirm: {
              label: 'Yes'
          }
      },
      callback: function (result) {
          if (result==true){
             saveTagsInputContent(tag, enHistoryAction.deletedTag);
             getFromDB( "/tml/result/base/getTags", 
                   "version="+$('#selectVersion').find("option:selected").val(),
                   function(response){ updateTagsInput(response); });
          }
      }, //callback
      
  }); // bootbox.confirm
   
  d.init(function(){
     d.find('.modal-header').addClass('modal-warning');
     d.find("div.modal-dialog").css("width","70%");
     
     d.find('.bootbox-body').append('<br/><br/><span class="label label-info">' + tag + '</span>');
     
  }); //d.init
};


function saveTagsInputContent(tag , action){   
   var arTags=$('#tagsInput').tagsinput('items');
   
   
   if (action==enHistoryAction.deletedTag){
      arTags=_.without(arTags, tag); 
   }
   
   postToDB( "/tml/auth/postTags", 
         { 
           'tags'    : arTags.join("###"),
           'version' : $('#selectVersion').find("option:selected").val(),
           'action'  : action,
           'action_data' :  tag
         },
         function(response){ 
            $(".bootstrap-tagsinput  input").val('');
            
            if (response['data']=="not_authorized"){
             showSessionExpiredModal();
           }
         }
      ); //postToDB
};

function updateTagsInput(response){
   
   $('#tagsInput').off('itemAdded');
   
   $('#tagsInput').tagsinput('removeAll');
   
   if (response['tags']!=null){
       var arTags=response['tags'].split("###");
       
       _.each(arTags,function(tag){
          $('#tagsInput').tagsinput('add', tag);
       });// each arTags
       
       
       $('#tagsInput').tagsinput('refresh');
   }
   
   installTagsInputListener();
          
};

function initTagsInput(){

   if ($("#tagsInput").length){
        
      $('#tagsInput').tagsinput({
         typeahead: {
            source: function(query) {
               return new tagsProvider().getTagList();
             },
      
             afterSelect: function(){
                $(".bootstrap-tagsinput  input").val('');
             }
          },
          //onTagExists: function(item, $tag) {
          //   $tag.hide().fadeIn();
          //   $('#tagsInput').tagsinput('refresh');
          //},
          tagClass: "label label-info",
          trimValue: true,
          freeInput: true,  
      });
      
      
      // tagsinput method above makes orignal select hidden,
      // and creates an new DOM object of class .bootstrap-tagsinput
      //
      // hide generated input field by default to avoid new tags if not
      // logged in
      // this will be changed as required in 
      // loginlogout.js doSpecificLogin, doSpecificLogout
      $(".bootstrap-tagsinput > input").addClass("hidden");
      //dont'show before initialized, otherwise wrong rendered input will be displayed...
      $("#tagsInput").removeClass("hidden");
      
      $('#tagsInput').on('beforeItemRemove', function(event) {
         // event.item: contains the item
         // event.cancel: set to true to prevent the item getting removed
         deleteTag(event.item);
         event.cancel=true;
       });
      
      //console.log("installTagsInputListener")
  
   } //if ($("#tagsInput").length)
   
};
