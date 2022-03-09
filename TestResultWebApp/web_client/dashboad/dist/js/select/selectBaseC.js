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

function updateSelect(responseData,sSelectName,deferred,buffer){
	
	$(sSelectName).html("");
	
	// dNAV is not required anymore
	// just store it for debugging 
	if (buffer!=undefined){
		dNAV[buffer]=responseData['data'];
	}

	if (!dQUERY_STRING[buffer]){
		// set selected according to persist data from server
		var sSelected=responseData['selected'];
		
		// check if buffer is existing in sessionStorage
		// set selected according to sessionStorage
	   if (buffer in sessionStorage){
		    sSelected=sessionStorage[buffer];
	   }
		
		// initialize buffer as initial value dNAV_INIT incase undefined
		if (sSelected==undefined){
			sSelected=dNAV_INIT[buffer];
		}

		dQUERY_STRING[buffer]=sSelected;  
	}

	// generate option menu base on response data
	responseData['data'].forEach(function(item){
       $(sSelectName).append("<option value=" + item + "> " + item + "</option>");
	});	

	// set selected option for the selection
	if (dQUERY_STRING[buffer]!=undefined){
		if (buffer == "branch"){
			//map old branch names from existing links to new branch  names
			if (dQUERY_STRING['branch'].toUpperCase()=="0.F") { dQUERY_STRING['branch']="main"; };
			if (dQUERY_STRING['branch'].toUpperCase()=="1.S") { dQUERY_STRING['branch']="16.1S"; };
			if (dQUERY_STRING['branch'].toUpperCase()=="2.S") { dQUERY_STRING['branch']="16.2S"; };
		}
	   
	   if (responseData['data'].indexOf(dQUERY_STRING[buffer].trim()) > -1){     
	      $(sSelectName).val(dQUERY_STRING[buffer].trim());
	   } else {
			showGenericModal('error',"Error",buffer[0].toUpperCase()+buffer.substr(1)+" not existing: '" + dQUERY_STRING[buffer].trim() + "'<br><br>Using default values for branch, variant and version instead..."); 
			delete dQUERY_STRING['branch'];
			delete dQUERY_STRING['variant'];
			delete dQUERY_STRING['version'];
			sessionStorage.removeItem('branch');
			sessionStorage.removeItem('variant');
			sessionStorage.removeItem('version');
			getFromDB( "/tml/result/base/updateNav", "", function(response){ }); 
			$(sSelectName).val(responseData['data'][0]);
	   }
	   
	   delete dQUERY_STRING[buffer];
	 }	
	$(sSelectName).selectpicker('refresh');
	
	if (deferred){
	   deferred.resolve();
	}
};

function updateSelectExt(responseData,sSelectName,deferred,buffer){
	
	$(sSelectName).html("");
	
	if (buffer!=undefined){
		dNAV[buffer[0]]=[];
		dNAV[buffer[1]]=[];
	}
	
	if (!dQUERY_STRING[buffer[0]]){
	  dQUERY_STRING[buffer[0]]=responseData['selected']; 
	  // check if the selected data is already stored in sessionStorage
	  if (buffer[0] in sessionStorage){
	     dQUERY_STRING[buffer[0]]=sessionStorage[buffer[0]];
	  } 	  
	}

	responseData['data'].forEach(function(item){
	   
	   if (buffer!=undefined){
		  var entry={};
		  entry[buffer[0]]=item['id'];
		  entry[buffer[1]]=item['text'];
	     dNAV['version'].push(entry);
	   }
		
		var dataContent = iconStateVersion(item['text'], item['category_main'], item['state'])

      var sOption="<option data-content=\'" + dataContent + "\' value=\"" + item['id'] + "\"></option>";
      
      $(sSelectName).append(sOption);
	});	
	$(sSelectName).selectpicker('refresh');
	
	//due to the icons which are displayed in the select box the padding must be
	//decreased. Otherwise the box is too large compared to the other boxes without
	//icons.
	//the first button object below selectVersionWrapper need to be adapted accordingly.
	if (sSelectName=="#selectVersion"){
	   $("#selectVersionWrapper button:first-of-type").css("padding" ,"2px 2px 2px 2px");
	}
	
	if (deferred){
	   deferred.resolve();
	}
};

function updateSelectPageContent(event, sSelectedPage){
	event.preventDefault();
	var sPageLocation = "./dist/html/"+sSelectedPage+".html";
	// Clear stored charts of previous page
	dPAGE_CHARTS = {};
	$("#page-wrapper").load(sPageLocation, function(response, status, xhr){
		if (status!=='success' && status!=='notmodified'){
			$("#page-wrapper").html(dHTML_TEMPLATE['pageNotFound']);
		} else{
			dQUERY_STRING['view'] = sSelectedPage;
			initTagsInput();
			new tagsProvider().updateTagList();		
			installButtonListeners();
			bForceUpdateDashboard = true;
			initSelectVersion();
		}
	})
}