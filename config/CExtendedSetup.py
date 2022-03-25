# **************************************************************************************************************
#
#  Copyright 2020-2022 Robert Bosch GmbH
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
# **************************************************************************************************************
#
# CExtendedSetup.py
#
# CM-CI1/ECA3-Queckenstedt
#
# Contains all functions to support the extended setup process.
#
# --------------------------------------------------------------------------------------------------------------
#
# Initial version 03/2022
#
# --------------------------------------------------------------------------------------------------------------

import os, sys, platform, shlex, subprocess, shutil
import colorama as col

col.init(autoreset=True)

COLBR = col.Style.BRIGHT + col.Fore.RED
COLBY = col.Style.BRIGHT + col.Fore.YELLOW
COLBG = col.Style.BRIGHT + col.Fore.GREEN

SUCCESS = 0
ERROR   = 1

# --------------------------------------------------------------------------------------------------------------

def printerror(sMsg):
    sys.stderr.write(COLBR + f"Error: {sMsg}!\n")

def printexception(sMsg):
    sys.stderr.write(COLBR + f"Exception: {sMsg}!\n")

# --------------------------------------------------------------------------------------------------------------

class CExtendedSetup():

    def __init__(self, oRepositoryConfig=None):
        if oRepositoryConfig is None:
            raise Exception("oRepositoryConfig is None")
        self.__oRepositoryConfig = oRepositoryConfig

    # --------------------------------------------------------------------------------------------------------------

    def __del__(self):
        pass

    # --------------------------------------------------------------------------------------------------------------

    def gen_doc(self):
        """Executes sphinx-makeall.py
        """
        sPython = self.__oRepositoryConfig.Get('sPython')
        sDocumentationBuilder = self.__oRepositoryConfig.Get('sDocumentationBuilder')
        listCmdLineParts = []
        listCmdLineParts.append(f"\"{sPython}\"")
        listCmdLineParts.append(f"\"{sDocumentationBuilder}\"")
        sCmdLine = " ".join(listCmdLineParts)
        del listCmdLineParts
        listCmdLineParts = shlex.split(sCmdLine)
        # -- debug
        sCmdLine = " ".join(listCmdLineParts)
        print()
        print("Now executing command line:\n" + sCmdLine)
        print()
        nReturn = ERROR
        try:
            nReturn = subprocess.call(listCmdLineParts)
        except Exception as ex:
            print()
            printexception(str(ex))
            print()
            return ERROR
        print()
        return nReturn
    # eof def gen_doc():

# eof class CExtendedSetup():

# --------------------------------------------------------------------------------------------------------------

