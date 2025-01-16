const express = require("express");
const bodyParser = require('body-parser');

const ResultRouter = require("./v1/routes/resultRoutes");
const UserResultRouter = require("./v1/routes/userResultRoutes");
const ProjectRouter = require("./v1/routes/projectRoutes");
const CategoryRouter = require("./v1/routes/categoryRoutes");
const FileRouter = require("./v1/routes/fileRoutes");
const FileHeaderRouter = require("./v1/routes/fileHeaderRoutes");
const TestcaseRouter = require("./v1/routes/testcaseRoutes");
const AbortRouter = require("./v1/routes/abortRoutes");
const CCRRouter = require("./v1/routes/ccrRoutes");
const StoreProcudureRouter = require("./v1/routes/storeProcedureRoutes");

const app = express();

const PORT = process.env.PORT || 4000;

app.use(bodyParser.json({limit: '50mb'})); 

// Handle connection session
const global = require('../global');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MySQLStore = require('express-mysql-session')(session);
const sessionStore = new MySQLStore(global.mySQLStoreOptions);
app.use(session({
  key    : global.sessionOptions.key,
  name   : global.sessionOptions.name,
  secret : global.sessionOptions.secret,
  store  : sessionStore,
  resave : true,
  saveUninitialized: false,
  cookie: { path : '/',
            secure: false, 
            httpOnly: false,
            maxAge : 7200000
          }
}));
app.use(cookieParser());

const rootAPI = "/api/v1";
const dbAPI = `${rootAPI}/${global.mySQLOptions.database}`;
require('../routes/loginout.js')(app, dbAPI);

// Handle requests for test result
app.use(`${dbAPI}/results`, ResultRouter);
app.use(`${dbAPI}/userresults`, UserResultRouter);
app.use(`${dbAPI}/projects`, ProjectRouter);
app.use(`${dbAPI}/categories`, CategoryRouter);

// Handle requests for test file
app.use(`${dbAPI}/files`, FileRouter);
app.use(`${dbAPI}/fileheaders`, FileHeaderRouter);

// Handle requests for test case
app.use(`${dbAPI}/testcases`, TestcaseRouter);
app.use(`${dbAPI}/aborts`, AbortRouter);
app.use(`${dbAPI}/ccrs`, CCRRouter);

// Handle requests to call store procedures
app.use(`${dbAPI}/evtblresults`, StoreProcudureRouter);

// Host for openapi document

if (process.env.HOSTDOC){
  const swaggerUi = require('swagger-ui-express');
  const openApiDocumentation = require('./document/REST-API.json');
  app.use(`${rootAPI}/docs`, swaggerUi.serve, swaggerUi.setup(openApiDocumentation));
}

app.listen(PORT, () => {
  console.log(`REST API is listening on port ${PORT}`);
});