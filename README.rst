.. |IMG_BOSCH| image:: https://upload.wikimedia.org/wikipedia/de/thumb/3/31/Bosch-logotype.svg/200px-Boschlogotype.svg.png
    :height: 30

.. |IMG_WEBAPP_DASHBOARD| image:: https://raw.githubusercontent.com/test-fullautomation/TestResultWebApp/develop/doc/img/Dashboard.png?sanitize=true

.. |IMG_WEBAPP_DATATABLE| image:: https://raw.githubusercontent.com/test-fullautomation/TestResultWebApp/develop/doc/img/DataTable.png?sanitize=true

.. |IMG_WEBAPP_RUNTIME| image:: https://raw.githubusercontent.com/test-fullautomation/TestResultWebApp/develop/doc/img/Runtime.png?sanitize=true

.. |IMG_WEBAPP_DIFFVIEW| image:: https://raw.githubusercontent.com/test-fullautomation/TestResultWebApp/develop/doc/img/DiffView.PNG?sanitize=true


TestResultWebApp (TRWebApp)
===========================

.. contents::
   :local:

Introduction
------------


TRWebApp is a generic web based open source application which allows processing displaying of test result data in a sophisticated way.

TRWebApp uses a mysql data base, nodejs on server side and JavaScript on Web-Browser side.


TRWebApp was initially implemented at |IMG_BOSCH| `Robert Bosch Car Multimedia <https://www.bosch.de/unser-unternehmen/bosch-in-deutschland/hildesheim/>`__ and was open sourced in 2020. 

Dashboard
   On overview of test result data will be displayed in the Dashboard

   |IMG_WEBAPP_DASHBOARD|

Data table
   The data table allows you to
      - browse into the single test results. 
      - open the traceback for failed test cases.
      - collaborate with your team.
      - filter test cases.
   
   |IMG_WEBAPP_DATATABLE|

Run-time view
   The run-time view shows you test cases grouped by compnent. The size of a block is relative for the run-time of a test case. This allows you to optimize the run-time of a your test suite.

   |IMG_WEBAPP_RUNTIME|

Diff view
   The diff view allows you to diff test runs from different test suites.
   For this a spiral view is used where the center is the start of the test suite execution.
   
   The diff view allows you to
      - show only test cases which are other than passed.
      - show only test cases which are failed.
      - show only test cases which are new or missing.
      - open the traceback for failed test cases.
      - diff up to 5 versions
      
   |IMG_WEBAPP_DIFFVIEW|      


Installation
------------



Example
-------



Usage
-----



Documentation
-------------



Support and contact
-------------------



Contributing
------------



License
-------

TestResultWebApp is open source software provided under the `Apache License
2.0`__. 

__ http://apache.org/licenses/LICENSE-2.0

   