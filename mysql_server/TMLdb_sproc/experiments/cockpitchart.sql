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

select * from evtbl_result_main as t1 
left join tbl_result as t2 on t1.test_result_id=t2.test_result_id
where  t1.tbl_prj_project="rnaivi" and t1.tbl_prj_branch="main" and not t1.version_sw_target like "%_S" 
       and t2.result_state!="new report" and t2.result_state!="test died"
order by t1.time_start DESC limit 25;


select t1.time_start, t1.version_sw_target, t2.result_state, t3.component, t3.num_passed, t3.num_failed, t3.num_unknown, t3.num_aborted from evtbl_result_main as t1 
join tbl_result as t2 on t1.test_result_id=t2.test_result_id
join evtbl_failed_unknown_per_component as t3 on t1.test_result_id=t3.test_result_id 
where  t1.tbl_prj_project="rnaivi" and t1.tbl_prj_branch="main" and not t1.version_sw_target like "%_S" 
       and t2.result_state!="new report" and t2.result_state!="test died" 
       #and t1.test_result_id in (select test_result_id from tbl_result order by time_start DESC LIMIT 1)
order by t1.time_start DESC limit 5;




select * from evtbl_failed_unknown_per_component as te1
right join
where  test_result_id in (select test_result_id from ( select t1.test_result_id from evtbl_result_main as t1
                                                            join tbl_result as t2 on t1.test_result_id=t2.test_result_id
                                                            join evtbl_failed_unknown_per_component as t3 on t1.test_result_id=t3.test_result_id 
                                                            where t1.tbl_prj_project="rnaivi" and t1.tbl_prj_branch="main" and not t1.version_sw_target like "%_S" 
                                                                  and t2.result_state!="new report" and t2.result_state!="test died"
                                                            order by t1.time_start DESC LIMIT 3) as t) ; 




select * from evtbl_failed_unknown_per_component as te1
inner join  (select test_result_id from ( select t1.test_result_id from evtbl_result_main as t1
                                                            join tbl_result as t2 on t1.test_result_id=t2.test_result_id
                                                            join evtbl_failed_unknown_per_component as t3 on t1.test_result_id=t3.test_result_id 
                                                            where t1.tbl_prj_project="rnaivi" and t1.tbl_prj_branch="main" and not t1.version_sw_target like "%_S" 
                                                                  and t2.result_state!="new report" and t2.result_state!="test died"
                                                            order by t1.time_start DESC LIMIT 5) as te2) as te3
on te1.test_result_id=te3.test_result_id  ;   



select * from evtbl_failed_unknown_per_component as te1
inner join  (                                              select t1.test_result_id from evtbl_result_main as t1
                                                            join tbl_result as t2 on t1.test_result_id=t2.test_result_id
                                                            
                                                            where t1.tbl_prj_project="rnaivi" and t1.tbl_prj_branch="main" and not t1.version_sw_target like "%_S" 
                                                                  and t2.result_state!="new report" and t2.result_state!="test died"
                                                            order by t1.time_start DESC LIMIT 2) as te2
on te1.test_result_id=te2.test_result_id ;





select test_result_id from tbl_result
   where project="rnaivi" and branch="main" and not version_sw_target like "%_S" 
   and result_state!="new report" and result_state!="test died"
order by time_start DESC LIMIT 2    ;                                            

#good
select * from evtbl_failed_unknown_per_component as t1
inner join  (                            
   select test_result_id from tbl_result
      where project="rnaivi" and branch="main" and not version_sw_target like "%_S" 
      and result_state!="new report" and result_state!="test died"
   order by time_start DESC LIMIT 3   ) as t2
on t1.test_result_id=t2.test_result_id ;



select * from evtbl_result_main as t1 
inner join tbl_result as t2 on t1.test_result_id=t2.test_result_id
where  t1.tbl_prj_project="rnaivi" and t1.tbl_prj_branch="main" and not t1.version_sw_target like "%_S" 
       and t2.result_state!="new report" and t2.result_state!="test died"
order by t1.time_start DESC limit 25;
