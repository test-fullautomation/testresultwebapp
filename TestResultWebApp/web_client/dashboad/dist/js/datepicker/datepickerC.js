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

function CreateDatePicker(startDate,endDate){
    if (startDate===null || endDate===null){
       var startDate = moment().subtract(89, 'days');
       var endDate = moment();
    }
    
    function cb(startDate, endDate) {
    	$('#dpTRFReportRange span').html(startDate.format('DD.MM.YYYY') + ' - ' + endDate.format('DD.MM.YYYY'));
    }

    $('#dpTRFReportRange').daterangepicker({
        startDate: startDate,
        endDate: endDate,
        ranges: {
           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'Last 90 Days': [moment().subtract(89, 'days'), moment()],
           'This Month': [moment().startOf('month'), moment().endOf('month')],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        },
        locale: {
            format: 'DD.MM.YYYY'
        }
    },cb);
    
    cb(startDate, endDate);
}

function installDPListener(){
	   $('#dpTRFReportRange').on('apply.daterangepicker', function(ev, picker) {
		   //console.log(picker.startDate.format('YYYY-MM-DD'));
		   //console.log(picker.endDate.format('YYYY-MM-DD'));
		   //console.log(picker)
		   
		   postToDB("/tml/public/setPublicPersistData", 
				    { 'dpTRFReportRange' : { 'startDate' : picker.startDate.format('DD.MM.YYYY'), 
				    	                     'endDate' :picker.endDate.format('DD.MM.YYYY')
				    	                   }
		            }, 
	                  function(response){
		            	
		            	updateDashboard();
		            }
	       ); // postToDB "/persistData"
		   
	   }); // on('apply.daterangepicker'
	
}

function initDatePicker(){	

	getFromDB( "/tml/public/getPublicPersistData", "dpTRFReportRange",
	    	   function(response){ 
		          var startDate=null;
                  var endDate=null;
		
		          if (response.dpTRFReportRange){
		  	         startDate = moment(response.dpTRFReportRange.startDate,'DD.MM.YYYY'); 
		             endDate = moment(response.dpTRFReportRange.endDate,'DD.MM.YYYY'); 
		          }

		          CreateDatePicker(startDate,endDate);
		          installDPListener();
			   }
	         );
  
}

function __updateDatePicker__(data){
	console.log(data);
	
	console.log(data.startDate);
	console.log(data.endDate);
	
	$('#dpTRFReportRange').data('daterangepicker').setStartDate(data.startDate);
	$('#dpTRFReportRange').data('daterangepicker').setEndDate(data.endDate);
	$('#dpTRFReportRange span').html(data.startDate + ' - ' + data.endDate);
	$('#dpTRFReportRange').removeClass("hide");
}