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

// construct tagsProvider as singleton that it can persist 
// the list of tags for typeahead as long as the session lives.

var tagsProvider = function() {
   if (typeof tagsProvider.instance === 'object') {
      return tagsProvider.instance;
   }

   tagsProvider.instance = this;
   
   this.arTags = [];

   return this;
};

tagsProvider.prototype.setTagList = function(arTags){
   this.arTags=arTags;
};


tagsProvider.prototype.updateTagList = function(){
   var self=this;
   
   getFromDB( "/tml/result/base/getDistinctTagList", 
         "",
         function(response){ self.setTagList(response); }
   );
};
 
tagsProvider.prototype.getTagList = function() {
    return this.arTags;
};

