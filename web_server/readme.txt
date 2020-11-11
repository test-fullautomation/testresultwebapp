From 
http://stackoverflow.com/questions/20445599/auto-start-node-js-server-on-boot

Installing it:

npm install -g qckwinsvc

Installing your service:

> qckwinsvc
prompt: Service name: [name for your service]
prompt: Service description: [description for it]
prompt: Node script path: [path of your node script]
Service installed

Uninstalling your service:

> qckwinsvc --uninstall
prompt: Service name: [name of your service]
prompt: Node script path: [path of your node script]
Service stopped
Service uninstalled




WebServer:
Admin Console!

C:\BIOS\webapp\web_server>node node_modules\qckwinsvc\bin\qckwinsvc.js
prompt: Service name:  TML WebApp
error:   Invalid input for Service name
error:   Name must be only letters or dashes
prompt: Service name:  TML_WebApp
error:   Invalid input for Service name
error:   Name must be only letters or dashes
prompt: Service name:  TML-WebApp
prompt: Service description:  TML-WebApp
prompt: Node script path:  c:\BIOS\webapp\web_server\testdb.js
prompt: Should the service get started immediately? (y/n):  y
Service installed.
Service started.

C:\BIOS\webapp\web_server>