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

#
# This procedure is called by main::update_evtbl and causes an update of
# all evtbl_* with the test results of a specific
# test run
#
# Parameter: 
#   IN: test_result_id:INT
#
##########################################################################
DELIMITER $$
DROP PROCEDURE IF EXISTS `pjcmd_bvt`.`_update_evtbl_failed_unknown_per_component`$$
CREATE DEFINER=`pjcmd_bvt`@`%` PROCEDURE  `pjcmd_bvt`.`_update_evtbl_failed_unknown_per_component`(IN stest_result_id TEXT)
BEGIN
   declare bErr BOOL default FALSE;
   declare iCount INT default 0;
   declare strResult TEXT default "";

   declare numPassed INT default 0;
   declare numFailed INT default 0;
   declare numunknown INT default 0;
   declare numAborted INT default 0;
   declare numResets INT default 0;

   #frequently used condition string
   declare strCondTRID TEXT default CONCAT(CONCAT("test_result_id=\"",stest_result_id),"\"");
   
   declare cur_component TEXT;
   
   #helper needed if cursor reaches end of table
   declare iDone INT default FALSE;
   #cursor to interate through all distinct timestamps
   declare cCursor cursor for select distinct(component) from tbl_case where test_result_id=stest_result_id;
   declare CONTINUE HANDLER FOR NOT FOUND SET iDone = TRUE;
   
   call _dbg("_update_evtbl_failed_unknown_per_component: test_result_id",stest_result_id);
   
   open cCursor;

    read_loop: LOOP

       #fetch the test_result_ids of all test case executions
       FETCH cCursor INTO cur_component;
   
    
       IF iDone THEN
         LEAVE read_loop;
       END IF;
 
       call _dbg("_update_evtbl_failed_unknown_per_component cur_component", cur_component);
       call _gen_select_count("tbl_case",
                              REPLACE( CONCAT(strCondTRID," and result_main=\"Passed\" and component=\"<COMPONENT>\""),
                                       "<COMPONENT>",
                                       cur_component
                                     ), 
                              numPassed, bErr
                             );
       call _gen_select_count("tbl_case",
                              REPLACE( CONCAT(strCondTRID," and result_main=\"Failed\" and component=\"<COMPONENT>\""),
                                       "<COMPONENT>",
                                       cur_component
                                     ), 
                              numFailed, bErr
                             );
        call _gen_select_count("tbl_case",
                              REPLACE( CONCAT(strCondTRID," and result_main=\"unknown\" and component=\"<COMPONENT>\""),
                                       "<COMPONENT>",
                                       cur_component
                                     ), 
                              numunknown, bErr
                             );  
       call _gen_select_count("tbl_case",
                              REPLACE( CONCAT(strCondTRID," and result_main=\"Aborted\" and component=\"<COMPONENT>\""),
                                       "<COMPONENT>",
                                       cur_component
                                     ), 
                              numAborted, bErr
                             );     
       call _gen_select_into("COALESCE(max(counter_resets)-min(counter_resets)+1, 0)", 
                              CONCAT( 
                                CONCAT("(SELECT t.counter_resets, t.component FROM tbl_case AS t INNER JOIN (SELECT MIN(test_case_id) AS test_case_id FROM tbl_case WHERE ",strCondTRID),
                                  " AND counter_resets>0 GROUP BY counter_resets) AS sub ON t.test_case_id=sub.test_case_id) AS tmp_tbl"),
                              REPLACE( "component=\"<COMPONENT>\"", "<COMPONENT>", cur_component),
                              numResets, bErr
                             );
       # from mysql 8, below query can be used to replace the above one 
       /* call _gen_select_into("COALESCE(max(counter_resets)-min(counter_resets)+1, 0)", 
                              CONCAT( 
                                CONCAT("(SELECT DISTINCT(counter_resets), FIRST_VALUE(component) OVER (PARTITION BY counter_resets ORDER BY test_case_id ASC) AS component FROM tbl_case WHERE ",strCondTRID),
                                  " AND counter_resets>0) AS tmp_tbl"),
                              REPLACE( "component=\"<COMPONENT>\"", "<COMPONENT>", cur_component),
                              numResets, bErr
                             ); */

       insert into evtbl_failed_unknown_per_component
                                 (test_result_id,
                                  component,
                                  num_passed,
                                  num_failed,
                                  num_unknown,
                                  num_aborted,
                                  num_resets
                                 )
                          values (stest_result_id,
                                  cur_component,
                                  numPassed,
                                  numFailed,
                                  numunknown,
                                  numAborted,
                                  numResets
                                 )
                          ON DUPLICATE KEY UPDATE
                                  num_passed=numPassed,
                                  num_failed=numFailed,
                                  num_unknown=numunknown,
                                  num_aborted=numAborted,
                                  num_resets=numResets;
                                                  

     END LOOP read_loop;
   
   

END $$

DELIMITER ;