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

select testdb.tbl_case.name from testdb.tbl_case where testdb.tbl_case.test_result_id=43 order by time_start;

SELECT * FROM testdb.tbl_result  as t1 
   inner join testdb.tbl_file as t2 on (t1.test_result_id=t2.test_result_id)
   inner join testdb.tbl_case as t3 on (t1.test_result_id=t3.test_result_id and t2.file_id=t3.file_id)
where t1.test_result_id=39 
order by t2.file_id;

select t1.test_case_id , 
       t3.state,
       t1.result_main,
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
   left join testdb.tbl_usr_case as t3 on (t1.test_case_id=t3.test_case_id)
where t1.test_result_id=43 #and component="MPLay"
order by t1.time_start;

   SELECT  tcid, COUNT(*) totalCount
            FROM    tbl_case
            where   test_result_id=43
            GROUP   BY tcid;


#Find duplicated tcids
SELECT  b.totalCount AS Duplicate FROM tbl_case as a
      INNER JOIN
        (
            SELECT  tcid, COUNT(*) totalCount
            FROM    tbl_case
            where   test_result_id=43
            GROUP   BY tcid
        ) b ON a.tcid = b.tcid
WHERE a.test_result_id=43 and b.totalCount >= 2 order by a.tcid;

#Find duplicated tcids
SELECT count(distinct(a.tcid)) AS Duplicate FROM tbl_case as a
      INNER JOIN
        (
            SELECT  tcid, COUNT(*) totalCount
            FROM    tbl_case
            where   test_result_id=43
            GROUP   BY tcid
        ) b ON a.tcid = b.tcid
WHERE a.test_result_id=43 and b.totalCount >= 2 order by a.tcid;

select count(*) from tbl_case 
where test_result_id=43 and result_main<>"Passed";

select count(*) from tbl_case
where test_result_id=43 and (tcid REGEXP '^\s*TC')=0;

select count(*) from tbl_case
where test_result_id=43 and (fid REGEXP '^\s*SWF-')=0;




select  
  sum(case when t1.lastlog is not null and ((t2.state!="l" and t2.state!="n") or t2.state is null) then 1 else 0 end) not_analyzed,
  sum(case when result_main<>"Passed" then 1 else 0 end) not_passed,
  sum(case when (tcid REGEXP '^\s*TC')= 0  then 1 else 0 end) no_tcid,
  sum(case when (fid REGEXP '^\s*SWF-') = 0 then 1 else 0 end) no_fid
from tbl_case as t1
left join tbl_usr_case as t2 on t1.test_case_id=t2.test_case_id
where test_result_id=43;

select  
  *
from tbl_case as t1
left join tbl_usr_case as t2 on t1.test_case_id=t2.test_case_id
where test_result_id=43 and t1.lastlog is not null and ((t2.state!="l" and t2.state!="n") or t2.state is null);

SELECT t1.tester_account, t1.tester_machine, t1.time_start, UPPER(t1.name) like "%JENKINS%" as isJenkins, t2.JenkinsUrl FROM testdb.tbl_file as t1
left join testdb.tbl_result as t2 on t1.test_result_id=t2.test_result_id 
where t1.test_result_id="183" and 
      t1.time_start = (select min(time_start) from testdb.tbl_file where test_result_id="183");
      
      
ALTER TABLE testdb.tbl_result
ADD JenkinsUrl varchar(255);

select t1.tester_account, t1.tester_machine, t1.time_start, UPPER(t1.name) like "%JENKINS%" as isJenkins, t2.JenkinsUrl FROM testdb.tbl_file as t1 left join testdb.tbl_result as t2
 on t1.test_result_id=t2.test_result_id where t1.test_result_id='125' and t1.time_start = (select min(time_start) from testdb.tbl_file where test_result_id='125');



SELECT name, TIMESTAMPDIFF(SECOND,time_start,time_end)/60 as runtime, time_start, time_end FROM pjcmd_bvt.tbl_file where test_result_id="7801e829-a7b8-47e7-85d5-2c282760c5c3" order by runtime DESC

  



