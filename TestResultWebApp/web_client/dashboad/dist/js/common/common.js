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

//////////////////////////////////////////////////////////////////////////////////////
//
//   Polyfills required by IE
//
//
//////////////////////////////////////////////////////////////////////////////////////

if (!String.prototype.startsWith) {
   String.prototype.startsWith = function(searchString, position){
     position = position || 0;
     return this.substr(position, searchString.length) === searchString;
 };
}

if (!String.prototype.endsWith) {
   String.prototype.endsWith = function(searchString, position) {
       var subjectString = this.toString();
       if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
         position = subjectString.length;
       }
       position -= searchString.length;
       var lastIndex = subjectString.lastIndexOf(searchString, position);
       return lastIndex !== -1 && lastIndex === position;
   };
}

//
//  d3 plugins
//
//////////////////////////////////////////////////////////////////////////////////////
d3.selection.prototype.tooltip = function(o, f) {
   var body, clipped, clipper, d, defaults, height, holder, optionsList, parent, positions, sets, voronois, width;
   if (arguments.length < 2) {
     f = o;
   }
   body = d3.select('body');
   defaults = {
     type: "tooltip",
     text: "You need to pass in a string for the text value",
     title: "Title value",
     content: "Content examples",
     detection: "shape",
     placement: "fixed",
     gravity: "right",
     position: [100, 100],
     displacement: [0, 0],
     mousemove: false
   };
   optionsList = [];
   voronois = [];
   this.each(function(d, i) {
     var opt;
     opt = f.apply(this, arguments);
     optionsList.push(opt);
     if (opt.detection === 'voronoi') {
       return voronois.push([opt, i]);
     }
   });
   if (voronois.length !== 0) {
     parent = d3.select(this[0][0].ownerSVGElement);
     holder = parent.append("g").attr("id", "__clip__holder__");
     console.log(voronois);
     positions = (function() {
       var _i, _len, _results;
       _results = [];
       for (_i = 0, _len = voronois.length; _i < _len; _i++) {
         d = voronois[_i];
         _results.push(d[0].position);
       }
       return _results;
     })();
     //console.log(positions);
     sets = d3.geom.voronoi(positions);
     height = parent.attr("height");
     width = parent.attr("width");
     clipper = d3.geom.polygon([[0, 0], [0, height], [width, height], [width, 0]]).clip;
     clipped = positions.map(clipper);
     holder.append("g").attr("id", "clipPaths").selectAll("clipPath").data(voronois).enter().append("clipPath").attr("id", function(d, i) {
       return "clip-" + i;
     }).append("circle").attr("cx", function(d) {
       return d[0].position[0];
     }).attr("cy", function(d) {
       return d[0].position[1];
     }).attr("r", function(d) {
       return 20;
     });
     holder.append("g").attr("id", "clipped").selectAll("path").data(voronois).enter().append("path").attr("d", function(d, i) {
       return "M" + (clipped[i].join('L')) + "Z";
     }).attr("clip-path", function(d, i) {
       return "url(#clip-" + i + ")";
     });
   } // if voronois.lenght!=0
   return this.each(function(d, i) {
     var el, move_tip, options;
     options = optionsList[i];
     el = d3.select(this);
     move_tip = function(selection) {
       var center, offsets;
       center = [0, 0];
       if (options.placement === "mouse") {
         center = d3.mouse(body.node());
       } else {
         offsets = this.ownerSVGElement.getBoundingClientRect();
         center[0] = offsets.left;
         center[1] = offsets.top;
         center[0] += options.position[0];
         center[1] += options.position[1];
         center[0] += window.scrollX;
         center[1] += window.scrollY;
       }

       // If mouse position is greater the 3 quarters of screen's width
       // Tooltip will be displayed on left side of dots
       if (options.position[0]>(3*offsets.width/4)){
          center[0] = center[0] - selection.style('width').replace('px', '');
       } else {
          center[0] += options.displacement[0];
       }
       center[1] += options.displacement[1];
       return selection.style("left", "" + center[0] + "px").style("top", "" + center[1] + "px").style("display", "block");
     };
     el.on("mouseover", function() {
       var inner, tip;
       tip = body.append("div").classed(options.type, true).classed(options.gravity, true).classed('fade', true).style("display", "none");
       if (options.type === "tooltip") {
         tip.append("div").html(options.text).attr("class", "tooltip-inner").style("text-align","left");
       }
       if (options.type === "popover") {
         inner = tip.append("div").attr("class", "popover-inner");
         inner.append("h3").text(options.title).attr("class", "popover-title");
         inner.append("div").attr("class", "popover-content").append("p").html(options.content[0][0].outerHTML);
       }
       tip.append("div").attr("class", "arrow");
       setTimeout(function() {
         return tip.classed('in', true);
       }, 10);
       return tip.style("display", "").call(move_tip.bind(this));
     });
     if (options.mousemove) {
       el.on("mousemove", function() {
         return d3.select("." + options.type).call(move_tip.bind(this));
       });
     }
     return el.on("mouseout", function() {
       var tip;
       tip = d3.selectAll("." + options.type).classed('in', false);
       return setTimeout(function() {
         return tip.remove();
       }, 150);
     });
   });
 };

//
//   b64 encoding/decoding used for BLOB handling
//
//////////////////////////////////////////////////////////////////////////////////////

//b64EncodeUnicode('✓ à la mode'); // "4pyTIMOgIGxhIG1vZGU="
//b64EncodeUnicode('\n'); // "Cg=="
function b64EncodeUnicode(str) {
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function(match, p1) {
      return String.fromCharCode('0x' + p1);
  }));
};


//b64DecodeUnicode('4pyTIMOgIGxhIG1vZGU='); // "✓ à la mode"
//b64DecodeUnicode('Cg=='); // "\n"
function b64DecodeUnicode(str) {
  return decodeURIComponent(Array.prototype.map.call(atob(str), function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

//
//    clipboard handling
//
//////////////////////////////////////////////////////////////////////////////////////
function copyLinkToClipboard(test_case_id) {
  var text=sDOMAIN+sSubFolder+'/index.html?branch='+
  encodeURIComponent($('#selectBranch').find('option:selected').text().trim()) + '&variant=' +
  encodeURIComponent($('#selectProjectVariant').find('option:selected').text().trim()) + "&version=" +
  encodeURIComponent($('#selectVersion').find('option:selected').attr('value'))+ "&component=" +
  encodeURIComponent($('#btSelectedComponent').text());

  if (test_case_id!=undefined){
    text+="&tc_filter=" + encodeURIComponent(test_case_id);
  }
  if (('view' in dQUERY_STRING) && dQUERY_STRING['view']!==''){
    text+="&view=" + encodeURIComponent(dQUERY_STRING['view']);
    var sStackVersions = sessionStorage.getItem('stackVersion');
    if (dQUERY_STRING['view'] == 'diffview'){
      // Add current version(s) in stack to copied URL
      if (sStackVersions !== null && sStackVersions.split(';').length > 0){
        text+="&stack=" + encodeURIComponent(sStackVersions);
      }
  
      // Add current setting of diff view to copied URL
      if ('diffview-filter' in sessionStorage){
        text+="&diffview-filter=" + sessionStorage.getItem('diffview-filter');
      }
    }
  }
 
  showCopyLinkModal(text);
}

//
//   URL GET query string handling ( ...?param1=val1&param2=val2... )
//
//////////////////////////////////////////////////////////////////////////////////////
function parseQueryString(){
 var a=window.location.search.substr(1).split('&');
 for (var i = 0; i < a.length; ++i)
 {
     var p=a[i].split('=', 2);
     if (p.length != 2) continue;
     dQUERY_STRING[p[0]] = decodeURIComponent(p[1].replace(/\+/g, " "));
 }
}

//
//   user name specific colors
//
//////////////////////////////////////////////////////////////////////////////////////
function getUserColor(sName){
 var col=("rgb(255,0,0)");
 var f=255/24;
 
 try {
    //get a reproduceable mix of lower chars based on the name
    var vals=b64EncodeUnicode(sName).toLowerCase().replace( /[^a-z]/g , '');
    
    //calculate color values based on he firs three chars
    var r=parseInt((vals.charCodeAt(1)-97)*f);
    var g=parseInt((vals.charCodeAt(2)-97)*f);
    var b=parseInt((vals.charCodeAt(3)-97)*f);
    
    //if the result is too bright, then invert the color 
    //values
    var brightness=0.2126*r + 0.7152*g + 0.0722*b;
    if (brightness>190){
       r=255-r;
       g=255-g;
       b=255-b;
    }
    
    col=("rgb(" + r + "," + g + "," + b + ")");
   
 } catch (err) {
   //nothing to do... 
 }
 
 return col;
 
};

//
//component name specific colors
//
//////////////////////////////////////////////////////////////////////////////////////
function getComponentColor(sName){
  var col=("rgb(255,0,0)");
  var f=255/24;

  try {
       //get a reproduceable mix of lower chars based on the name
       var vals=b64EncodeUnicode(sName).toLowerCase().replace( /[^a-z]/g , '').split("").reverse().join("");

       if (vals.length<4) {
          vals="a".repeat(4-vals.length) + vals;
       }
       
       //calculate color values based on he firs three chars
       var r=parseInt((vals.charCodeAt(1)-97)*f);
       var g=parseInt((vals.charCodeAt(2)-97)*f);
       var b=parseInt((vals.charCodeAt(3)-97)*f);

       //if the result is too bright, then invert the color 
       //values
       var brightness=0.2126*r + 0.7152*g + 0.0722*b;
       if (brightness<200){
         r=255-r;
         g=255-g;
         b=255-b;
       }

       col=("rgb(" + r + "," + g + "," + b + ")");

  } catch (err) {
     //nothing to do... 
  }

 return col; 

};



//as per https://css-tricks.com/snippets/javascript/lighten-darken-color/
//
//  make colors lighter or darker (Üe.g. LightenDarkenColo("#FF0000",-10)
//
//////////////////////////////////////////////////////////////////////////////////////
function LightenDarkenColor(col, amt) {
   var usePound = false;
 
   if (col[0] == "#") {
       col = col.slice(1);
       usePound = true;
   }

   var num = parseInt(col,16);

   var r = (num >> 16) + amt;

   if (r > 255) r = 255;
   else if  (r < 0) r = 0;

   var b = ((num >> 8) & 0x00FF) + amt;

   if (b > 255) b = 255;
   else if  (b < 0) b = 0;

   var g = (num & 0x0000FF) + amt;

   if (g > 255) g = 255;
   else if (g < 0) g = 0;

   return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

//
//     Format datetime to easy readeable text
//
//////////////////////////////////////////////////////////////////////////////////////
function getTimeToText(sTimeStamp){
//var startTime=moment("2016-09-14 13:05:00", 'YYYY-MM-DD HH:mm:ss');
 var startTime=moment(sTimeStamp, 'YYYY-MM-DD HH:mm:ss');
 
 var endTime=moment();
 
 var momentDiff=moment.duration(endTime.diff(startTime));
 var hours = momentDiff.asHours();
 
 //console.log(hours);
 
 var sDateTime='';
 switch (true){
 case (hours<0.25):
    sDateTime="just now";
    break;
 case (hours<1.0):
    sDateTime="few minutes ago";
    break;
 case (hours<8.0):
    sDateTime="few hours ago";
    break;
 case (hours<126.0): // 5 days
    sDateTime="few days ago";
    break; 
 case (hours<336.0): // 2 weeks
    sDateTime="few weeks ago";
    break;    
 default:
    sDateTime=startTime.format('DD.MM.YY HH:mm');
 }
 
 //sDateTime=startTime.format('DD.MM.YY HH:mm');
 return sDateTime;
}

// return html icon element corresponding to version status
function iconStateVersion(sSWversion, category, state){
  //version names can have ending _S Smoketest, _U Unittest, _R randomtest
	//display correct symbol according to ending.
  var sSuffix=sSWversion.slice(-2);
  var sLSuffix=sSWversion.slice(-4);
  
	var clTestType="fa fa-circle-o";
	if (category=="bvt" || ($.inArray(sSuffix,['_S','_U','_R'])<0 && $.inArray(sLSuffix,['_U64']))<0){
		 clTestType="fa fa-cubes";
	}
	else if (category=="smoketest" || sSuffix=="_S"){
		 clTestType="fa fa-cloud"; 
	}
	else if (category=="unittest" || sSuffix=="_U" || sLSuffix=="_U64"){
		 clTestType="fa fa-cube";   
	}   
	else if (category=="randomtest" || sSuffix=="_R"){
		 clTestType="fa fa-random ";  
	}
	else if (category=="developertest"){
		 clTestType="fa fa-user";  
	}
	
	//remove ending. It's redundant to the icon
	//if ($.inArray(sSuffix,['_S','_U','_R'])>=0){
		 //item['text']=item['text'].slice(0,-2)
	//}
  var dataContent=templateToHtml('iconStateVersion',
                                  {          
                                    'state_color'      : dMENU_TEMPLATE['testSuiteState'][state]['style'][1],
                                    'testtype_classes' : clTestType,
                                    'state_classes'    : dMENU_TEMPLATE['testSuiteState'][state]['style'][0],
                                    'sw_version'       : sSWversion
                                  }
                                );
	return dataContent;                
}

function updateCacheFromURLQuery(){
   // Update cache for sesionID when provide params in url
  var updateNavData=''
  if('branch' in dQUERY_STRING){
    updateNavData += "&branch="+dQUERY_STRING['branch'];
  }
  if('variant' in dQUERY_STRING){
    updateNavData += "&project="+dQUERY_STRING['variant'];
  }
  if('version' in dQUERY_STRING){
    updateNavData += "&version="+dQUERY_STRING['version'];
  } 
  if('component' in dQUERY_STRING){
    updateNavData += "&component="+dQUERY_STRING['component'];
  }    
  if (updateNavData.substr(1) !== ''){
    getFromDB( "/tml/result/base/updateNav", updateNavData.substr(1),function(response){ }) ;
  }
}

// use sessionStorage to store data for one session
// open page in new tab or window will create new sessionStorage 
// data is deleted when window/tab is closed
function updateSessionStorage(){
  // update selected branch, variant and version in sessionStorage   
  sessionStorage.setItem("branch", $('#selectBranch').find("option:selected").text());
  sessionStorage.setItem("variant", $('#selectProjectVariant').find("option:selected").text());
  sessionStorage.setItem("version", $('#selectVersion').find("option:selected").val());
  sessionStorage.setItem("component", $('#btSelectedComponent').text());
}

// use to interpolate start time for test cases within same tml file
function interpolateStartTime(responseData){
  var arrTime = [];
  var arrDuplicatedTime = [];

  // get array of time and array of duplicated time in data
  responseData.data.map(function(data){
    var startTime = data.time;
    if (arrTime.indexOf(startTime)==-1){
      arrDuplicatedTime.push(startTime);
    }
    arrTime.push(startTime);
  })

  // interpolate time for the duplicated items
  $.each(arrDuplicatedTime, function(idx, startTime){
    var firstIdx = arrTime.indexOf(startTime);
    var bNotFoundFirstIdx = true;

    while (bNotFoundFirstIdx && (firstIdx < responseData.data.length)){
      // Detect and skip very short execution test (start time == end time) from interpolation
      if (responseData.data[firstIdx].end_time == responseData.data[firstIdx].time){
        firstIdx += 1;
      } else {
        bNotFoundFirstIdx = false;
      }
    }
    
    var lastIdx = arrTime.lastIndexOf(startTime);

    // get executed time of tml file by difference between start and end time
    var executedTimeOfFile =  (new Date(responseData.data[lastIdx].end_time)) - (new Date(startTime));

    // get additional average value for test case within tml file
    var addMilliseconds = parseInt(executedTimeOfFile/(lastIdx - firstIdx + 1));

    // add additionl time for the duplicated items
    for (var i = firstIdx+1; i < lastIdx+1; i++){
      responseData.data[i].time = (new Date(arrTime[i]).getTime()) + addMilliseconds*(i-firstIdx);
      // also extend the domain of timescale
      if (i==(arrTime.length-1)){
        responseData.domain[1] = responseData.data[i].time;
      }
    }
  });

  return responseData;
}

// Diff view functions
// Add version into stack version
function addDiffVersion(versionID, versionHTML, variantHTML, branchHTML){
  var sStack = sessionStorage.getItem('stackVersion');
  var bStackChange = false;
  // Check current stackVersion
  if ((sStack != null)){
    var arrSelectedVers = sStack.split(";");
    if(arrSelectedVers.length >= 5){
      showGenericModal('', "Warning", "Diff view can compare maximum 5 versions!");
    } else {
      if(arrSelectedVers.indexOf(versionID) == -1){
        sStack += ";"+versionID;
        bStackChange = true;
      } else {
        showGenericModal('', "Warning", "Selected version is already existing in stack for Diff view!");
      }
    }
  } else {
    $('#btAddDiffVersion').removeClass('btn-default').addClass('btn-info');
    sStack = versionID;
    bStackChange = true;
  }

  if(bStackChange){
    sessionStorage.setItem('stackVersion', sStack);
    sessionStorage.setItem(versionID, versionHTML+ " ("+branchHTML+" - "+variantHTML+" )");
    updateStackVersions();
    if (dQUERY_STRING['view'] == 'diffview'){
      updateDashboard();
    }
  }
}

// Update stack version view
function updateStackVersions(){
  // Get current stackVersion
  var sStack = sessionStorage.getItem('stackVersion');
  if (sStack != null){
    var arrSelectedVers = sessionStorage.getItem('stackVersion').split(";");

    // Update versions stack on webpage
    var sHTML='<ARBUTTONS>' +
    '<li role="separator" class="divider"></li>' +
    '<li><a href="#" onclick="clearDiffVersionStack()">clear list</a></li>';
  
    var sArrVersion = '';
    _.each(arrSelectedVers.reverse(), function(val) {
      sArrVersion += '<li><a href="#">' + sessionStorage.getItem(val) + '</a></li>';
    });
  
    $("#btArDiffVersions").html(sHTML.replace('<ARBUTTONS>', sArrVersion));
  }
}

// Clear stack versions
function clearDiffVersionStack(){
  $('#btAddDiffVersion').removeClass('btn-info').addClass('btn-default');
  sessionStorage.removeItem('stackVersion');
  $("#btArDiffVersions").html('<li><a href="#">No selected version</a></li>');
}

// Highlight JSON data inside <pre><code>...</code></pre>
function highlightJSON(sJSON){
   var reHighlightString     = /("[^"]*")/g;
   var reHighlightNoneString = /([\:\,]\s*[\[|\{]*)([+-]?\d+(\.\d+)?|true|false|null)/g;
  return sJSON.replace(/":/g, '" :')
              .replace(reHighlightString, "<span class='json-string'>$1</span>")
              .replace(reHighlightNoneString, "$1<span class='json-none-string'>$2</span>")
}

// Parse JSON data as table
function JSON2Table(sJSON){
   var oJSON = JSON.parse(sJSON);
   var sTable = '';
   Object.keys(oJSON).forEach(function(key){
      sTable += '<tr><td>  '+key+'  </td><td>'+highlightJSON(": "+JSON.stringify(oJSON[key]))+'</td></tr>';
   })
   sTable = '<table>'+sTable+'</table>';
   return sTable
}