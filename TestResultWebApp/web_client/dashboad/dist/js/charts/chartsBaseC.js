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

function updateChartFailDots(responseData){
   
    //console.log(responseData.data)                                    
   
    $('#chartFailDots').empty();
   
    var nWidth=$('#chartFailDots').width();

    // interpolate start time for test case within same tml file
    var interpolatedData = interpolateStartTime(responseData);

    var timeScale = d3.time.scale()
    .domain([new Date(interpolatedData.domain[0]), new Date(interpolatedData.domain[1])])
    .range([0, nWidth-17]);
   
    var svg = d3.select("#chartFailDots").append("svg")
     .attr("width",nWidth)
     .attr("height", 15);
     //.style("background-color","#ccc")
     
    //This draws the time scale for debugging
    //svg.append("g")
    //.attr("class", "x axis")
    //.attr("transform","translate(20,30)")
    //.call(d3.svg.axis().scale(timeScale).orient("bottom"))
  
     
    var filter = svg.append("defs")
      .append("filter")
        .attr("id", "blur")
        .attr('x',-5)
        .attr('y',-5)
        .attr('height', 40)
        .attr('width',40)
      .append("feGaussianBlur")
        .attr("stdDeviation", 0.5);
   
     var circle = svg.selectAll("circle")
                     .data(interpolatedData.data);

     var circleEnter = circle.enter().append("circle");
     
     circleEnter.attr("cy", function(d, i) { return 10 ;});
     circleEnter.attr("cx", function(d) {  return timeScale(new Date(d.time))-2+12;  });
     circleEnter.attr("r", function(d,i) { 
       var r=1;
       
       if (d.result_main!="Passed"){
          r=3;
       }
       
       return r;
     });
     circleEnter.style("opacity", 1)      
     circleEnter.style("stroke", function(d,i){ 
        var color=getComponentColor(d.component) 
        
        //if (d.result_main!="Passed"){
        //   color="#000";
        //}
        
        return color;
     });    
     circleEnter.style("fill", function(d,i){ return getComponentColor(d.component) });  
     
     //circleEnter.style("stroke", "blue" )    
     //circleEnter.style("fill", "blue" ); 
     circleEnter.attr("filter", "url(#blur)");
     
     //circleEnter.on("mouseover", handleMouseOver)
     //circleEnter.on("mouseout", handleMouseOut);
     
     circleEnter.tooltip(function(d, i) {
        var cd=circle.data();
        
        var run_time=0;
        //console.log("1 " +cd[i].time)
        if (i<cd.length-1){
           run_time=(new Date(cd[i+1].time)-new Date(cd[i].time)) / 60000;
        }
        
        var svgBox = d3.select(document.createElement("svg")).attr("height", 50);
        var g = svgBox.append("g");
        //g.append("rect").attr("width", r * 10).attr("height", 10);
        //g.append("text").text("10 times the radius of the cirlce").attr("dy", "25");
        return {
          type: "tooltip",
          text: d.component + ": " + d.result_main +" ( " + Number(run_time).toFixed(2) + " min)<br>" + d.name,
          detection: "shape",
          placement: "fixed",
          gravity: "right",
          
          position: [timeScale(new Date(d.time)), 10],
          displacement: [10, 2],
          mousemove: false
        };
      });
     
                 
};

function createChartAllResultsBars(){
   
   var ctx = document.getElementById("chartAllResultsBars");
   
   //console.log(responseData);
   
    var myChart = new Chart(ctx, {
      xLableAngle:0,
       type: 'bar',
       data: {
           labels: [],
           datasets: [{
               type: 'line',
               label: 'number resets',
               backgroundColor: "rgba(0,0,0,0.7)",
               data: [],
               borderColor: 'rgba(0,0,0,0.8)',
              
               yAxisID: "y-axis-2",
               fill: false,
               borderWidth : 1,
               lineTension : 0.3
           },{
            type: 'bar',
               label: 'passed',
               data: [], //responseData["data"],
               backgroundColor: $(".test-result-passed").css("background-color"),
               borderWidth: 0,
               yAxisID: "y-axis-1"
           }, {
               type: 'bar',
               label: 'failed',
               backgroundColor: $(".test-result-failed").css("background-color"),
               borderWidth: 0,
               data: [],
               yAxisID: "y-axis-1"
           }, {
               type: 'bar',
               label: 'unknown',
               backgroundColor: $(".test-result-unknown").css("background-color"),
               borderWidth: 0,
               data: [],
               yAxisID: "y-axis-1"
           }, {
               type: 'bar',
               label: 'aborted',
               backgroundColor: $(".test-result-aborted").css("background-color"),
               borderWidth: 0,
               data: [],
               yAxisID: "y-axis-1"
           }, 
           ] // datasets
       }, //data
       options: {
           responsive: true,
           hoverMode: 'label',
           hoverAnimationDuration: 400,
           
           
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
               }, {
                   type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                   display: true,
                   position: "right",
                   id: "y-axis-2",
                   gridLines: {
                       drawOnChartArea: false
                   }
               }
               , /*{
                   type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                   display: true,
                   position: "right",
                   id: "y-axis-3",
                   gridLines: {
                       drawOnChartArea: false
                   }
               } */],
           }, // scales
       
       
           tooltips: {
              callbacks: {
                label: function(tooltipItem, data) {
                   var resultType=data['datasets'][tooltipItem.datasetIndex].label;
                   var sToolTip = resultType + ": " + tooltipItem.yLabel;
                   if (resultType!="number resets"){
                      sToolTip += " %";
                   }
                   return sToolTip;
                }
              } //callbacks
            } // tooltips
    
       
       } // options
    }); // new Chart
    
    return myChart;
    
};

function updateChartAllResultsBars(responseData){
   
   var oChart;
   
   if (dPAGE_CHARTS['ChartAllResultsBars'] === undefined) {
      dPAGE_CHARTS['ChartAllResultsBars'] = createChartAllResultsBars();
   };
   
   oChart=dPAGE_CHARTS['ChartAllResultsBars'];
   
   oChart.data.labels=responseData["labels"];
   oChart.data.datasets[1].data=responseData["pt_passed"];
   oChart.data.datasets[2].data=responseData["pt_failed"];
   oChart.data.datasets[3].data=responseData["pt_unknown"];
   oChart.data.datasets[4].data=responseData["pt_aborted"];
   oChart.data.datasets[0].data=responseData["num_resets"];
   oChart.update(500);
   
};


function createChartTestsPerComponentFlow(){

   var ctx = document.getElementById("chartTestsPerComponentFlow");
      
   const myChart = new Chart(ctx, {
     type: 'line',
     data: {
       labels: [],
       datasets: []
     },
     options: {
       responsive: true,
     
       scales: {
         yAxes: [{
           stacked: true,
         }]
       },
       animation: {
         duration: 750,
       },
     }
   });
   
   return myChart;
}

function updateChartTestsPerComponentFlow(responseData){
   var oChart;
   
   //console.log(responseData)
   
   if (dPAGE_CHARTS['ChartTestsPerComponentFlow'] === undefined) {
      dPAGE_CHARTS['ChartTestsPerComponentFlow'] = createChartTestsPerComponentFlow();
   };
   
   oChart=dPAGE_CHARTS['ChartTestsPerComponentFlow']; 
   
   //responseData looks like this:
   //
   //var inData={ 'labels' : ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
   //             'label'  : ['MPLAY', 'Tuner', 'Phone' , 'LCM'],
   //             'data' : [ [26, 36, 0, 38, 40, 30, 12] ,
   //                        [34, 44, 0, 24, 25, 28, 25] ,
   //                        [16, 13, 10, 33, 40, 33, 45] ,
   //                        [5, 9, 0, 9, 18, 19, 20]
   //             ]}
   
   var dataSetArray=[];
   for (var i=0; i < responseData['label'].length; i++){
      
      dataSetArray[i]={
                        label: responseData['label'][i],
                        fill: true,
                        backgroundColor: getComponentColor(responseData['label'][i]),
                        borderWidth: 0.1,
                        //pointBackgroundColor: "#" + colors[i],
                        //borderColor: "#" + colors[i],
                        //pointHighlightStroke: "#" + colors[i],
                        borderCapStyle: 'round',
                        data: responseData['data'][i],
                        lineTension: 0.1
                      };
   }
   
   oChart.data.labels=responseData["labels"];
   oChart.data.datasets=dataSetArray;
   oChart.update(500);
}


function createChartDoughnutResult(){
   
   function drawThumb(myChart){
      //calculate if passed rate >= 80%
      var data=myChart.data.datasets[0].data;
      var passedRate=1-((data[1]+data[2]+data[3])/(data[0]+data[1]+data[2]+data[3]));
      
      var c=ctx.getContext("2d");
      
      var fontHeight=((c.canvas.clientHeight-40)/6);
      
      var thumb=String.fromCharCode("0xf088");
      c.fillStyle=$(".test-result-failed").css("background-color");
      if (passedRate>=0.8){
         thumb=String.fromCharCode("0xf087");
         c.fillStyle=$(".test-result-passed").css("background-color");
      } 
      c.font=fontHeight+'px FontAwesome';
      c.fillText(thumb, ((c.canvas.clientWidth+5)/2)-(fontHeight/2), ((c.canvas.clientHeight-40)/2)-(fontHeight/2)+40);
   }
   
   var ctx = document.getElementById("chartSingleResultDonut");
   
   var myChart = new Chart(ctx, {

       type: 'doughnut',
       data : {
               labels : [],
               datasets: [ 
                           { data: [],
                             backgroundColor:[$(".test-result-passed").css("background-color"),
                                              $(".test-result-failed").css("background-color"),
                                              $(".test-result-unknown").css("background-color"),
                                              $(".test-result-aborted").css("background-color")]
                           }
                         ], 
       },
       
       responsive: true,
       options: {
          tooltips: {
             callbacks: {
               label: function(tooltipItem, data) {
                  var resultType=data['labels'][tooltipItem.index];
                  var resultData=data['datasets'][0].data[tooltipItem.index];
                  return resultType + ": " + resultData + " test cases";
               }
             } //callbacks
          }, 
          animation: {
              animateRotate: true,
              //onProgress: function (chart){ drawThumb(myChart); },
              //onComplete: function (chart){ drawThumb(myChart); },
          },
        
       }, // options
        
   }); // new Chart
   
   return myChart;
};


function updateChartDoughnutResult(responseData){
   var oChart;
   
   if (dPAGE_CHARTS['ChartDoughnutResult'] === undefined) {
      dPAGE_CHARTS['ChartDoughnutResult'] = createChartDoughnutResult();
   };
   
   oChart=dPAGE_CHARTS['ChartDoughnutResult'];
   
   oChart.data.labels=responseData["labels"];
   oChart.data.datasets[0].data=responseData["data"];
   oChart.render();
   oChart.update(500);
   
   /*
    * 
    * update here the panels "passed rate" and "tests executed" as
    * required data is already available from doughnut chart
    * 
    *****************************************************************************/
   var numTests=responseData["data"][0]+
    responseData["data"][1]+
    responseData["data"][2]+
    responseData["data"][3];

    var passRate=(responseData["data"][0]/numTests) *100;
    passRate=Number((passRate).toFixed(1));
   
    $('div#panPassedRateText').text(passRate.toString() + " %");
    $('div#panTestsExecutedText').text(numTests.toString());
};

function createChartRadarFailPerComponent(){
   var ctx = document.getElementById("chartFailPerComponentSpider");
   
   var myChart = new Chart(ctx, {
      type: 'radar',
       data : {
             labels: [],
             datasets: [
                 {
                     label: "passed",
                     backgroundColor: $(".test-result-passed").css("background-color").replace('rgb','rgba').replace(')', ',0.4)'),
                     borderColor: $(".test-result-passed").css("background-color").replace('rgb','rgba').replace(')', ',1.0)'),
                     pointBackgroundColor: $(".test-result-passed").css("background-color"),
                     pointBorderColor: $(".test-result-passed").css("background-color"),
                     //pointHoverBackgroundColor: $(".test-result-failed").css("background-color").replace('rgb','rgba').replace(')', ',0.5)'),
                     //pointHoverBorderColor: $(".test-result-failed").css("background-color").replace('rgb','rgba').replace(')', ',0.7)'),
                     data: []
                 },
                 {
                     label: "failed",
                     backgroundColor: $(".test-result-failed").css("background-color").replace('rgb','rgba').replace(')', ',0.1)'),
                     borderColor: $(".test-result-failed").css("background-color").replace('rgb','rgba').replace(')', ',0.3)'),
                     pointBackgroundColor: $(".test-result-failed").css("background-color").replace('rgb','rgba').replace(')', ',0.3)'),
                     pointBorderColor: $(".test-result-failed").css("background-color").replace('rgb','rgba').replace(')', ',0.3)'),
                     //pointHoverBackgroundColor: $(".test-result-failed").css("background-color").replace('rgb','rgba').replace(')', ',0.5)'),
                     //pointHoverBorderColor: $(".test-result-failed").css("background-color").replace('rgb','rgba').replace(')', ',0.7)'),
                     data: []
                 },
                 {
                     label: "unknown",
                     backgroundColor: $(".test-result-unknown").css("background-color").replace('rgb','rgba').replace(')', ',0.1)'),
                     borderColor: $(".test-result-unknown").css("background-color").replace('rgb','rgba').replace(')', ',0.3'),
                     pointBackgroundColor: $(".test-result-unknown").css("background-color").replace('rgb','rgba').replace(')', ',0.3)'),
                     pointBorderColor: $(".test-result-unknown").css("background-color").replace('rgb','rgba').replace(')', ',0.3)'),
                     //pointHoverBackgroundColor: "rgba(0,0,255,1)",
                     //pointHoverBorderColor: "rgba(0,0,255,1)",
                     data: []
                 },
                 {
                     label: "aborted",
                     backgroundColor: $(".test-result-aborted").css("background-color").replace('rgb','rgba').replace(')', ',0.1)'),
                     borderColor: $(".test-result-aborted").css("background-color").replace('rgb','rgba').replace(')', ',0.3)'),
                     pointBackgroundColor: $(".test-result-aborted").css("background-color").replace('rgb','rgba').replace(')', ',0.3)'),
                     pointBorderColor: $(".test-result-aborted").css("background-color").replace('rgb','rgba').replace(')', ',0.3)'),
                     //pointHoverBackgroundColor: "rgba(0,0,0,0.6)",
                     //pointHoverBorderColor: "rgba(0,0,0,0.6))",
                     data: []
                 }
             ],
         },
       options: {
          tooltips: {
             callbacks: {
               label: function(tooltipItem, data) {
                  var resultType=data['datasets'][tooltipItem.datasetIndex].label;
                  return resultType + ": " +tooltipItem.yLabel + " %";
               }
             } //callbacks
           } // tooltips
       } // options
   });
   
   return myChart;
};

function updateAbortPanel(res){
    // hide QGate panel
    $("#panQGate").addClass("hidden");
    // display abort panel and add abort content
    $("#panAbort").removeClass("hidden");

    //res["message"] is a datastructure:
    //aggregate all entries for display
    var abortedContent = ''
    _.each(res["message"], function(value, key){
        abortedContent += '<div class="col-xs-12"  style="background-color: #f5e9ad"><span style="font-size: 0.8em; margin-left: -10px;">'
                + key + '</span></div>'
                + '<div class="col-xs-12"><span style="font-size: 0.8em; margin-left: -10px;">'
                + value + '</span></div>'
    })

    $("#panAbortMsg").html(abortedContent);
    if(res["reason"].toString()==="WorthToProcess"){
        $("#panAbortReason").html("worth to process");
    }
}

function updateChartRadarFailPerComponent(responseData){
    var oChart;

    if (dPAGE_CHARTS['chartRadarFailPerComponent'] === undefined) {
        dPAGE_CHARTS['chartRadarFailPerComponent'] = createChartRadarFailPerComponent();
    };
    
    oChart=dPAGE_CHARTS['chartRadarFailPerComponent'];

    oChart.data.labels=responseData["labels"];
    oChart.data.datasets[0].data=responseData["pt_passed"];
    oChart.data.datasets[1].data=responseData["pt_failed"];
    oChart.data.datasets[2].data=responseData["pt_unknown"];
    oChart.data.datasets[3].data=responseData["pt_aborted"];
    
    oChart.render();
    oChart.update(500);
}

function updateTestResultBar(responseData, minIndex){
    //total width must never be larger then 100% (otherwise the bar won't be displayed)
    //therefore calculate "passed" based on rest:
    var pt_passed =100 - (responseData["pt_failed"][minIndex] + responseData["pt_unknown"][minIndex] + responseData["pt_aborted"][minIndex]);
    
    $("#pbTestResultPassed").css("width", pt_passed + '%');
    $("#pbTestResultPassed").tooltip('hide')
        .attr('data-original-title', 'Passed: ' + responseData["num_passed"][minIndex] + ' test cases = ' + responseData["pt_passed"][minIndex] + '%')
        .tooltip('fixTitle');
    
    $("#pbTestResultFailed").css("width", responseData["pt_failed"][minIndex] + '%');
    $("#pbTestResultFailed").tooltip('hide')
        .attr('data-original-title', 'Failed: ' + responseData["num_failed"][minIndex] + ' test cases = ' + responseData["pt_failed"][minIndex] + '%')
        .tooltip('fixTitle');
    
    $("#pbTestResultUnknown").css("width", responseData["pt_unknown"][minIndex] + '%');
    $("#pbTestResultUnknown").tooltip('hide')
        .attr('data-original-title', 'unknown: ' + responseData["num_unknown"][minIndex] + ' test cases = ' + responseData["pt_unknown"][minIndex] + '%')
        .tooltip('fixTitle');
    
    $("#pbTestResultAborted").css("width", responseData["pt_aborted"][minIndex] + '%');
    $("#pbTestResultAborted").tooltip('hide')
        .attr('data-original-title', 'aborted: ' + responseData["num_aborted"][minIndex] + ' test cases = ' + responseData["pt_aborted"][minIndex] + '%')
        .tooltip('fixTitle');
}

//both objects require the same input responseData, therefore they are
//treated here together
function updateTestResultBar_and_chartFailPerComponentSpider(responseData){
   var minPercent=101;
   var minIndex=undefined;
   var minComponent='';
   
   for (var i = 0; i < responseData["labels"].length; i++) {
      if (responseData["pt_passed"][i]<minPercent) {
         minPercent=responseData["pt_passed"][i];
         minIndex=i;
         minComponent=responseData["labels"][i];
      }
   }   
   
   // Update test result bar
   if ($("#pbTestResult").length && minIndex!=undefined) {      
      updateTestResultBar(responseData, minIndex)
   }
   // Update quality gate indicator and text possition
   getFromDB( "/tml/result/base/getQualityGate", 
              "version="+$('#selectVersion').find("option:selected").val(),
              function(qGateResponse){ 

                  //workaround till database provides quality gate data
                  //if (qGateResponse['reporting_qualitygate']!=null){
                  if (true){
                     //var qGate = parseInt(qGateResponse['reporting_qualitygate']);
                     
                     //TODO: workaround till database provides quality gate data
                     if ( $('#selectVersion').find("option:selected").text().endsWith("_S")==true ){
                        var qGate=100;
                     } else {
                        var qGate=80;
                     }
                     qGateResponse['reporting_qualitygate']=qGate;

                     var arFailedComponents=[];
                     for (var i = 0; i < responseData["labels"].length; i++) {
                        //OK:   \u2714
                        //Fail: \u2716
                        var sym="\u2714";
                        if (responseData["pt_passed"][i]<qGate) {
                           sym="\u26D4"; 
                           arFailedComponents.push(responseData["labels"][i] + " (" + responseData["pt_passed"][i] + "%)");
                        }
                        responseData["labels"][i]=sym + " " + responseData["labels"][i];
                     }  

                     // show QGate indicator and its info
                     $('#rowQGateIndicator').removeClass("hidden") ;
                     $("#pbTestResultWorstComponentTextPosition").css('width',qGateResponse['reporting_qualitygate'] + "%");
                     $("#pbTestResultWorstComponentMarkerPosition").css('margin-left',qGateResponse['reporting_qualitygate'] + "%")
                     if (minPercent<qGate){
                        $("#pbTestResultWorstComponent").text("(QG " + qGateResponse['reporting_qualitygate'] + "% not passed. Worst comp.: " + minComponent + " " + responseData["pt_passed"][minIndex] + "% passed)");
                     } else {
                        $("#pbTestResultWorstComponent").text("(QG " + qGateResponse['reporting_qualitygate'] + "% passed)");
                     }   

                     // update status row, only use for dashboard view
                     if ($('#rowStatus').length){
                        // Get abort information if execution is aborted
                        getFromDB( "/tml/result/base/getAbortStatus","version="+$('#selectVersion').find("option:selected").val(),
                              function(response){ 
                                 // hide NoQGate panel
                                 $('#panNoQGate').addClass("hidden");
                                 if (response['aborted'] == true){
                                    updateAbortPanel(response);
                                 } else {  
                                    // hide abort panel
                                    $("#panAbort").addClass("hidden");
                                    // display QGate panel and its info 
                                    $("#panQGate").removeClass("hidden");
                                    if (arFailedComponents.length==0){
                                          $('#panQGate').removeClass('panel-danger').addClass('panel-success');
                                          $('#panQGateIcon').removeClass('fa fa-thumbs-o-down').addClass('fa fa-thumbs-o-up');
                                          $("#panQGateText").text("passed");
                                          $("#panQGateFailedComponents").addClass("hidden");
                                    } else {
                                          $('#panQGate').removeClass('panel-success').addClass('panel-danger');
                                          $('#panQGateIcon').removeClass('fa fa-thumbs-o-up').addClass('fa fa-thumbs-o-down');
                                          $("#panQGateText").text("not passed");
                                          $("#panQGateFailedComponents").removeClass("hidden");
                                          
                                          var sArComponents = '';
                                          _.each(_.sortBy(arFailedComponents), function(component) {
                                             sArComponents += '<span id="panQGateLoading" style="font-size: 0.7em">' + component + '</span><br>';
                                          });
                                          
                                          $("#panQGateFailedComponentsList").html(sArComponents);
                                          
                                          //$("#panQGate").effect( 'shake' , { distance : 1, times : 10 } , 2000, function (){} );
                                    }
                                 }
                              }
                        );  
                     }
                  } else { // fi (response['reporting_qualitygate']!=null){
                     // hide Qgate indicator, Qgate panel and Abort panel
                     $('#rowQGateIndicator').addClass("hidden");
                     $('#panQGate').addClass("hidden");
                     $('#panAbort').addClass("hidden");
                     // show NoQgate panel
                     $('#panNoQGate').removeClass("hidden");
                  } //fi (response['reporting_qualitygate']!=null){ //if (qGateResponse['reporting_qualitygate']!=null
                  // Update spider chart, only use for dashboard view
                  if ($("#chartFailPerComponentSpider").length){
                     updateChartRadarFailPerComponent(responseData);
                  }                 
               }); //function(qGateResponse){ 


};

function updateReanimation(responseData){
   //<div id="reanimationText" class="huge">-- h</div>
  
  //console.log(responseDate['period']);
  
  var numOfReanimation=responseData['reanimation'];
  if (numOfReanimation>0){
     $('#reanimation-col').removeClass("hidden");
     $('#space-col').removeClass("col-xs-5");
     $('#space-col').addClass("col-xs-4");
     $('div#reanimationText').text(numOfReanimation.toString());
  } else {
     $('#reanimation-col').addClass("hidden");
     $('#space-col').removeClass("col-xs-4");
     $('#space-col').addClass("col-xs-5")
  }
};

function updateExecutionTime(responseData){
    //<div id="panExeuctionTimeHoursText" class="huge">-- h</div>
    //<div id="panExeuctionTimeMinutesText"class="huge">-- min</div>
   
   //console.log(responseDate['period']);
   
   var minutes=responseData['period']%60;
   var hours=Number(((responseData['period']-minutes)/60).toFixed(0));
   
   
   $('div#panExeuctionTimeHoursText').text(hours.toString() + " h");
   $('div#panExeuctionTimeMinutesText').text(minutes.toString() + " min");
};

function updateMetaData(responseData){ 
  $('div#panMetaDataExecutedAt').html("<b>"+ moment(responseData['time_start']).format("DD.MM.YYYY HH:mm") + "");
  $('div#panMetaDataExecutedBy').text(responseData['tester_account'] + " @ " + responseData['tester_machine']);
  
  if (responseData['jenkinsurl']!=null){
     $("#panMetaDataJenkinsUrl").attr("href",responseData['jenkinsurl']);
  }
  
  //isJenkins is obsolete because jenkinsurl uses BUILD_URL generated by jenkins
  //environment. If it is set, then we know that Jenkins was running.
  
  //if (responseData['isjenkins']==1){
  if (responseData['jenkinsurl']!=null && responseData['jenkinsurl'].trim()!=''){
     $('#panMetaDataJenkins').removeClass("hidden");
     $('#panMetaDataUser').addClass("hidden");
  } else {
     $('#panMetaDataUser').removeClass("hidden");
     $('#panMetaDataJenkins').addClass("hidden");
  }
};

function updateSummerInterpretation(responseData){
    //console.log(responseData['data']);
    $('#editResultInterpretation').summernote('code','This test result is not yet analyzed ...');
    if (responseData['data']!=""){
      $('#editResultInterpretation').summernote('code', b64DecodeUnicode(responseData['data']));
    }
   $('#editResultInterpretation').summernote('destroy');
};

function updateTestResultDataTable(responseData, goToPage0){
   //console.log(responseData)
   
   //issue status changes require a redraw, but the page must
   //not change. E.g. if somebody changes an issue status
   //at page 3 to from "?" to "a", then page mustnt change.
   if (goToPage0==undefined){
      goToPage0=true;
   }
   
  if ( $.fn.dataTable.isDataTable( '#tblTestResult' ) ) {
      var table = $('#tblTestResult').DataTable();
      table.clear();
      table.rows.add(responseData['data']);
      table.draw(false); 
      
      var oTable=$('#tblTestResult').dataTable();
      var info = table.page.info();
      if (info.page!=0 && goToPage0==true){
         oTable.fnPageChange(0,true);
      }
   }
   else {
      var table = $('#tblTestResult').DataTable( {
         
         dom: 'lfrtBip',
        
         buttons: [
             'copyHtml5', 'excelHtml5'
         ],
         aaData: responseData['data'],
         aoColumns: [
                    { 'mDataProp' : "symbol",  title: "Result"}, 
                    { 'mDataProp' : "result_main",  title: "result_main"},
                    { 'mDataProp' : "result_state",  title: "result_state" },
                    { 'mDataProp' : "lastlog",  title: "lastlog" },
                    { 'mDataProp' : "filename",  title: "filename" },
                    { 'mDataProp' : "testname",  title: "Name" },
                    { 'mDataProp' : "component",  title: "Component" },
                    { 'mDataProp' : "tcid",  title: "tcid" },
                    { 'mDataProp' : "fid",  title: "fid" },  
                    { 'mDataProp' : "issue",  title: "issue" }, 
                    { 'mDataProp' : "state",  title: "state" }, 
                    { 'mDataProp' : "test_case_id",  title: "test_case_id" }, 
                    ],
         "columnDefs": [
                        { "visible": false, "targets": [1,2,3,4,10,11] }, //10
                        { "width": "90px", "targets": 0 },
                        { "width": "70px", "targets": 6 },
                        { "width": "35px", "targets": [7,8] },
                        { "width": "80px", "targets": 9 },
                        
                    ],
                    "order": [[ 4, 'asc' ]],
                    "displayLength": 25,
         "createdRow": function ( row, data, index ) {
                
            var row0Html='';
            
            row0Html+='<div id="qualityIndicator_' + data['test_case_id'] + '" data-toggle="tooltip" title="Test case or feature quality" data-content="<span id=&quot;qIText_' + data['test_case_id'] + '&quot;>Loading...</span><canvas style=&quot;height:20px; width:60px;margin-left:4px;vertical-align:bottom;&quot; id=&quot;qICanvas_' + data['test_case_id'] + '&quot;></canvas>" class="qualityIndicator"></div>';
            
            
            //First identify which passed/failed/unknown state symbol need to be displayed
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if ( data['result_main'].trim()=="result:Passed" ) {
               
               row0Html+='<span class="fa-stack test-result-passed symbolTestResult" title="Test result" data-content="passed"><i class="fa fa-square fa-stack-2x"></i><i class="fa fa-check fa-stack-1x" style="color:white"></i></span>';
            }
            if ( data['result_main'].trim()=="result:unknown" ) {
               
              
               if ( data['result_state'].trim()=="result:complete" ) {
                  row0Html+='<span class="fa-stack test-result-unknown symbolTestResult" title="Test result" data-content="unknown"><i class="fa fa-square fa-stack-2x"></i><strong class="fa-stack-1x" style="color:white; margin-left: -0.01em;">u</strong></span>';
               }
               if ( data['result_state'].trim()=="result:deactivated" ) {
                  row0Html+='<span class="fa-stack test-result-unknown symbolTestResult" title="Test result" data-content="unknown - deactivated"><i class="fa fa-square fa-stack-2x"></i><strong class="fa-stack-1x test-result-text">d</strong></span>';
               }
            }
            
            if ( data['result_main'].trim()=="result:Aborted" ) {
               row0Html+='<span class="fa-stack test-result-aborted symbolTestResult" title="Test result" data-content="unknown - aborted"><i class="fa fa-square fa-stack-2x"></i><strong class="fa-stack-1x" style="color:white; margin-left: -0.01em;">a</strong></span>';
            }
            
            if ( data['result_main'].trim()=="result:Failed" ) {
               
               row0Html+='<span class="fa-stack test-result-failed symbolTestResult" title="Test result" data-content="failed" style="margin-top: 0.1em"><i class="fa fa-square fa-stack-2x"></i><i class="fa fa-minus fa-stack-1x" style="color:white"></i></span>';
            }
            
            //second: display search glass in case of lastlog existing
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            if (data['lastlog']!=null){
               row0Html+='<button id="btLastLog_' + data['lastlog'] + '" type="button" class="btn btn-default btn-xs" style="margin-left:8px;margin-top:1px;" onClick="showLastLog(this,'+ data['lastlog'] +')"><i class="fa fa-search" aria-hidden="true"></i></button>' ;  
            }
            
            //third: add IssueTracking dropdown in case of existing issue
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var ddStatus='';
            
            if ( /*data['result_main'].trim()!="result:Passed" && */ data['result_state'].trim()!="result:deactivated"){
               
               var sStatusTxt='';
               var sTimeStamp='';
               var sUserName='';
               if (data['state']==null || data['state']=="?"){
                  sStatusTxt="?";
               } else {
                  var arStatus=data['state'].split('##');
                  sStatusTxt=arStatus[0];
                  sTimeStamp=arStatus[1];
                  sUserName=arStatus[2];
               }
                
               var sInfoField='';
               
               var sDateTime = 'select an item';
               if (sTimeStamp.trim()!=''){
                  sDateTime=getTimeToText(sTimeStamp);
               } 
               
               var sShowEnvelope='';
               if (sUserName.trim()==''){
                  sShowEnvelope="hidden";   
               }       
                
               var ddStatus=templateToHtml('ddIssueStatus',{ 'TEST_CASE_ID'       : data['test_case_id'], 
                                                             'USER_NAME'          : sUserName, 
                                                             'DATETIME'           : sDateTime,  
                                                             'STATUS_ENVELOPE'    : sShowEnvelope ,  
                                                             'STATUS_TEXT'        : sStatusTxt,
                                                             'STATUS_TEXT_QUOTED' : (sStatusTxt=="?") ? "questionmark" : sStatusTxt,
                                                             'DROPDOWN_TYPE'      : (data['result_main'].trim()=="result:Passed") ? "PASSED" : "NOTPASSED",
                                          });
            }; // if data['result_state'].trim()!="result:deactivated")
            
            
            var reLineBreakPattern=/.{70}/g;
            if ($(window).width()>1200){
               reLineBreakPattern=/.{70}/g;   
            } 
            if ($(window).width()>1200){
               reLineBreakPattern=/.{70}/g;
            } 
            if ($(window).width()>1400){
               reLineBreakPattern=/.{100}/g; 
            } 
            if ($(window).width()>1600){
               reLineBreakPattern=/.{100}/g;
            } 
            if ($(window).width()>1800){
               reLineBreakPattern=/.{120}/g;
            } 
            if ($(window).width()>2000){
               reLineBreakPattern=/.{140}/g;
            }
            //force a line break after each 100 chars. This is to avoid a broken
            //table due to to long test names.
            var sTestName=data['testname'].replace(reLineBreakPattern, "$&" + "<br>");            
            sTestName=sTestName + '<div id="commentField_' + data['test_case_id'] + '" style="margin-top:5px;"></div>'; 
                       
            $('td', row).eq(0).html(row0Html + ddStatus );
            
                 
            $('td', row).eq(1).html(sTestName);         
            
            $('td', row).eq(5).html('<div id="linkField_' + data['test_case_id'] + '"></div>'); 
        
            // remove redundant component: from component row
            ////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var splitComponent=data['component'].split(":");
            $('td', row).eq(2).html(splitComponent[1]);
            
         },
         "drawCallback": function( settings ) {
            
            var arCol=[ '#FF0000', //red
                        '#FF1000',
                        '#FF2000',
                        '#FF3000',
                        '#FF4000',
                        '#FF5000',
                        '#FF6000',
                        '#FF7000',
                        '#FF8000',
                        '#FF9000',
                        '#FFA000',
                        '#FFB000',
                        '#FFC000',
                        '#FFD000',
                        '#FFE000',
                        '#FFF000',
                        '#FFFF00',
                        '#F0FF00',
                        '#E0FF00',
                        '#D0FF00',
                        '#C0FF00',
                        '#B0FF00',
                        '#A0FF00',
                        '#90FF00',
                        '#80FF00',
                        '#70FF00',
                        '#60FF00',
                        '#50FF00',
                        '#40FF00',
                        '#30FF00',
                        '#20FF00',
                        '#10FF00'  //green
                      ];
            
            //
            //  FIRST: group result by file name
            // 
            var api = this.api();
            var rows = api.rows( {page:'current'} ).nodes();
            var last=null;
            
            api.column(4, {page:'current'} ).data().each( function ( group, i ) {
                if ( last !== group ) {
                    var arGroup=group.split("##");
                    var sFileName=arGroup[0];
                    var sFileId=arGroup[1];
                   
                    $(rows).eq( i ).before(                         
                          
                        '<tr class="group">' +
                           '<td colspan="6">' +
                           sFileName +
                           '<button type="button" class="btn btn-default btn-xs pull-right" onClick="showFileHeader(\'' + sFileId + '\')"><span class="caret"></span></button>' +
                           '</td>' +
                        '</tr>' +
                        '<tr id="tmlheader_' + sFileId + '" class="TMLHeader hidden"><td colspan="6"><div id="tmlheadertext_' + sFileId + '"><pre>Loading ...</pre></div></td></tr>'
                    );
                    
                    last = group;
                }
            } );
            
           
            //
            //  Second: render relevant comments
            // 
            var visibleRow = this.api().rows( {page:'current'} )
   
               _.each(visibleRow.data(),function(data){
                  
                     
                  //
                  //  Load comments from database
                  //
                  /////////////////////////////////////////////////////////////////
            
                  //$("#commentField_" + data['lastlog']).html("ABCDEFG");
                          
                  //if ( /*data['result_main'].trim()!="result:Passed" &&*/ $("div[id^='panComment_" + data['test_case_id'] + "_']").length==0 ){
                  if( $("#commentField_" + data['test_case_id']).is(':empty') ){
                  
                     getFromDB( "/tml/result/base/getTestCaseComments", 
                                "testcaseid="+data['test_case_id'],
                                function(response){
                
                                   var bHasComment=false;
                          
                                   _.each(response['data'],function(comment){

                                      bHasComment=true;
          
                                      var sDateTime=getTimeToText(comment['timestamp']);
                                                 
                                      var sCommentText='';
                                      if (comment['comment']!=''){
                                         //for BLOBS
                                         //sCommentText=b64DecodeUnicode(String.fromCharCode.apply(null, comment['comment']['data']));
                                         //for LONGTEXT
                                         sCommentText=b64DecodeUnicode(comment['comment']);
                                      }
                                      
                                      var sStatusEditButtons='hidden';
                                      if (getUser()==comment['user']){
                                         sStatusEditButtons=''; 
                                      }
                                                                                               
                                      var sComment=templateToHtml('panComment',{ 'TEST_CASE_ID'    : comment['test_case_id'], 
                                                                                 'COMMENT_ID'      : comment['number'], 
                                                                                 'COMMENT_TEXT'    : sCommentText,
                                                                                 'DATETIME'        : sDateTime,  
                                                                                 'USER_NAME'           : comment['user_name'],  
                                                                                 'USER_BADGE_COLOR'    : getUserColor(comment['user_name']),
                                                                                 'USER_BADGE_LETTER'   : comment['user_name'].split(" ")[1].charAt(0).toUpperCase(),
                                                                                 'STATUS_EDITBUTTONS'  : sStatusEditButtons
                                                                 });
                                      
                                      //attach the new comment (panel) to the top
                                      $("#commentField_" + data['test_case_id']).append(sComment);
                                             
                                   }); // _.each response['data']
                                   
                                   if (bHasComment){
                                      $( '<a style="font-size:0.85em;" href="#" onClick="event.preventDefault(); addComment(' + data['test_case_id'] + ');" class="pull-right"><i class="fa fa-comment-o"></i> add comment</a>' ).insertAfter( "#commentField_" + data['test_case_id'] );
                                   }
                     }); //getFromDB
                     
                     visibleRow.invalidate('dom');
                  }; //if (data['result_main'].trim()!="result:Passed")
                  
                  //
                  // Third: Load relevant issue links from database
                  //
                  /////////////////////////////////////////////////////////////////
                  //if ( /*data['result_main'].trim()!="result:Passed" &&*/ $("div[id^='btnTicket_" + data['test_case_id'] + "_']").length==0 ){
                  if( $("#linkField_" + data['test_case_id']).is(':empty') ){
                     getFromDB( "/tml/result/base/getIssueLinks", 
                                "testcaseid="+data['test_case_id'],
                                function(response){ 
                                   
                                   _.each(response['data'],function(link){
                                      var sButtonTicket=templateToHtml('btnTicket',{ 'TEST_CASE_ID'    : link['test_case_id'], 
                                                                                     'LINK_ID'         : link['number'],
                                                                                     'BTN_STYLE'       : 'info',
                                                                                     'BTN_URL'         : link['url'].split("####")[0],
                                                                                     'BTN_TEXT'        : 'RTC-' + link['url'].split("####")[1],
                                                                                     'STATUS_DELETE'   : '' 
                                                                      });
                                      $("#linkField_" + data['test_case_id']).append(sButtonTicket);
                                   }); //_.each(response['data']
                                
                           }); //getFromDB
                     
                     visibleRow.invalidate('dom');
                     
                  };  //if (data['result_main'].trim()!="result:Passed"){  
                  
                  //
                  // fourth: display related quality indicator in correct color
                  //
                  /////////////////////////////////////////////////////////////////
                  getFromDB( "/tml/result/base/getTestCaseStabilityByTestName", 
                        "test_case_id="+data['test_case_id'],
                        function(response){ 
                     
                           if (data['result_state']!="result:deactivated"){
                              var pass_rate=response[0]['pass_rate'];
                              
                              var colIndex=Math.round(pass_rate*(arCol.length-1));
                              
                              $('#qualityIndicator_' +  data['test_case_id']).css("border-left","3px solid " + arCol[colIndex]);
                              $('#qualityIndicator_' +  data['test_case_id']).css("border-right","3px solid " + arCol[colIndex]);
                             
                           } else {
                              $('#qualityIndicator_' +  data['test_case_id']).css("border-left","3px solid white");
                              $('#qualityIndicator_' +  data['test_case_id']).css("border-right","3px solid white");
                              $('#qualityIndicator_' +  data['test_case_id']).attr('data-content', "Test is deactivated.");
                           }

                  }); //getFromDB
                 
            
               }); //_.each visibleRowData 

         },
         "infoCallback": function( settings, start, end, max, total, pre ) {
            //elements created in createdRow need tootip class attached here
            $('.symbolTestResult').popover( { trigger:'hover' });
            
            $('.qualityIndicator').popover( { trigger:'hover', html : true  }).on('shown.bs.popover', function() { 
               
              var popover=$(this);
              
              var arId=popover.attr('id').split("_");
              var id=arId[1];

              getFromDB( "/tml/result/base/getTestCaseStabilityByTestName", 
                    "test_case_id="+id,
                    function(response){ 
                       
                        var pass_rate=response[0]['pass_rate'];
                        
                        var qualityWord='';
                        if (pass_rate<=1) { qualityWord="Very good "; }
                        if (pass_rate<0.9) { qualityWord="Good "; }
                        if (pass_rate<0.8) { qualityWord="Poor "; }
                        if (pass_rate<0.3) { qualityWord="Very poor "; }
                        
                        $("#qIText_" + id).text(qualityWord + 'pass rate: ' + Math.round(pass_rate*10000)/100 + '%');
              
              }); //getFromDB
             
              getFromDB( "/tml/result/base/getTestCaseStabilityFlowByTestName", 
                     "test_case_id="+id,
                     function(response){ 
                     
                     //youngest test results must be right most displayed...
                     response=response.reverse();

                     try {
                        var ctx=$("#qICanvas_" + id)[0].getContext("2d");
                        
                        for (var i=0; i<response.length; i++){
                           
                           var col;
                           var h;
                           if (response[i]['result_main'].toLowerCase()== 'passed'){ col="#00FF00"; h=1; }
                           if (response[i]['result_main'].toLowerCase()=='unknown'){ col="#0000FF"; h=2; }
                           if (response[i]['result_main'].toLowerCase()== 'failed'){ col="#FF0000"; h=3; }
                           if (response[i]['result_main'].toLowerCase()=='aborted'){ col="#C0C0C0"; h=2; }               
                           
                           ctx.beginPath();
                           ctx.moveTo(17+(20*i),150);
                           ctx.lineTo(17+(20*i),150-(h*50));
                           ctx.lineWidth=20;
                           ctx.strokeStyle=col;
                           ctx.stroke();
                       } //for
                    } catch (err){
                       // nothing to do if the canvas is not displayed...
                    } //catch
  
              }) //getFromDB 
                         
            }) //$('.qualityIndicator').popover.on
                        
            //provide default functionality
            return "Showing " + start +" to "+ end + " of " + total + " entries";
          },
         "initComplete": function(settings, json) {
             $("#loadingTable").hide();      
             
             //if a tc_filter was provided with the http request, then block HMI except
             //of clear all filters button.
             if (dQUERY_STRING['tc_filter']!=undefined){
                //would be smart, but causes unfortunately a second redraw
                //which duplicates comments and links
                //error: filterDataTable(null, dQUERY_STRING['tc_filter'] , 11);
                
               //  $('#btddSelectedComponent').prop('disabled', true);
               //  $('#btSelectedComponent').prop('disabled', true);
                $('#bt_notPassed').prop('disabled', true);
                $('#bt_notAnalyzed').prop('disabled', true);
                $('#bt_noTcid').prop('disabled', true);
                $('#bt_noFid').prop('disabled', true);
                
                $('#bt_clearAllFilters').removeClass('btn-info').addClass('btn-danger');
             }
         },
     } );
      
     //make searchfield only working after keypress. This avoids issues with reentrance in 
     //callbacks
     var oTable = $('#tblTestResult').dataTable();
     $('#tblTestResult_filter input').unbind();
     $('#tblTestResult_filter input').bind('keyup', function(e) {
                                                                   if(e.keyCode == 13) {
                                                                      oTable.fnFilter(this.value);
                                                                   };
                                            }); //bind 
   }; //else
}

function createChartNotAnalyzedIssues(){
   var ctx = document.getElementById("chartNotAnalyzedIssues");
   
   var myChart = new Chart(ctx, {
      type: 'radar',
       data : {
             labels: [],
             datasets: [
                 {
                     label: "not analyzed",
                     backgroundColor: $(".test-result-failed").css("background-color").replace('rgb','rgba').replace(')', ',0.1)'),
                     borderColor: $(".test-result-failed").css("background-color").replace('rgb','rgba').replace(')', ',1.0)'),
                     pointBackgroundColor: $(".test-result-failed").css("background-color"),
                     pointBorderColor: $(".test-result-failed").css("background-color"),
                     //pointHoverBackgroundColor: $(".test-result-failed").css("background-color").replace('rgb','rgba').replace(')', ',0.5)'),
                     //pointHoverBorderColor: $(".test-result-failed").css("background-color").replace('rgb','rgba').replace(')', ',0.7)'),
                     data: []
                 },
                
             ],
         },
     options : {         
         pointDot:false,
         showTooltips: false,
         scaleOverride: true,
         scaleSteps: 4,
         scaleStepWidth: 5,
         scaleStartValue: 2,
         tooltips: {
            callbacks: {
              label: function(tooltipItem, data) {
                 var resultType=data['datasets'][tooltipItem.datasetIndex].label;
                 return resultType + ": " +tooltipItem.yLabel + " issues";
              }
            } //callbacks
          } // tooltips
     }
   });
   
   return myChart;
};

function updateChartNotAnalyzedIssues(responseData){
   var oChart;
    
   if (dPAGE_CHARTS['chartNotAnalyzedIssues'] === undefined) {
      dPAGE_CHARTS['chartNotAnalyzedIssues'] = createChartNotAnalyzedIssues();
   };
   
   //console.log(responseData)
   oChart=dPAGE_CHARTS['chartNotAnalyzedIssues'];
   
   oChart.data.labels=responseData["labels"];
   oChart.data.datasets[0].data=responseData["not_analyzed"];

   oChart.render();
   oChart.update(500);
   
};


function createChartResetVsComponentLine(){
   
   var ctx = document.getElementById("chartResetVsComponentLine");
   
   var baseController = Chart.controllers.line;
   Chart.defaults.LineWithComponents = Chart.defaults.line;

   Chart.controllers.LineWithComponents = Chart.controllers.line.extend({
       draw: function (ease) {
           baseController.prototype.draw.apply(this, arguments);

           //this draws a line...
           /*ctx.save();
           ctx.beginPath();
           ctx.moveTo(xaxis.getPixelForValue(xdata[2]), yaxis.top);
           ctx.strokeStyle = '#ff0000';
           ctx.lineTo(xaxis.getPixelForValue(xdata[2]), yaxis.bottom);
           ctx.stroke();
           ctx.restore();*/
           
           //console.log(this)
           
           
           var xdata= this.chart.chart.config.data.labels;
           var ydata= this.chart.chart.config.data.datasets[0].data;
           var component= this.chart.chart.config.data.datasets[1].data;
           
            var chart = this.chart;
            var ctx = chart.chart.ctx;
            ctx.save();
            
            var xaxis = chart.scales['x-axis-0'];
            var yaxis = chart.scales['y-axis-0'];
            
            var oldy=0;
            
            for (var index = 0; index < xdata.length; index++) {
            
               var y= yaxis.getPixelForValue(ydata[index]) + 5;
               
               //only draw if texts are not too close together
               if (Math.abs(oldy-y)>8){
               
                  this.chart.chart.ctx.font = this.chart.chart.ctx.font.replace(/\d+px/, "10px");
                  this.chart.chart.ctx.fillStyle = getUserColor(component[index] + "A"); //"rgba(0,0,0,0.8)";
                  this.chart.chart.ctx.fillText(component[index],xaxis.getPixelForValue(xdata[index]) + 3, yaxis.getPixelForValue(ydata[index]) + 3);
                  
                  oldy= yaxis.getPixelForValue(ydata[index]) + 5;
               } // if (Math.abs(oldy-y)>5)
            } // for index
            ctx.restore();
       } // draw: function
   }); //  Chart.controllers.line.extend
   
   //console.log(responseData);
   var data= {
      labels: [],
      datasets: [{
          type: 'LineWithComponents',
          label: 'resets vs. component over time',
          backgroundColor: "rgba(0,0,255,0.05)",
          data: [],
          borderColor: 'rgba(0,0,255,0.8)',
          fill: true,
          borderWidth : 1,
          lineTension : 0.1
      },
      {
         type: 'line',
         label: '',
         backgroundColor: "rgba(255,255,255,1)",
         data: [],
         borderColor: 'rgba(255,255,255,1)',
         fill: false,
         borderWidth : 1,
         lineTension : 0.3
     }, 
     ] // datasets
   } //data
   
   var myChart = new Chart(ctx,  {
       xLableAngle: 0,
       type: 'LineWithComponents',
       
       data : data,
       options: {
          responsive: true,
          hoverMode: 'label',
          hoverAnimationDuration: 400,
          showTooltips: true,
          maintainAspectRatio: false,
 
          scales: {
            xAxes: [{
              type: 'time',
              time : {
                 displayFormats : { hour : 'HH:mm' },
                 unit: 'hour',
              }, // time
             
            }, // xAxes
            ] //xAxes
          }, // scales
          
          tooltips: {
             callbacks: {
               title: function (tooltipItem, data){
                  //the date is just there that the chart displays the data, but it has no relevance.
                  //ignore the date.
                  return data.labels[tooltipItem[0].index].split(" ")[1];
               },
               label: function(tooltipItem, data) {
                  return "reset by: " + data.datasets[1].data[tooltipItem.index];
               }
             }
           }
  
       } // options
         
    }); // new Chart
    
    return myChart;
    
};

function updateChartResetVsComponentLine(responseData){
   
   var oChart;
   
   //console.log(responseData)
   
   if (dPAGE_CHARTS['ChartResetVsComponentLine'] === undefined) {
      dPAGE_CHARTS['ChartResetVsComponentLine'] = createChartResetVsComponentLine();
   };
   
   oChart=dPAGE_CHARTS['ChartResetVsComponentLine'];
   
   oChart.data.labels=responseData["time"];
   oChart.data.datasets[0].data=responseData["num_resets"];
   //this data array is used to know the name of the component
   //in the draw method
   oChart.data.datasets[1].data=responseData["labels"];
   

   oChart.update(500);
   
};

function changeTestSuiteStatus(item){
   var sSelectedMenuItem=item.text().replace("set","").trim();

   postToDB("/tml/auth/postTestSuiteState", {
      'version'      : $('#selectVersion').find("option:selected").val(),
      'result_state' : sSelectedMenuItem,
      'action'       : enHistoryAction.changedTestSuiteState,
      'action_data'  : sSelectedMenuItem
   }, function(response) {
         if (response['data'] == "not_authorized") {
            showSessionExpiredModal();
         } else {
            updateBtTestSuiteStatus({ 'result_state' : sSelectedMenuItem });
            //the update of the state button required an update of the icon in the
            //software version select box
            initSelectVersion();
         } // if not OK
      } // function(response)
   ); // postToDB "setIssueStatus"
   
};

function updateBtTestSuiteStatus(responseData){
   var sSymbol   = dMENU_TEMPLATE['testSuiteState'][responseData['result_state']]['style'][0];
   var sBackColor=  dMENU_TEMPLATE['testSuiteState'][responseData['result_state']]['style'][1];
   
   $('#btTestSuiteCurrentStatus').html('<i class="' + sSymbol + '" ></i> ' + responseData['result_state'] + ' <span class="caret"></span>'  );
   $('#btTestSuiteCurrentStatus').css('background-color', sBackColor );
  
   var sMenu='';
   _.each(dMENU_TEMPLATE['testSuiteState'][responseData['result_state']]['menu'],function(menuItem){
      if (menuItem[0].trim()!="divider"){
         var sPre="set ";
         if (menuItem[0]=='delete report'){
            sPre='';
         }
         sMenu+='<li style="background-color:' + menuItem[2] + ';"><a href="#" onclick="changeTestSuiteStatus($(this))" onmouseover="$(this).css(\'background-color\',\'' + menuItem[2] + '\');"><div style="width: 30px; float:left; text-align: center; margin-left: -10px;"><i class="' + menuItem[1] + '"></i> </div>' + sPre + menuItem[0] + '</a></li>';
      } else {
         sMenu+='<li class="divider"></div>';  
      }
   });
  
   
   $('#btArTestSuiteStates').html(sMenu);
   if (responseData['result_state']==="in progress"){
      displayAutoReloadBtn();
   } else {
      clearInterval(oReloadTimer); // Clear existing timer
      hideAutoReloadBtn();
   }
}

function updateTestsuiteSelection(responseData, filter){
   var testsuiteElem = $('#testsuiteRelationship');
   var testsuiteInfo = '';
   var releasedStates = ['limited release', 'released' , 'releasing', 'blocked release'];
	_.each(responseData, function(exections, variant){
      var listExecutions = '';
      var variantID = "testsuite-"+variant;
      _.each(exections, function(testRun){
         var matchFilter = false;
         switch(filter){
            case "all":
               matchFilter = true;
               break;

            case "smokeTest":
               if (testRun['category_main']=="smoketest" || testRun['version_sw_target'].slice(-2)=="_S"){
                  matchFilter = true;
               }
               break;

            case "unitTest":
               if (testRun['category_main']=="unittest" || testRun['version_sw_target'].slice(-2)=="_U" || testRun['version_sw_target'].slice(-4)=="_U64"){
                  matchFilter = true;
               }               
               break;

            case "released":
            default:
               if (releasedStates.indexOf(testRun['result_state']) > -1){
                  matchFilter = true;
               }
               break;                  
         }   
         if (matchFilter){      
            var testRunClass = "row btn testExecution";
            if (testRun['test_result_id'] == $('#selectVersion').find("option:selected").val()){
               testRunClass += " selected";    
            }
            var iconSWVersionElem = iconStateVersion(testRun['version_sw_target'], testRun['category_main'], testRun['result_state']);
            var testRunLink = sDOMAIN+sSubFolder+'/index.html?branch='+testRun['branch']+'&variant='+variant+'&version='+ testRun['test_result_id'];
            var paramsEvent = "event, this,'"+testRun['branch']+"',"+"'"+variant+"',"+"'"+testRun['test_result_id']+"'";
            var testRunTag = '<a class="'+testRunClass+'" href="'+testRunLink+'" onclick="updateSelectedTestsuiteExecution('+paramsEvent+');">'+iconSWVersionElem+'</a>';
            listExecutions += testRunTag;
         }
      });
      if (listExecutions !== ''){
         var variantHeader = '<div class="row testsuiteVariant btn collapsed" data-toggle="collapse" data-target="#'+variantID+'" aria-expanded="false"><div>'+variant+'</div></div>';
         var variantExecutions = '<div id="'+variantID+'" class="variantExecutions collapse" aria-expanded="false">'+listExecutions+'</div>';
         // check if the expandedVariants were stored in sessionStorage
         // make them expanded as default state
         if (('expandedVariants' in sessionStorage) && (sessionStorage['expandedVariants'].indexOf(variantID)>-1)){
            variantExecutions = '<div id="'+variantID+'" class="variantExecutions collapse in" aria-expanded="true">'+listExecutions+'</div>';
            variantHeader = '<div class="row testsuiteVariant btn collapsed" data-toggle="collapse" data-target="#'+variantID+'" aria-expanded="true"><div>'+variant+'</div></div>';
         }         
         
         testsuiteInfo += variantHeader;
         testsuiteInfo += variantExecutions;
      }
   });
   if (testsuiteInfo === ''){
      // this is message when there is no related execution
      testsuiteInfo = '<div style="padding-left:5px;">no related execution</div>';
   }    
   testsuiteElem.html(testsuiteInfo);
   sessionStorage['testsuite-filter'] = filter;
}
function updateTestsuiteRelationship(responseData){
   updateTestsuiteSelection(responseData, sessionStorage['testsuite-filter']);
   var filterTestsuite = {
      "all": {name: "show all versions", selected: false},
      "released": {name: "show only released versions", selected: true},
      "smokeTest": {name: "show only smoke test", selected: false},
      "unitTest": {name: "show only unit test", selected: false}
   };
   if (sessionStorage['testsuite-filter'] !== "undefined"){
      _.each(filterTestsuite, function(value, key){
         filterTestsuite[key].selected = false;
      })
      filterTestsuite[sessionStorage['testsuite-filter']].selected = true;
   }
   var el = $('#ctxmenuTestsuiteRelationship');    
   el.moreMenu({
      data: filterTestsuite,
      selectOpt: function(selected){
         updateTestsuiteSelection(responseData, selected)
      },
      resData: function(data){
         // for furture develop
         // console.log(data)
      },
      multiChoices: false
   });

}

function updateSelectedTestsuiteExecution(event, elem, branch, variant, version){
    // prevent redirect to href link
    // we are still able to open link in new window/tab by right-clicking    
    event.preventDefault();
    loadingAnimation();
    // remove selected class from previous selected execution
    // and add it for new choice
    $('#testsuiteRelationship .selected').removeClass('selected');
    $(elem).addClass("selected");

    // update selected branch, variant, version and reinit all
    dQUERY_STRING['branch']  = branch;
    dQUERY_STRING['variant'] = variant;
    dQUERY_STRING['version'] = version;    
    initSelectsBranchProjectVariantVersion();
}

