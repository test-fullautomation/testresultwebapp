> Licensed under the Apache License, Version 2.0 (the \"License\"); you
> may not use this file except in compliance with the License. You may
> obtain a copy of the License at
>
> <http://www.apache.org/licenses/LICENSE-2.0>
>
> Unless required by applicable law or agreed to in writing, software
> distributed under the License is distributed on an \"AS IS\" BASIS,
> WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
> implied. See the License for the specific language governing
> permissions and limitations under the License.

# TestResultWebApp (TRWebApp)

::: {.contents local=""}
:::

## Package Documentation

A detailed documentation of the TestResultWebApp package can be found
here:
[TestResultWebApp.pdf](https://github.com/test-fullautomation/testresultwebapp/blob/develop/doc/_build/latex/TestResultWebApp.pdf)

## Introduction

TRWebApp is a generic web based open source application which allows
processing displaying of test result data in a sophisticated way.

TRWebApp uses a mysql data base, nodejs on server side and JavaScript on
Web-Browser side.

TRWebApp was initially implemented at
![IMG_BOSCH](https://upload.wikimedia.org/wikipedia/de/thumb/3/31/Bosch-logotype.svg/200px-Boschlogotype.svg.png){height="30px"}
[Robert Bosch Car
Multimedia](https://www.bosch.de/unser-unternehmen/bosch-in-deutschland/hildesheim/)
and was open sourced in 2020.

Dashboard

:   On overview of test result data will be displayed in the Dashboard

    ![IMG_WEBAPP_DASHBOARD](https://raw.githubusercontent.com/test-fullautomation/TestResultWebApp/develop/doc/images/Dashboard.png?sanitize=true)

Data table

:   

    The data table allows you to

    :   -   browse into the single test results.
        -   open the traceback for failed test cases.
        -   collaborate with your team.
        -   filter test cases.

    ![IMG_WEBAPP_DATATABLE](https://raw.githubusercontent.com/test-fullautomation/TestResultWebApp/develop/doc/images/DataTable.png?sanitize=true)

Run-time view

:   The run-time view shows you test cases grouped by compnent. The size
    of a block is relative for the run-time of a test case. This allows
    you to optimize the run-time of a your test suite.

    ![IMG_WEBAPP_RUNTIME](https://raw.githubusercontent.com/test-fullautomation/TestResultWebApp/develop/doc/images/Runtime.png?sanitize=true)

Diff view

:   The diff view allows you to diff test runs from different test
    suites. For this a spiral view is used where the center is the start
    of the test suite execution.

    The diff view allows you to

    :   -   show only test cases which are other than passed.
        -   show only test cases which are failed.
        -   show only test cases which are new or missing.
        -   open the traceback for failed test cases.
        -   diff up to 5 versions

    ![IMG_WEBAPP_DIFFVIEW](https://raw.githubusercontent.com/test-fullautomation/TestResultWebApp/develop/doc/images/DiffView.PNG?sanitize=true)

## Installation

## Example

## Usage

## Documentation

## Support and contact

[Thomas Pollerspöck](mailto:Thomas.Pollerspoeck@de.bosch.com)

## Contributing

## License

Copyright 2020-2022 Robert Bosch GmbH

Licensed under the Apache License, Version 2.0 (the \"License\"); you
may not use this file except in compliance with the License. You may
obtain a copy of the License at

> [![License: Apache
> v2](https://img.shields.io/pypi/l/robotframework.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an \"AS IS\" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
