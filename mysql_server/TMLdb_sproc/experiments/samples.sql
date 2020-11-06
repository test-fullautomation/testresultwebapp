#  Copyright 2010-2020 Robert Bosch Car Multimedia GmbH
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

select test_result_id from tbl_result 
  where time_start=(select MAX(time_start) from tbl_result);
  
select count(*) from tbl_case where test_result_id=39 and result_main="Passed";

select UUID();

select * from tbl_result 
  where time_start=(select MAX(time_start) from tbl_result);
  
SELECT * FROM testdb.tbl_result  as t1 
   inner join testdb.tbl_file as t2 on (t1.test_result_id=t2.test_result_id)
   inner join testdb.tbl_case as t3 on (t1.test_result_id=t3.test_result_id and t2.file_id=t3.file_id)
where t1.test_result_id=39 
order by t2.file_id;

select last_insert_id();

select  truncate(round((300/650)*100)/100,2);

SELECT max(counter_resets) FROM testdb.tbl_case where test_result_id=39;

select t1.result_main,
       t1.result_state,
       case t1.lastlog is not null
          when 0 then null
          when 1 then t1.test_case_id
       end as lastlog,
       t2.name,
       t1.name,
       t1.component
   from testdb.tbl_case as t1
   inner join testdb.tbl_file as t2 on (t1.file_id=t2.file_id)
where t1.test_result_id=43
order by t1.time_start;

select * from tbl_case where test_result_id=42 order by time_start ASC;


select distinct(counter_resets) from tbl_case where test_result_id=40;

select component, time_start, counter_resets from tbl_case where test_result_id=42 group by counter_resets;

select t1.component, CONCAT(TIMEDIFF(t1.time_start, t2.min_time_start),'') as time_start, t1.counter_resets from 
  (select * from tbl_case where test_result_id=43 and counter_resets>0 order by time_start ASC)  t1 
  left join (select min(time_start) as min_time_start from tbl_case where test_result_id=43 ) t2 
  on true
group by counter_resets;



select distinct(component) from tbl_case where test_result_id=42;

  