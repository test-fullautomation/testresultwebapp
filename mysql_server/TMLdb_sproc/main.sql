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
# This procedure is used to run any code for test purposes
#
# Parameter: --
#
##########################################################################
DELIMITER $$
DROP PROCEDURE IF EXISTS `pjcmd_bvt`.`playground`$$
CREATE DEFINER=`pjcmd_bvt`@`%` PROCEDURE `pjcmd_bvt`.`playground`()
BEGIN

  #declare variables for handling of return values
  #of _gen_select_count()
  declare bErr BOOL default FALSE;
  declare iCount INT default 0;
  declare strOutExp TEXT default "";
  
  #call _gen_execute_stmt("select * from tbl_debug");
  call _gen_select_count("tbl_case", "True", iCount , bErr);
  #call  _gen_select_into("paramvalue","tbl_config","paramname=\"Debug:Mode\"", strOutExp, bErr);
  
  #call _dbg("value",CONVERT(iCount,char(10)));
  call _dbg("value",iCount);
END$$
DELIMITER ;

#
# This procedure deletes all data related to a specific UUID
#
# Parameter: 
#   IN: test_result_id: TEXT
#
##########################################################################
DELIMITER $$
DROP PROCEDURE IF EXISTS `pjcmd_bvt`.`deleteByUUID`$$
CREATE DEFINER=`pjcmd_bvt`@`%` PROCEDURE `deleteByUUID`(IN UUID TEXT)
BEGIN
  call _dbg("deleteByUUID > STARTED", UUID);
  
  #first: evtables
  ##########################################################
  delete from evtbl_failed_unknown_per_component where test_result_id=UUID;
  delete from evtbl_result_main where test_result_id=UUID;

  #second: user data from webapp
  ##########################################################
  delete from tbl_usr_result where test_result_id=UUID;
  delete from tbl_usr_result_history where test_result_id=UUID;

  delete from tbl_usr_case_history where test_case_id in 
    (select test_case_id from tbl_case where test_result_id=UUID)
    and tbl_usr_case_history_id!=0;
  
  delete from tbl_usr_comments where test_case_id in 
    (select test_case_id from tbl_case where test_result_id=UUID)
    and comment_id!=0;
  
  delete from tbl_usr_case where test_case_id in 
    (select test_case_id from tbl_case where test_result_id=UUID)
    and test_case_id!=0;
  
  delete from tbl_usr_links where test_case_id in 
    (select test_case_id from tbl_case where test_result_id=UUID)
    and link_id!=0;  


  #last: delete from base tables
  ##########################################################
  delete from tbl_file_header where file_id in 
    (select file_id from tbl_file where test_result_id=UUID) 
    and file_id!=0;
	
  delete from tbl_case where file_id in 
    (select file_id from tbl_file where test_result_id=UUID) 
    and file_id!=0;
	
  delete from tbl_file where test_result_id=UUID;

  delete from tbl_result where test_result_id=UUID;
  
  call _dbg("deleteByUUID > ENDED", UUID);
END$$

DELIMITER ;

#
# This procedure is called by a trigger and causes an update of
# all evtbl_* with the test results of a specific
# test run
#
# Parameter: 
#   IN: test_result_id:INT
#
##########################################################################
DELIMITER $$
DROP PROCEDURE IF EXISTS `pjcmd_bvt`.`update_evtbl`$$
CREATE DEFINER=`pjcmd_bvt`@`%` PROCEDURE  `pjcmd_bvt`.`update_evtbl`(IN stest_result_id TEXT)
BEGIN

    call _dbg("update_evtbl","----- started -----");

    #
    # update all evtbl_* tables
    #
    ###############################
    call _update_evtbl_result_main(stest_result_id);
    call _update_evtbl_failed_unknown_per_component(stest_result_id);
  

    call _dbg("update_evtbl","-----  ended  -----");


END $$

DELIMITER ;

#
# This procedure is called by a trigger and causes an update of
# all evtbl_* with the latest test results.
#
# Parameter: --
#
##########################################################################
DELIMITER $$
DROP PROCEDURE IF EXISTS `pjcmd_bvt`.`update_evtbls`$$
CREATE DEFINER=`pjcmd_bvt`@`%` PROCEDURE  `pjcmd_bvt`.`update_evtbls`()
BEGIN

    declare cur_test_result_id TEXT;

    #helper needed if cursor reaches end of table
    declare iDone INT default FALSE;
    #cursor to interate through all distinct timestamps
    declare cCursor cursor for select test_result_id from tbl_result as t1 
                                      where t1.test_result_id not in 
                                         (select test_result_id from evtbl_result_main) 
                                      order by t1.time_start ASC;
    declare CONTINUE HANDLER FOR NOT FOUND SET iDone = TRUE;
    
    call _dbg("update_evtbls","----- started -----");

    open cCursor;

    read_loop: LOOP

       #fetch the test_result_ids of all test case executions
       FETCH cCursor INTO cur_test_result_id;
   
    
       IF iDone THEN
         LEAVE read_loop;
       END IF;
 

       call _dbg("update_evtbls test_result_id",cur_test_result_id);
       call update_evtbl(cur_test_result_id);

     END LOOP read_loop;

     #close cursor
     close cCursor;

     call _dbg("update_evtbls","-----  ended  -----");


END $$

DELIMITER ;

#
# This procedure is called to rebuild 
# all evtbl_* 
#
# Parameter: --
#
##########################################################################
DELIMITER $$
DROP PROCEDURE IF EXISTS `pjcmd_bvt`.`rebuild_evtbls`$$
CREATE DEFINER=`pjcmd_bvt`@`%` PROCEDURE  `pjcmd_bvt`.`rebuild_evtbls`()
BEGIN

    declare cur_test_result_id TEXT;

    #helper needed if cursor reaches end of table
    declare iDone INT default FALSE;
    #cursor to interate through all distinct timestamps
    declare cCursor cursor for select test_result_id from tbl_result order by time_start ASC;
    declare CONTINUE HANDLER FOR NOT FOUND SET iDone = TRUE;
    
    call _dbg("rebuild_evtbls","----- started -----");

    # first:  clear all evtbls
    ############################################################
    call _clr_evtbls();

    #second: rebuild all evtbls now
    ############################################################
    open cCursor;

    read_loop: LOOP

       #fetch the test_result_ids of all test case executions
       FETCH cCursor INTO cur_test_result_id;
   
    
       IF iDone THEN
         LEAVE read_loop;
       END IF;
 

       call _dbg("rebuild_evtbls test_result_id",cur_test_result_id);
       call update_evtbl(cur_test_result_id);

     END LOOP read_loop;

     #close cursor
     close cCursor;

     call _dbg("rebuild_evtbls","-----  ended  -----");


END $$

DELIMITER ;









