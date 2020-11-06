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


// context menu plugin
// display the more menu button on right side of selector elem
// option for plugin:
// data: data object - contains information for options: value, text, selected status, ..
// ex: {
//     "opt1": {name: "option 1", selected: false},
//     "opt2": {name: "option 2", selected: false},
//     "opt3": {name: "option 3", selected: false},
//     "opt4": {name: "option 4", selected: false},
//     "opt5": {name: "option 5", selected: false}
// }
// multiChoices: boolean value - allow multiple choices when set true
// selectOpt: function(selected) - return the value of current selected option
// resData: function(responseData) - return the data object after with selected state according to the selection
$.fn.moreMenu = function(pluginOption){
   // element selector to apply the plugin
   var rootElem = $(this);
   rootElem.addClass("ctxmenu");

   // html code for menu button
   var menuButton = '<button id="more-btn" class="more-btn">';
   menuButton    += '<span class="more-dot"></span><span class="more-dot"></span><span class="more-dot"></span>';
   menuButton    += '</button>'

   // html code for menu options
   var optElem = '<div class="more-menu">';
   optElem    += '<ul class="more-menu-items" tabindex="-1" role="menu" aria-labelledby="more-btn" aria-hidden="true">';
   _.each(pluginOption.data, function(optData, opt){
      var optClass = "more-menu-item";
      if (optData.selected) {
         optClass += " selected";
      }
      optElem +=  '<li id="opt-'+opt+'" class="'+optClass+'" role="presentation">';
      optElem += '<button type="button" class="more-menu-btn" role="menuitem" value="'+opt+'">'+optData.name+'</button>';
      optElem += '</li>';
   })
   optElem += '</ul></div>';

   // append plugin menu to root element
   rootElem.html(menuButton+optElem);

   var visible = false;
   var btn = $('.more-btn');
   var menu = $('.more-menu');

   function showMenu(e) {
      e.preventDefault();
      if (!visible) {
         visible = true;
         rootElem.addClass('show-more-menu');
         menu.attr('aria-hidden', false);
         $(document).on('mousedown', clickEvent);
      } else {
         hideMenu(e);
      }
   }

   function clickEvent(e){
      // hideMenu will be handled after processing click event of selected option
      if (btn[0].contains(e.target) || menu[0].contains(e.target)) {
         return;
      }
      hideMenu(e);
   }

   function updateSelectedMenu(opt){
      // return value of selected option
      if (pluginOption.selectOpt !== undefined) {
         pluginOption.selectOpt(opt);
      }
      
      // update and return menu data
      if (pluginOption.multiChoices !== true){
         var unselectedID = $('.more-menu-items .selected')[0].id;
         $('.more-menu-items .selected').removeClass("selected");
         $('#opt-'+opt).addClass("selected");
         pluginOption.data[unselectedID.substr(4)].selected = false;
      }
      pluginOption.data[opt].selected = true;

      // return data object according to the selection
      if (pluginOption.resData !== undefined) {
         pluginOption.resData(pluginOption.data);
      }
   }

   function hideMenu(e) {
      if (visible) {
         visible = false;
         rootElem.removeClass('show-more-menu');
         menu.attr('aria-hidden', true);
         $(document).off('mousedown', clickEvent);
      }
   }

   // Add event listener for button to show menu
   // Add event listener for selecting menu
   btn.on('click',  showMenu);
   menu.on('click', function(e){
      updateSelectedMenu(e.target.value);       
      hideMenu(e);
   })  

}