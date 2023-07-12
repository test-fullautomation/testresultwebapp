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

##########################################################################
##########################################################################
#
#     TRACE support
#
##########################################################################
##########################################################################


#
# This procedure is used to clear the trace log in tbl_debug
#
# Parameter: --
#
##########################################################################
SET GLOBAL log_bin_trust_function_creators = 1;
DELIMITER $$
DROP PROCEDURE IF EXISTS `pjcmd_bvt`.`_clr_tbl_debug`$$
CREATE DEFINER=`pjcmd_bvt`@`%` PROCEDURE `pjcmd_bvt`.`_clr_tbl_debug`(IN txtProcedure TEXT)
BEGIN

  if (_get_ConfValue("Debug:Mode")="ON") then
    #delete tbl_debug
    delete from tbl_debug where entry_id>=0;
    #Give the reader a chance to identify which procudre deleted tbl_debug.
    call _dbg("Cleared from",txtProcedure);
  end if;


END$$
DELIMITER ;


# This procedure is used to log trace data
#
# Parameter: 
#  IN:  description:TEXT
#  IN:  value:TEXT
#
#  internally:
#  IN:  from tbl_config: Debug:Mode==ON
#
##########################################################################
DELIMITER $$
DROP PROCEDURE IF EXISTS `pjcmd_bvt`.`_dbg`$$
CREATE DEFINER=`pjcmd_bvt`@`%` PROCEDURE `pjcmd_bvt`.`_dbg`(IN strDescription TEXT, IN strValue TEXT)
BEGIN

  if (_get_ConfValue("Debug:Mode")="ON") then
    #write values into tbl_debug.
    insert into tbl_debug (description,dbgstring) values (strDescription, strValue);
  end if;

END$$
DELIMITER ;

##########################################################################
##########################################################################
#
#     configuration support
#
##########################################################################
##########################################################################

# This functions returns the value of a config parameter 
# defined in tbl_config
#
# Parameter: 
#  IN:  strParam:varchar:value of parameter to be returned
#  
#  OUT: value:TEXT
#
#  internally:
#  IN: from tbl_config: Debug:Mode==ON
#
##########################################################################
DELIMITER $$
DROP FUNCTION IF EXISTS `pjcmd_bvt`.`_get_ConfValue`$$
CREATE DEFINER=`pjcmd_bvt`@`%` FUNCTION `pjcmd_bvt`.`_get_ConfValue`(strParam varchar(50)) RETURNS varchar(50) CHARSET utf8mb4
BEGIN
  #declare buffer for value
  declare strValue varchar(50) default "";

  #get value into buffer
  select ParamValue into strValue from tbl_config where (ParamName=strParam);

  #return buffer
  RETURN TRIM(strValue);

END$$
DELIMITER ;

##########################################################################
##########################################################################
#
#    generic string based SQL statement execution
#
##########################################################################
##########################################################################


# This procedure is a generic procedure to execute any in a string/text prepared
# or assembled SQL statement.
#
# Parameter: 
#  IN:  txtStmt:TEXT
#
##########################################################################
DELIMITER $$
DROP PROCEDURE IF EXISTS `pjcmd_bvt`.`_gen_execute_stmt`$$
CREATE DEFINER=`pjcmd_bvt`@`%` PROCEDURE  `pjcmd_bvt`.`_gen_execute_stmt`(IN txtStmt TEXT)
BEGIN

   set @ssql=txtStmt;

   #For debugging of query
   call _dbg("_gen_execute_stmt",@ssql);
   #
   #execute and drop the prepared sql statement
   prepare stmt from @ssql;
   execute stmt;
   drop prepare stmt;


END $$

DELIMITER ;

# This procedure provides a generic select-count functionality 
#
# Parameter:
# IN: strTable    : table which should be used
#     strCondition: Condition for the query
#
# OUT: iOutCount: number of found objects
#      bErr     : FALSE no Error occured; TRUE: an Error occured
#
##########################################################################
DELIMITER $$
DROP PROCEDURE IF EXISTS `pjcmd_bvt`.`_gen_select_count`$$
CREATE DEFINER=`pjcmd_bvt`@`%` PROCEDURE  `pjcmd_bvt`.`_gen_select_count`(IN strTable TEXT, IN strCondition TEXT, OUT iOutCount INT, OUT bErr BOOL)
BEGIN

   #a buffer for the assembled query
   declare strbuffer TEXT default "";
   #store the number of fetched objects here
   declare iCount INT default 0;
   #needed to handle the situation that "NULL" is the response.
   declare strIsNull TEXT default "";


   #set default OUT values
   #no Error occured
   set bErr=FALSE;
   #0 Elements found
   set iOutCount=0;

   #Clear user defined buffer variable which is required
   #to bring the result from the prepared statement to our stored proc.
   set @ssql = "set @_iCount=NULL";
   #execute and drop the statement
   prepare stmt from @ssql;
   execute stmt;
   drop prepare stmt;

   #prepare statement for select count(*)
   set strbuffer = CONCAT("SELECT count(*) into @_iCount from ",strTable);
   set strbuffer = CONCAT(strBuffer, " where ");
   set @ssql     = CONCAT(strBuffer, strCondition);
   #
   #For debugging of query
   call _dbg("_gen_select_count: Query",@ssql);
   #
   #execute and drop the statement
   prepare stmt from @ssql;
   execute stmt;
   drop prepare stmt;

   #make value visible in stored procedure
   select @_iCount into iCount;
   
   call _dbg("_gen_select_count: Result", iCount);

   select IFNULL(iCount,"NULL") into strIsNull;
   IF (strIsNull="NULL") THEN
    call _dbg("ERROR:_gen_select_count: iValue=NULL",iCount);
    #report Error
    set bErr=TRUE;
   END IF;


   #return result
   set iOutCount=iCount;


END $$

DELIMITER ;


# This procedure provides a generic select-into functionality.
#
# Parameter:
# IN: strToSelect: Object to be selected
#     strTable: table which should be used
#     strCondition: Condition for the query
#
# OUT: strOutExp: Result of query
#      bErr: FALSE no Error occured; TRUE: an Error occured
#
#
##########################################################################
DELIMITER $$
DROP PROCEDURE IF EXISTS `pjcmd_bvt`.`_gen_select_into`$$
CREATE DEFINER=`pjcmd_bvt`@`%` PROCEDURE  `pjcmd_bvt`.`_gen_select_into`(IN strToSelect TEXT, IN strTable TEXT, IN strCondition TEXT, OUT strOutExp TEXT, OUT bErr BOOL)
BEGIN

   declare strbuffer TEXT default "";
   declare strOut TEXT default "";
   declare strIsNull TEXT default "";


   #set default OUT values
   #no Error occured
   set bErr=FALSE;
   #0 Elements found
   set strOutExp="";

   #Clear user defined buffer variable which is required
   #to bring the result from the prepared statement to our stored proc.
   set @ssql = "set @_strOut=NULL";
   #execute and drop the statement
   prepare stmt from @ssql;
   execute stmt;
   drop prepare stmt;

   #prepare statement for execution
   set strbuffer = "SELECT <TOSELECT> into @_strOut";
	IF (strTable!="") THEN
      set strbuffer = CONCAT(strbuffer," from ");
	   set strbuffer = CONCAT(strbuffer,strTable);
	END IF;
	IF (strCondition!="") THEN
      set strbuffer = CONCAT(strBuffer, " where ");
      set strbuffer = CONCAT(strBuffer, strCondition);
	END IF;
   set @ssql     = REPLACE(strbuffer,"<TOSELECT>",strToSelect);
   #
   #For debugging of query
   call _dbg("_gen_select_into: Query",@ssql);
   #
   #execute and drop the statement
   prepare stmt from @ssql;
   execute stmt;
   drop prepare stmt;

   #make value visible in stored procedure
   select @_strOut into strOut;

   select IFNULL(strOut,"NULL") into strIsNull;
   IF (strIsNull="NULL") THEN
    call _dbg("_gen_select_into: Query",@ssql);
    call _dbg("WARNING:_gen_select_into: strOut=NULL",strOut);
    #report Error
    set bErr=TRUE;
   END IF;

   #For debugging of query
   call _dbg("_gen_select_into: Result",strOut);

   #return result
   set strOutExp=strOut;


END $$
DELIMITER ;


# This event is trigger every 1 hour to detect died result.
#
# Parameter: --
#
##########################################################################
DELIMITER $$
DROP EVENT IF EXISTS `pjcmd_bvt`.`event_detect_diedtest`$$
CREATE DEFINER=`pjcmd_bvt`@`%` EVENT `pjcmd_bvt`.`event_detect_diedtest` 
ON SCHEDULE EVERY 1 HOUR DO 
UPDATE tbl_result SET result_state = 'test died' 
WHERE result_state = 'in progress' AND DATE(time_start)=subdate(current_date, 1) AND ADDDATE( time_start, INTERVAL 1 DAY) < NOW()$$
DELIMITER ;

SET GLOBAL log_bin_trust_function_creators = 0;