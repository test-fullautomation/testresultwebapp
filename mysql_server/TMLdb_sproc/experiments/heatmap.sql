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

#select t1.name, t2.name as filename from tbl_case as t1
#join tbl_file as t2 on t1.test_result_id=t2.test_result_id;

#select distinct(SUBSTRING_INDEX(name, '/', -1)) as filename from tbl_file;

#select distinct(name) from tbl_case;



#percentage of "passed" for one file by testcase name
select sum(IF(t1.result_main='Passed',1,0))/count(*) as pass_rate, t3.file_name, t1.test_name, t1.component, t3.time_start
from 
   (select name as test_name , result_main, component, file_id from tbl_case 
      where name='Audioservice set sink STRESS TEST sound property to BASS' and result_state!='deactivated'
    order by time_start DESC limit 15) t1
left join
( 
  select name as file_name , time_start, file_id from tbl_file as t2
) t3 on t1.file_id=t3.file_id;

select distinct(name) from tbl_case;

select distinct(t1.name) as test_name from tbl_case as t1 
where (t1.time_start > DATE_SUB(now(), INTERVAL 10 DAY));

select distinct(t1.name) as test_name from tbl_case as t1
left join
(
   select sum(IF(result_main='Passed',1,0))/count(*) as pass_rate
   from 
   (select name,result_main from tbl_case 
      where name=t1.name
    order by time_start DESC limit 10) t2
) t3 on true
where (t1.time_start > DATE_SUB(now(), INTERVAL 5 DAY));

select name as test_name ,result_main,file_id from tbl_case 
             where name='Testing Startup Synchronization by setting PROC_ENABLED to zero' and result_state!='deactivated'
             order by time_start DESC limit 15;
             
select distinct(result_state) from tbl_case ;           

