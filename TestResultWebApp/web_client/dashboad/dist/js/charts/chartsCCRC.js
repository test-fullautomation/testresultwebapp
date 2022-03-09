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

function createChartAllResultsCCRBars(){
	
	var ctx = document.getElementById("chartAllResultsCCRBars");
	
	//console.log(responseData);
          
		  var barChartData = {
            labels: ["MEM RSS", "MEM PSS", "MEM Anonymous", "Storage", "CPU"],
            datasets: [{
                label: 'Dataset 1',
                backgroundColor: $(".test-result-passed").css("background-color"),
                data: [],
				yAxisID: "y-axis-1"
            }, {
                label: 'Dataset 2',
                backgroundColor: $(".test-result-passed").css("background-color"),
                data: [],
				yAxisID: "y-axis-1"
            }, {
                label: 'Dataset 3',
                backgroundColor: $(".test-result-passed").css("background-color"),
                data: [],
				yAxisID: "y-axis-1"
            }]

        };
		
		
	   var myChart = new Chart(ctx, {
                type: 'bar',
                data: barChartData,
                options: {
                    title:{
                        display:true,
                        text:"CCR Overview Chart"
                    },
                    tooltips: {
                        mode: 'label'
                    },
                    responsive: true,
                    scales: {
                        xAxes: [{
                            stacked: true,
                        }],
                        yAxes: [{
							type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
							display: true,
							position: "left",
							id: "y-axis-1",
							stacked: true,
							ticks : { 
										min : 0,
										max : 100,
									}
								}]
						
                    }
                }
            });
	   
    return myChart;
    
};



function updateChartAllResultsCCRBars(responseData){
	
	var oChart;
	
	if (dPAGE_CHARTS['chartAllResultsCCRBars'] === undefined) {
		dPAGE_CHARTS['chartAllResultsCCRBars'] = createChartAllResultsCCRBars();
	};
	
	oChart=dPAGE_CHARTS['chartAllResultsCCRBars'];
	
    for	(var row in responseData["component_name"])
	{
	oChart.data.datasets[row].label = responseData["component_name"][row];
	oChart.data.datasets[row].backgroundColor = getUserColor(responseData["component_name"][row]);
	oChart.data.datasets[row].yAxisID = "y-axis-1";
	
	oChart.data.datasets[row].data[0]=responseData["MEM_RSS"][row];
	oChart.data.datasets[row].data[1]=responseData["MEM_PSS"][row];
	oChart.data.datasets[row].data[2]=responseData["MEM_Anonymous"][row];
	oChart.data.datasets[row].data[3]=responseData["Storage"][row];
	oChart.data.datasets[row].data[4]=responseData["CPU"][row];
	
	}
	
	oChart.update(500);
	
};

