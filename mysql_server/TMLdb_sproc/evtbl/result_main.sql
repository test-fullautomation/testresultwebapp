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
DROP PROCEDURE IF EXISTS `pjcmd_bvt`.`_update_evtbl_result_main`$$
CREATE DEFINER=`pjcmd_bvt`@`%` PROCEDURE  `pjcmd_bvt`.`_update_evtbl_result_main`(IN stest_result_id TEXT)
BEGIN
   declare bErr BOOL default FALSE;
   declare iCount INT default 0;
   declare strResult TEXT default "";
   
   #version information
   declare version_sw_target TEXT default "";
   declare project TEXT default "";
   declare variant TEXT default "";
   declare branch TEXT default "";
   
   #absolute values
   declare numTotal INT default 0;
   declare numPassed INT default 0;
   declare numFailed INT default 0;
   declare numunknown INT default 0;
   declare numAborted INT default 0;
   
   #percentage values
   declare gen_pt_sql TEXT default "";
   declare dummy TEXT default "";
   declare pt_passed float default 0.0;
   declare pt_failed float default 0.0;
   declare pt_unknown float default 0.0;
   declare pt_aborted float default 0.0;
   
   #other values
   declare num_resets INT default 0;
   
   #frequently used condition string
   declare strCondTRID TEXT default CONCAT(CONCAT("test_result_id=\"",stest_result_id),"\"");
   
   call _dbg("_update_evtbl: test_result_id",stest_result_id);
   
   #first create an empty entry in evtbl_result_main
   call _gen_select_into("version_sw_target","tbl_result",strCondTRID, version_sw_target, bErr);
   call _gen_select_into("project","tbl_result",strCondTRID, project, bErr);
   call _gen_select_into("variant","tbl_result",strCondTRID, variant, bErr);
   call _gen_select_into("branch","tbl_result",strCondTRID, branch, bErr);
   
   insert into evtbl_result_main (test_result_id,
                                   
                                  version_sw_target,
                                  tbl_prj_project,
                                  tbl_prj_variant,
                                  tbl_prj_branch
                                 )
                          values (stest_result_id,
                            
                                  version_sw_target,
                                  project,
                                  variant,
                                  branch) 
                          on duplicate key update
                                  version_sw_target=version_sw_target,
                                  tbl_prj_project=project,
                                  tbl_prj_variant=variant,
                                   tbl_prj_branch=branch;
                          
  
   
   #count Passed,Failed,unknown,aborted
   call _gen_select_count("tbl_case",strCondTRID, numTotal, bErr);
   call _gen_select_count("tbl_case",CONCAT(strCondTRID," and result_main=\"Passed\""), numPassed, bErr);
   call _gen_select_count("tbl_case",CONCAT(strCondTRID," and result_main=\"Failed\""), numFailed, bErr);
   call _gen_select_count("tbl_case",CONCAT(strCondTRID," and result_main=\"unknown\""), numunknown, bErr);
   call _gen_select_count("tbl_case",CONCAT(strCondTRID," and result_main=\"Aborted\""), numAborted, bErr);
  
   #calculate percenage values
   set gen_pt_sql="truncate(round((<num>/<numTotal>)*100)/100,2)";
   
   set dummy=REPLACE(gen_pt_sql,"<num>",numPassed);
   set dummy=REPLACE(dummy,"<numTotal>",numTotal);
   call _gen_select_into(dummy,"","",pt_passed,bErr);
   
   set dummy=REPLACE(gen_pt_sql,"<num>",numFailed);
   set dummy=REPLACE(dummy,"<numTotal>",numTotal);
   call _gen_select_into(dummy,"","",pt_failed,bErr);
   
   set dummy=REPLACE(gen_pt_sql,"<num>",numunknown);
   set dummy=REPLACE(dummy,"<numTotal>",numTotal);
   call _gen_select_into(dummy,"","",pt_unknown,bErr);
   
   set dummy=REPLACE(gen_pt_sql,"<num>",numAborted);
   set dummy=REPLACE(dummy,"<numTotal>",numTotal);
   call _gen_select_into(dummy,"","",pt_aborted,bErr);
   
   #find number resets
   call _gen_select_into("max(counter_resets)","tbl_case",strCondTRID,num_resets,bErr);
   
   #write now all to database
   update evtbl_result_main set  num_total=numTotal,
                                 num_passed=numPassed,
                                 num_failed=numFailed,
                                 num_unknown=numunknown,
                                 num_aborted=numAborted,
                                 pt_passed=pt_passed,
                                 pt_failed=pt_failed,
                                 pt_unknown=pt_unknown,
                                 pt_aborted=pt_aborted,
                                 num_resets=num_resets
       where test_result_id=stest_result_id;
          
    update evtbl_result_main 
       set time_start=(select time_start from tbl_result 
                       where test_result_id=stest_result_id)
       where test_result_id=stest_result_id;

END $$

DELIMITER ;