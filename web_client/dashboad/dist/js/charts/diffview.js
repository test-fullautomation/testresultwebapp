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

function updateDiffview(response){
   var jdata = response['data']
   // console.log(jdata.length)
   $('#chartDiffview').empty();
   // var index = 0;
   var width = 984,
       height = 760,
       start = 0,
       end = 2.25,
       paddingSpiralLine = 4,
       paddingVersion = 6,
       margin = {top:20,bottom:20,left:20,right:20,center:15};

   var numSpirals = Math.ceil(jdata.length/140);
   numSpirals = (numSpirals>10) ? 10 : numSpirals;

   var theta = function(r) {
      return numSpirals * Math.PI * r;
   };

   var r = d3.min([width, height]) / 2 - margin.center;

   var radius =  d3.scale.linear()
                  .domain([start, end])
                  .range([margin.center, r]);
   
   var svg = d3.select("#chartDiffview").append("svg")
               .attr("width", width + margin.right + margin.left)
               .attr("height", height + margin.bottom + margin.top)
               .style("background", "#000000")
               .append("g")
               .attr("transform", "translate(" + parseInt((width / 2)+margin.left) + "," + parseInt((height / 2)+margin.top) + ")");      
   
   var points = d3.range(start, end + 0.001, (end - start) / 1000);

   var spiral =  d3.svg.line.radial()
                     .interpolate('cardinal')
                     .angle(theta)
                     .radius(radius);
   
   // Draw the spiral path                  
   var path = svg.append("path")
                  .datum(points)
                  .attr("id", "spiral")
                  .attr("d", spiral)
                  .style("fill", "none")
                  .style("stroke", "steelblue")
                  .style("stroke-width", 1);
   
   var spiralLength = path.node().getTotalLength();
         N = jdata.length,
         barWidth = (spiralLength / N) - 1;
   
   var lineScale = d3.scale.linear()
      .domain(d3.extent(jdata, function(d, i){
         return i;
      }))
      .range([0, spiralLength]);   


   // enteringAllData() will enter all data, then group data by testcase
   // each group (testcase) will append new circles inside
   enteringAllData()

   // Disable component label if spiral line is too long
   if(jdata.length<2000){
      AddComponentLabel()
   }
   AddTooltipForTC()
   AddLegendVersion()
   AddContextMenu()

   function AddComponentLabel(){
      // Add component labels
      var duplicatedComponent = {}
      svg.selectAll("text")
      .data(jdata)
      .enter()
      .append("text")
      .attr("dy", 15)
      .style("text-anchor", "start")
      .style("font", "15px arial")
      .append("textPath")
      // only add for the first of each component
      .filter(function(d){
         if (!duplicatedComponent[d.component]){
            duplicatedComponent[d.component] = 1;
            return true;
         }
         return false;
         })
      .text(function(d){
         return d.component;
      })
      // place text along spiral
      .attr("xlink:href", "#spiral")
      .style("fill", function(d){ return getComponentColor(d.component)})
      .attr("startOffset", function(d){
         return ((d.linePer / spiralLength) * 100) + "%";
      })
   }

   function AddTooltipForTC(){
      // Defined tooltip box for test case hovering
      var tooltip = d3.select("#chartDiffview")
      .append('div')
      .attr('class', 'tooltip');
      
      tooltip.append('div')
      .attr('class', 'testVersion');
      tooltip.append('div')
      .attr('class', 'testDetail');
      tooltip.append('div')
      .attr('class', 'testMachine');
      tooltip.append('div')
      .attr('class', 'testName');

      // Append tooltip for each testcase of execution
      svg.selectAll("circle")
      .on('mouseover', function(d) {
      tooltip.select('.testVersion').html("<b> Version: " + d.version + "</b>");
      tooltip.select('.testMachine').html("<b> TestMachine: " + d.machine + "</b>");
      tooltip.select('.testName').html("<b>" + d.name + "</b>");
      tooltip.select('.testDetail').html("<b>" +d.component+": " + d.result + " (" +Number(d.duration/60000).toFixed(2)+" min)</br>");

      d3.select(this)
      .style("fill","#FFFFFF")
   
      tooltip.style('display', 'block');
      tooltip.style('opacity',2);
      tooltip.style('color', "#000000");
      tooltip.style('background',"#FFFFFF");
      tooltip.style('padding',"5px");
   
      })

      .on('mousemove', function(d) {
      tooltip.style('top', (d3.event.layerY + 10) + 'px')
      .style('left', (d3.event.layerX - 25) + 'px');
      })
      .on('mouseout', function(d) {
      d3.selectAll("circle")
      .style("fill", function(d,i){ return getComponentColor(d.component) })
      .style("stroke", "none")
   
      tooltip.style('display', 'none');
      tooltip.style('opacity',0);
      });
   }  

   function AddLegendVersion(){
      var legendVersion = d3.select("#chartDiffview")
      .append('div')
      .attr('class', 'legend')
      .style('position', 'absolute')
      .style('bottom', '25px')
      .style('left', '15px')
      .style('width', 'fit-content')
      .style('padding', '05px')
      .style('border', 'solid 1px black')
      .style('background', "#f5f5f5")
      .style('font-size', "12px");

      response['version'].reverse().forEach(function(sVersionID){
         var oVersionDetail = response['version_detail'][sVersionID];
         // remove prefix of version name then add branch and variant info
         var sShortVersName = oVersionDetail.version_name.replace(/\d{4}_\d{6}_/g, "");
         var sVersionName   = sShortVersName + " ( " + oVersionDetail.branch + " - " + oVersionDetail.variant + " )";
         legendVersion.append('div')
         .attr('class', 'version')
         .style('width', 'fit-content')
         // .style('cursor', 'pointer')
         .html(iconStateVersion(sVersionName, oVersionDetail.category, oVersionDetail.state));
      })

   }

   function enteringAllData(){
      var circleGroups = svg.selectAll('.circleGroups')
      .data(jdata)
      .enter()
      .append('g')
      .each(function(d,i){
         var linePer = lineScale(i),
         posOnLine = path.node().getPointAtLength(linePer); 
         d.linePer = linePer; // % distance are on the spiral
         d.x1 = posOnLine.x; // x postion on the spiral
         d.y1 = posOnLine.y; // y position on the spiral
         // find position of circles above spiral line
         d.radius =Math.sqrt( Math.pow(d.x1,2) + Math.pow(d.y1,2))

         // find next point on line, to rotate line of dots 90 degree with spiral line
         // if meet the last point, get the previous point instead
         var nextIdx = linePer+0.01;
         if(i == jdata.length -1){
            nextIdx = linePer-0.01; 
         }
         var posOnLineNext = path.node().getPointAtLength(nextIdx); 
         d.x2 = posOnLineNext.x;
         d.y2 = posOnLineNext.y;

         // distance between current point and next point
         d.dist = Math.sqrt( Math.pow(d.x1-d.x2, 2) + Math.pow(d.y1-d.y2, 2))

         // calculate normal vector
         if(i == jdata.length -1){
            d.xnVec = (d.y1 - d.y2)/d.dist;
            d.ynVec = (d.x2 - d.x1)/d.dist; 
         } else {
            d.xnVec = (d.y2 - d.y1)/d.dist;
            d.ynVec = (d.x1 - d.x2)/d.dist;
         }

         // data for filter
         if ((d.detail.length==response['version'].length) && (d.detail.every(function(elem){ return elem.result=="Passed"}))){
            d.bAllPassed       = true;
            d.bHaveNotExisting = false;
            d.bHaveFailed      = false;
            d.bHaveUnknown     = false;
         } else {
            d.bAllPassed       = false;
            d.bHaveNotExisting = (d.detail.length<response['version'].length) || (d.detail.some(function(elem){ return elem.result=="not existing"}));
            d.bHaveFailed      = d.detail.some(function(elem){ return elem.result=="Failed"});
            d.bHaveUnknown     = d.detail.some(function(elem){ return elem.result=="unknown"});
         }
         
         // append child nodes
         var parentData = d;
         var circles = d3.select(this)
         .selectAll(".circles")
         .data(d.detail)
         .enter()
         .append("circle")
         .attr('cx', function(d, i){ 
            dist2Spiral = paddingSpiralLine + paddingVersion*i
            d.cx = parentData.x1 + dist2Spiral*parentData.xnVec;
            d.cy = parentData.y1 + dist2Spiral*parentData.ynVec;
            d.component = parentData.component;
            d.name = parentData.name;
   
            if (parentData.detail.length < i+1){
               d.result = "not existing";
            }
            return d.cx
         })
         .attr('cy', function(d){ return d.cy})
         .attr('r', function(d,i){
            var r=1.5;
            if (d.result=="not existing"){
               r=0.1;
            } else if (d.result!="Passed"){
               r=3;
            }
            return r;
         })
         .attr("class", function(d,i){ return d.result})
         .style("fill", function(d,i){ return getComponentColor(d.component) })
         .style("cursor", function(d){
            if (d.result!="Passed" && d.result!="not existing"){
               return "pointer";
            }
         })
         .on('click', function(d){
            if (d.result!="Passed" && d.result!="not existing"){
               d.cursor = "pointer";
               showLastLog(this, d.testcaseID);
            }
         });
      });
   }

   function AddContextMenu(){
      if('diffview-filter' in dQUERY_STRING){
         sessionStorage.setItem('diffview-filter', dQUERY_STRING['diffview-filter']);
         delete dQUERY_STRING['diffview-filter'];
      }
      applyFilter(sessionStorage.getItem('diffview-filter') || "unpassed");
      var filterDiffview = {
         "all": {name: "show all tests", selected: false},
         "unpassed": {name: "show other(s) than passed", selected: true},
         "missed": {name: "show missing/added test(s)", selected: false},
         "failed": {name: "show failed test(s)", selected: false},
         "unknown": {name: "show unknown test(s)", selected: false}
      };
      if (sessionStorage.getItem('diffview-filter') !== null){
         _.each(filterDiffview, function(value, key){
            filterDiffview[key].selected = false;
         })
         filterDiffview[sessionStorage.getItem('diffview-filter')].selected = true;
      } 
      var el = $('#ctxmenuDiffview');    
      el.moreMenu({
         data: filterDiffview,
         selectOpt: function(selected){
            applyFilter(selected);
            sessionStorage.setItem('diffview-filter', selected);
         },
         resData: function(data){
            // for furture develop
            // console.log(data)
         },
         multiChoices: false
      });
   }

   function applyFilter(filterOpt){
      var circleGroups = svg.selectAll('g')
      .style('visibility', function(d){
         displayState = "visible";
         switch(filterOpt){
            case 'unpassed':
               if(d.bAllPassed){
                  displayState = "hidden";
               } 
               break;
            case 'missed':
               if(!d.bHaveNotExisting){
                  displayState = "hidden";
               }
               break;
            case 'failed':
               if(!d.bHaveFailed){
                  displayState = "hidden";
               }
               break;
            case 'unknown':
               if(!d.bHaveUnknown){
                  displayState = "hidden";
               }
               break;
            case 'all':
            default:
               // default value
         }
         return displayState;
      })
   }
}