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


/* ****************************************************************************
 * 
 *    Activities executed when document is ready
 * 
 *************************************************************************** */
$(document).ready(function() {   
   parseQueryString();
	updateCacheFromURLQuery();
	
	//menu management
	createMetisMenu();

	var loadPage = "./dist/html/dashboard.html";
	if ('view' in dQUERY_STRING){
		loadPage = "./dist/html/"+dQUERY_STRING['view']+".html";
	}
	$("#page-wrapper").load(loadPage, function(response, status, xhr){		
		if (status!=='success' && status!=='notmodified'){
			// incase loaded page-wrapper is not existing
			// return 404 template page
			$("#page-wrapper").html(dHTML_TEMPLATE['pageNotFound'])
		}

		$('[data-toggle="tooltip"]').tooltip();
		$('[data-toggle="popover"]').popover();
		$('.pbTooltip').tooltip();
		$('.qualityIndicator').popover();
	
		//$( ".row" ).sortable();
		//$( ".row" ).disableSelection();
		
		initDatePicker();
		initTagsInput();
		new tagsProvider().updateTagList();
		
		initSelectsBranchProjectVariantVersion(); 
		
		installButtonListeners();
		updateStackVersions();
		loggedIn();
		restorePersistedData();   		
	});
   

}); // document ready

function loadingAnimation(){
	if(!bLoading){
		clearInterval(oIntervalTimer);
		var wrapperLoadingElem = $('#loadingNotification');
		wrapperLoadingElem.addClass("show");
		var arrText = ['Loading ...', 'Loading', 'Loading .', 'Loading ..'];
		var iIdx = 0;
		wrapperLoadingElem.text(arrText[iIdx])
		oIntervalTimer = setInterval(function(){
			iIdx++;
			wrapperLoadingElem.text(arrText[iIdx])
			if(iIdx > arrText.length-1){
				iIdx = 0;
			}
		},500)
		bLoading = true;
	}
}

$( document ).ajaxStop(function(){
	loadingCompleted();
});

function loadingCompleted(){
	clearInterval(oIntervalTimer);
	$('#loadingNotification').text("");
	$('#loadingNotification').removeClass("show");
	bLoading = false;
}

function restorePersistedData(){
 /*  getFromDB( "/tml/public/getPublicPersistData", "dpTRFReportRange",
			  function(response){ 
	             if (response.dpTRFReportRange){
	            	 updateDatePicker(response.dpTRFReportRange);                
			     }  		    
			  });*/
		   
}		   

function installSelectListeners(){
	// Login button
	$('#btnLogin').on('click',function(event){
			event.preventDefault(); 
		getLogin($('#txtLoginEmail'),$('#txtLoginDomain'),$('#txtLoginPassword'));
	}); // #btnLogin
	
	// Branch dropdown selection
	$('#selectBranch').on('change', function(){
		loadingAnimation();
		var dfdSelectProjectVariant=getFromDB( "/tml/result/base/selectProjectVariant" , 
															"branch="+$('#selectBranch').find("option:selected").text(),
															function(response,deferred) { 
																// clear selected variant when select branch
																delete dQUERY_STRING['variant'];
																delete dQUERY_STRING['version'];
																sessionStorage.removeItem('variant');
																sessionStorage.removeItem('version');								
																response['selected'] = undefined;

																updateSelect(response,"#selectProjectVariant",deferred, 'variant'); 
															});

		$.when(dfdSelectProjectVariant).done( function(){ 
																getFromDB( "/tml/result/base/updateNav", 
																			"branch="+$('#selectBranch').find("option:selected").text(),
																			function(response){ }); 
																initSelectVersion(); 
																new tagsProvider().updateTagList();
															});
	}); // #selectBranch.on
	
	// Project/Varint dropdown selection
	$('#selectProjectVariant').on('change', function(){ 
		loadingAnimation();
															getFromDB( "/tml/result/base/updateNav", 
																			"branch="+$('#selectBranch').find("option:selected").text()+"&"+
																			"project="+$('#selectProjectVariant').find("option:selected").text(),
																			function(response){ }); 
															// clear selected sw version when select project/variant
															delete dQUERY_STRING['version'];
															sessionStorage.removeItem('version');
															initSelectVersion();	
															new tagsProvider().updateTagList();
	}); // #selectProjectVariant.on
	
	// SW Version dropdown selection
	$('#selectVersion').on('change', function(){
		loadingAnimation();
		getFromDB( "/tml/result/base/updateNav", 
						"branch="+$('#selectBranch').find("option:selected").text()+"&"+
						"project="+$('#selectProjectVariant').find("option:selected").text()+"&"+
						"version="+$('#selectVersion').find("option:selected").val(),
						function(response){ }); 
						initSelectComponent(); 
		new tagsProvider().updateTagList();
	}); //#selectVersion.on

	// Component button selection
	$("#btArComponents").click(function(ev) {
		loadingAnimation();
		var sComponentName = ev.target.firstChild.data;
		var oComponentButton = $('#btSelectedComponent');
		oComponentButton.text(sComponentName);
		if (sComponentName==="All Components"){
			oComponentButton.removeClass('btn-info').addClass('btn-default');
		} else{
			oComponentButton.removeClass('btn-default').addClass('btn-info');
		}

		postToDB("/tml/public/setPublicPersistData", {
			'component' : sComponentName
		}, function(response) {
			updateDashboard();
		}); // #btArComponents
	});	
	
	// Diff view - add version into stack
	$('#btAddDiffVersion').click(function(ev){
		addDiffVersion($('#selectVersion').find("option:selected").val(), 
							$("#selectVersionWrapper .filter-option").html(),
							$("#selectVariantWrapper .filter-option").html(),
							$("#selectBranchWrapper .filter-option").html()
							);
	});
}

function updateDashboard(){
	/*
	* 
	*  Initial creation and update of all graphs
	* 
	************************************************************************ */

	// update sessionStorage for selected branch, variant and version
	updateSessionStorage();
	loadingAnimation();
	bForceUpdateDashboard = false;

	if ($("#btTestSuiteStatus").length){
		getFromDB( "/tml/result/base/getTestSuiteState",
				"version="+$('#selectVersion').find("option:selected").val(),
				function(response){ updateBtTestSuiteStatus(response); });
	}

	// header information
	// Show component name in case of other than "All Components"
	if ($("#header-component").length){
		var sComponentName = $('#btSelectedComponent').text();
		var sHeaderComponent = (sComponentName==="All Components") ? "" : " - "+sComponentName;
		$('#header-component').text(sHeaderComponent);
	}

	// test result bar row
	// quality indicator and text possition
	if ($("#chartFailPerComponentSpider").length || $("#pbTestResult").length){
		getFromDB( "/tml/result/base/chartRadarFailedUnknownPerComponent",
					  "version="+$('#selectVersion').find("option:selected").val()+
					  "&component=" + $('#btSelectedComponent').text(),
					  function(response){ updateTestResultBar_and_chartFailPerComponentSpider(response); });  				  
	}
	// End test result bar row

	/*
	*
	*   Dashboard information and graphs
	*
	***************************************************** */
	// ***** status row *****
	// Update quality panel is handled inside above test result update
	// Update passed rate and test counter panels are handled inside below updateChartDoughnutResult update

	if ($("#panExeuctionTime").length){
		getFromDB( "/tml/result/base/getExecutionTime",
					  "version="+$('#selectVersion').find("option:selected").val(),
					  function(response){ updateExecutionTime(response); }); 
	}

	if ($("#panMetaData").length){
		getFromDB( "/tml/result/base/getMetaData",
				"version="+$('#selectVersion').find("option:selected").val(),
				function(response){ updateMetaData(response); });
	 
	}
	// End status row
	 
	// ***** tag row *****
	if ($("#tagsInput").length){
		getFromDB( "/tml/result/base/getTags", 
						"version="+$('#selectVersion').find("option:selected").val(),
						function(response){ updateTagsInput(response); });
	}
	// End tag row

	// ***** fail dots row *****
	if ($("#chartFailDots").length){
		//show chart only for test other than UnitTest.
		//UnitTests have too many results.	     
		if ($('#selectVersionWrapper').find("button").attr("title").endsWith("_U") || 
		    $('#selectVersionWrapper').find("button").attr("title").endsWith("_U64")){
			$('#chartFailDots').empty();
			$('#chartFailDots').hide();
		} else {
			$('#chartFailDots').show();
			getFromDB( "/tml/result/base/chartFailsOverTime", 
					"version="+$('#selectVersion').find("option:selected").val()+
					"&component=" + $('#btSelectedComponent').text(),
					function(response){ updateChartFailDots(response); });
		}
	}
	// End fail dots row

	// ***** first charts row *****
	if ($("#chartSingleResultDonut").length){
		//updates also the panels "passed rate" and "tests executed" as
		//required data is already available from doughnut chart
		getFromDB( "/tml/result/base/chartDoughnutResult", 
						"branch="+$('#selectBranch').find("option:selected").text()+"&"+
						"project="+$('#selectProjectVariant').find("option:selected").text()+"&"+
						"version="+$('#selectVersion').find("option:selected").val()+
						"&component=" + $('#btSelectedComponent').text(),
						function(response){ updateChartDoughnutResult(response); }); 
	}

	// Called API to get reanimation number
	if ($("#reanimation").length){
		getFromDB("/tml/result/base/getReanimationStatus",
					"version="+$('#selectVersion').find("option:selected").val(),
					function(response){ updateReanimation(response); });
    }

	/* #chartFailPerComponentSpider update is handled inside test result update*/
	
	if ($("#chartNotAnalyzedIssues").length){
		getFromDB( "/tml/result/base/chartNotAnalyzedIssues",
					  "version="+$('#selectVersion').find("option:selected").val()+
					  "&component=" + $('#btSelectedComponent').text(),
					  function(response){ updateChartNotAnalyzedIssues(response); });  
	}
	// End first charts row

	// ***** second charts row *****
	if ($("#chartAllResultsBars").length){
		getFromDB( "/tml/result/base/chartBarsAllResults", 
					  "branch="+$('#selectBranch').find("option:selected").text()+"&"+
					  "project="+$('#selectProjectVariant').find("option:selected").text()+"&"+
					  "version="+$('#selectVersion').find("option:selected").val()+
					  "&component=" + $('#btSelectedComponent').text(),
					  function(response){ updateChartAllResultsBars(response); });  
	}

	if ($("#chartTestsPerComponentFlow").length){
		getFromDB( "/tml/result/base/chartTestsPerComponentFlow", 
				"branch="+$('#selectBranch').find("option:selected").text()+"&"+
				"project="+$('#selectProjectVariant').find("option:selected").text()+"&"+
				"version="+$('#selectVersion').find("option:selected").val()+
				"&component=" + $('#btSelectedComponent').text(),
				function(response){ updateChartTestsPerComponentFlow(response); });
	}
	// End second charts row

	// ***** third chart row *****
	if ($("#chartResetVsComponentLine").length){
		getFromDB( "/tml/result/base/chartResetVsComponentLine", 
					  "branch="+$('#selectBranch').find("option:selected").text()+"&"+
					  "project="+$('#selectProjectVariant').find("option:selected").text()+"&"+
					  "version="+$('#selectVersion').find("option:selected").val()+
					  "&component=" + $('#btSelectedComponent').text(),
					  function(response){ updateChartResetVsComponentLine(response); });  
	}
	// End third chart row

	// ***** right column information  *****
	if ($("#testsuiteRelationship").length){
		getFromDB( "/tml/result/base/getTestSuiteRelationship", 
				"branch="+$('#selectBranch').find("option:selected").text()+"&"+
				"sw_version="+$('#selectVersionWrapper').find("button").attr("title"),
				function(response){ updateTestsuiteRelationship(response); });
	}

	if ($("#editResultInterpretation").length){
		getFromDB( "/tml/result/base/getSummerInterpretation",
					  "version="+$('#selectVersion').find("option:selected").val(),
					  function(response){ updateSummerInterpretation(response); });
	}
	// End right column information


	/*
	*
	*   Data table information
	*
	***************************************************** */
	// table filter
	if ($("#btDataTableFilter").length){
		getFromDB( "/tml/result/base/getDataTableFilterBadgeContent", 
				"version="+$('#selectVersion').find("option:selected").val() + "&component=" + $('#btSelectedComponent').text(),
				function(response){ updateDataTableFilterBadgeContent(response); });
	}
	// data table
	if ($("#tblTestResult").length){
		getFromDB( "/tml/result/base/getTestResultDataTable",
					  "version="+$('#selectVersion').find("option:selected").val() + "&component=" + $('#btSelectedComponent').text() + "&tc_filter=" + dQUERY_STRING['tc_filter'],
						function(response){ updateTestResultDataTable(response); });
	};  

	/*
	*
	*   Diffview information
	*
	***************************************************** */
	if ($("#chartDiffview").length){
		// Check stack of diffview first
		var sStackVersions = sessionStorage.getItem('stackVersion');

		// Firstly, parse params from requested url 
		if ('stack' in dQUERY_STRING){
			getFromDB( "/tml/result/base/getDiffExecutionResults",
			"versions="+dQUERY_STRING['stack']+
			"&component=" + $('#btSelectedComponent').text(),
			function(response){ updateDiffview(response); delete dQUERY_STRING['stack'];}
			);
		} else if (sStackVersions !== null && sStackVersions.split(';').length > 0){
			// If stack is valid and contains version(s)
			// Compare versions in stack on diffview incase more than 1 version
			getFromDB( "/tml/result/base/getDiffExecutionResults",
			"versions="+sStackVersions+
			"&component=" + $('#btSelectedComponent').text(),
			function(response){ 
				updateDiffview(response);
				sPreStackVersions=sessionStorage.getItem('stackVersion'); 
			});
		} else {
			getFromDB( "/tml/result/base/getDiffExecutionResults",
			"branch="+$('#selectBranch').find("option:selected").text()+
			"&project="+$('#selectProjectVariant').find("option:selected").text()+
			"&SWversion="+$('#selectVersionWrapper button').attr("title")+
			"&component=" + $('#btSelectedComponent').text(),
			function(response){ updateDiffview(response)}
			);
		}
	}

	/*
	*
	*   Runtime information
	*
	***************************************************** */
	if ($("#chartRuntime").length){
		getFromDB( "/tml/result/base/chartRuntime", 
				"version="+$('#selectVersion').find("option:selected").val(),
				function(response){ updateRuntimeChart(response); });
	}
	   
	  
	/*
	*
	*   CCR information
	*
	***************************************************** */
	if ($("#chartAllResultsCCRBars").length){
		getFromDB( "/tml/result/base/chartCCRBarsAllResults", 
					  "branch="+$('#selectBranch').find("option:selected").text()+"&"+
					  "project="+$('#selectProjectVariant').find("option:selected").text()+"&"+
					  "version="+$('#selectVersion').find("option:selected").val(),
					  function(response){ updateChartAllResultsCCRBars(response); });  
	}
}; // updateDashboard

function setUserBranchProjectVersion(){	
	var bSelectAborted=false;
	
	if (dQUERY_STRING['version']!=undefined){
		  var versionID="-1";
		
		  dNAV['version'].every(function(item){	
			  if (versionID=="-1"){ 
			     if (item['version_name']==dQUERY_STRING['version'].trim()){
				      versionID=item['version'];
			      } else if (item['version']==dQUERY_STRING['version'].trim()) {
			    	  versionID=item['version']; 
			      }
			  }
				return versionID=="-1";
		   });
		  
		   if (versionID!="-1"){
		      $("#selectVersion").val(versionID);
		      $("#selectVersion").selectpicker('refresh');
		   } else {
			   showGenericModal('error',"Error","Version not existing: '" + dQUERY_STRING['version'].trim() + "'<br><br>Using default values for branch, variant and version instead..."); 
		      delete dQUERY_STRING['branch'];
		      delete dQUERY_STRING['variant'];
		      delete dQUERY_STRING['version'];
		      getFromDB( "/tml/result/base/updateNav", "", function(response){ });
			   bSelectAborted=true;
		   }
		   delete dQUERY_STRING['version'];
	}
	
	if (bSelectAborted==false){
		initSelectComponent();
 
	   if (bSELECT_LISTENERS_INSTALLED==false){
	      installSelectListeners();
	      bSELECT_LISTENERS_INSTALLED=true;
   	   }
	} else {
	   initSelectBranch();		
	}
	
}

function initSelectVersion(){
	var dfdSelectversion=getFromDB( "/tml/result/base/selectVersion" , 
												"branch="+$('#selectBranch').find("option:selected").text()+
												"&"+"project="+$('#selectProjectVariant').find("option:selected").text(),
												function(response,deferred) { 
													updateSelectExt(response,"#selectVersion",deferred,['version','version_name']); 
												});

	$.when(dfdSelectversion).done( function(){ setUserBranchProjectVersion(); } );

}; // initVersionSelect

function initSelectProjectVariant(){
	var dfdSelectProjectVariant=getFromDB( "/tml/result/base/selectProjectVariant" , 
														"branch="+$('#selectBranch').find("option:selected").text(),
														function(response,deferred) { 
															updateSelect(response,"#selectProjectVariant",deferred,'variant'); 
														});

	$.when(dfdSelectProjectVariant).done( function(){ initSelectVersion(); } );
}; // initVariantSelect

function initSelectBranch(){
	var dfdSelectBranch=getFromDB( "/tml/result/base/selectBranch" , "",
                                 function(response,deferred) { 
												updateSelect(response,"#selectBranch",deferred,'branch'); 
											});

	$.when(dfdSelectBranch).done( function(){ initSelectProjectVariant(); } );
} // initBranchSelect

function initSelectsBranchProjectVariantVersion(){    
   initSelectBranch();
}

function initSelectComponent(){
	getFromDB( "/tml/result/base/selectComponent",
			"version="+$('#selectVersion').find("option:selected").val(),
			function(response){ 
				updateBtArComponents(response); 
				var sSelectedCmpt = response.selected;
				if (!dQUERY_STRING['component']){
					// Keep previous selected component if it is existing in sessionStorage
					if ('component' in sessionStorage ){
						sSelectedCmpt=sessionStorage['component'];
					}
					dQUERY_STRING['component']=sSelectedCmpt;
				} else if (response['data'].indexOf(dQUERY_STRING['component'])==-1 && dQUERY_STRING['component']!=="All Components"){
					// show error pop-up when component provided in query param is not existing
					showGenericModal('error',"Error","Component not existing: '" + dQUERY_STRING['component'].trim() + 
											"'<br><br>Using default values 'All Components' instead...");
				}
				
				if (dQUERY_STRING['component']!=undefined && response['data'].indexOf(dQUERY_STRING['component'])>-1){
					$('#btSelectedComponent').text(dQUERY_STRING['component']).removeClass('btn-default').addClass('btn-info');
				} else {
					$('#btSelectedComponent').text("All Components").removeClass('btn-info').addClass('btn-default');
				}
				delete dQUERY_STRING['component'];
				if (sessionStorage.getItem('stackVersion') != null){
					$('#btAddDiffVersion').removeClass('btn-default').addClass('btn-info');
				}
				if (dQUERY_STRING['view'] != 'diffview' || 
					 sPreStackVersions != sessionStorage.getItem('stackVersion') || 
					 sessionStorage.getItem('stackVersion') == null || bForceUpdateDashboard){
					sPreStackVersions=sessionStorage.getItem('stackVersion'); 
					updateDashboard();
				}
			}
	);
} // initSelectComponent