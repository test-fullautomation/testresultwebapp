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
DROP PROCEDURE IF EXISTS `pjcmd_bvt`.`getNotAnalyzedIssues`$$
CREATE DEFINER=`pjcmd_bvt`@`%` PROCEDURE `pjcmd_bvt`.`getNotAnalyzedIssues`(IN strVersion TEXT)
BEGIN
    declare cur_component TEXT;

    #helper needed if cursor reaches end of table
    declare iDone INT default FALSE;
    #cursor to interate through all distinct timestamps
    declare cCursor cursor for select component  from evtbl_failed_unknown_per_component where test_result_id=strVersion ;
    declare CONTINUE HANDLER FOR NOT FOUND SET iDone = TRUE;
    
    drop temporary table if exists tmp;
    create temporary table tmp (
        component varchar(50),
        not_analyzed int
    );
    
    open cCursor;

    read_loop: LOOP

       #fetch the test_result_ids of all test case executions
       FETCH cCursor INTO cur_component;
    
       IF iDone THEN
         LEAVE read_loop;
       END IF;
 
       INSERT INTO tmp (component, not_analyzed)
          select component, sum(case when t1.lastlog is not null and trim(t1.lastlog) <> '' and ((t2.state!='l' and t2.state!='n') or t2.state is null) then 1 else 0 end) as not_analyzed
             from tbl_case as t1 
             left join tbl_usr_case as t2 on t1.test_case_id=t2.test_case_id 
          where component=cur_component and test_result_id=strVersion;
 
       #call _dbg("getNotAnalyzedIssues",cur_component);
       
     END LOOP read_loop;

     #close cursor
     close cCursor;
     
     select component, not_analyzed from tmp ;
     drop temporary table if exists tmp;

     
END$$
DELIMITER ;
