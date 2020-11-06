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

DELIMITER $$
DROP PROCEDURE IF EXISTS `pjcmd_bvt`.`getTestCaseStabilityFlowByTestName`$$
CREATE DEFINER=`pjcmd_bvt`@`%` PROCEDURE `getTestCaseStabilityFlowByTestName`(IN project TEXT, IN test_case_id_in TEXT)
BEGIN

   select name as test_name ,result_main, component, file_id, time_start, test_result_id from tbl_case use index (name_idx)
   where name=(select name from tbl_case where test_case_id=test_case_id_in) and time_start<=(select time_start from tbl_case where test_case_id=test_case_id_in)
   order by time_start DESC limit 15;
  
 
END$$
DELIMITER ;


DELIMITER $$
DROP PROCEDURE IF EXISTS `pjcmd_bvt`.`getTestCaseStabilityByTestName`$$
CREATE DEFINER=`pjcmd_bvt`@`%` PROCEDURE `getTestCaseStabilityByTestName`(IN project TEXT, IN test_case_id_in TEXT)
BEGIN

   select sum(IF(t1.result_main='Passed',1,0))/count(*) as pass_rate, t3.file_name, t1.test_name, t1.component
   from 
     (select name as test_name ,result_main, component, file_id from tbl_case use index (name_idx)
       where name=(select name from tbl_case where test_case_id=test_case_id_in) and time_start<=(select time_start from tbl_case where test_case_id=test_case_id_in)
       order by time_start DESC limit 15) t1
   left join
      ( 
        select name as file_name , time_start, file_id from tbl_file as t2
      ) t3 on t1.file_id=t3.file_id;
 
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS `pjcmd_bvt`.`getTestCaseStability`$$
CREATE DEFINER=`pjcmd_bvt`@`%` PROCEDURE `getTestCaseStability`(IN project TEXT)
BEGIN
    declare cur_test_name TEXT;

    #helper needed if cursor reaches end of table
    declare iDone INT default FALSE;
    #cursor to interate through all distinct timestamps
    declare cCursor cursor for select distinct(t1.name) as test_name from tbl_case as t1 where (t1.time_start > DATE_SUB(now(), INTERVAL 100 DAY));
    declare CONTINUE HANDLER FOR NOT FOUND SET iDone = TRUE;
    
    drop temporary table if exists tmp;
    create temporary table tmp (
        pass_rate float,
        file_name varchar(255),
        test_name varchar(255),
        component varchar(255)
    );
    
    open cCursor;

    read_loop: LOOP

       #fetch the test_result_ids of all test case executions
       FETCH cCursor INTO cur_test_name;
    
       IF iDone THEN
         LEAVE read_loop;
       END IF;
 
       INSERT INTO tmp (pass_rate, file_name, test_name, component)
          select sum(IF(t1.result_main='Passed',1,0))/count(*) as pass_rate, t3.file_name, t1.test_name, t1.component
          from 
            (select name as test_name ,result_main, component, file_id from tbl_case use index (name_idx)
             where name=cur_test_name and result_state!='deactivated'
             order by time_start DESC limit 15) t1
          left join
          ( 
            select name as file_name , time_start, file_id from tbl_file as t2
          ) t3 on t1.file_id=t3.file_id;
 
       #call _dbg("getNotAnalyzedIssues",cur_component);
       
     END LOOP read_loop;

     #close cursor
     close cCursor;
     
     select pass_rate, file_name, test_name, component from tmp where pass_rate IS NOT NULL order by pass_rate ASC ;
     drop temporary table if exists tmp;

     
END$$
DELIMITER ;

