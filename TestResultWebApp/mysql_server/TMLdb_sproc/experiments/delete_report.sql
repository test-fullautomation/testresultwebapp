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

SELECT * FROM pjcmd_bvt.tbl_result order by time_start desc;

delete from tbl_result where  test_result_id="df0b6980-bd71-11e6-894c-7446a0a1b4aa";

select file_id from tbl_file where test_result_id="df0b6980-bd71-11e6-894c-7446a0a1b4aa";

delete from tbl_file_header where file_id in 
   (select file_id from tbl_file where test_result_id="df0b6980-bd71-11e6-894c-7446a0a1b4aa") 
   and file_id!=0;
	
.evtbl_failed_unknown_per_component 	:: test_result_id
.evtbl_result_main                  	:: test_result_id
.tbl_usr_result								:: test_result_id
.tbl_usr_result_history					:: test_result_id

.tbl_usr_case_history						:: test_case_id
.tbl_usr_comments							:: test_case_id
.tbl_usr_case								:: test_case_id
.tbl_usr_links								:: test_case_id

.tbl_file										:: test_result_id
.tbl_file_header							:: file_id
.tbl_case										:: file_id
.tbl_result									:: test_result_id

#
#   Due to the relationships the order of deletion is relevant.
#   First children need to be deleted, then parents
#

#first: evtables
##########################################################
delete from evtbl_failed_unknown_per_component where test_result_id=UUID
delete from evtbl_result_main where test_result_id=UUID

#second: user data from webapp
##########################################################
delete form tbl_usr_result where test_result_id=UUID
delete from tbl_usr_result_history where test_result_id=UUID

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
	
delete from tbl_file where test_result_id=UUID	

delete from tbl_result where test_result_id=UUID	