'use strict';

const pooledCon = require('../../../communication/mysqlPool');
const global = require('../../../global');

const dbQuery = (sql, callback, values=[]) => {
   pooledCon().then( (con) => {
      console.log(sql);
      con.query(sql, values, (err, rows) => {
         // if (err) console.log(err);
         con.release();
         callback(rows, err);
      });  
   }, (err) => {
      console.error("Error 001:",err);
   });
}

function DBService(resource, table, identifier){
   this.resource = resource;
   this.table = table;
   this.identifier = identifier;
}

DBService.prototype.getAllResources = function(callback) {
   const limitRecord = 100;
   console.log(`get all ${this.resource}s`);
   const sql = `SELECT * FROM ${global.mySQLOptions.database}.${this.table} LIMIT ${limitRecord}`;
   dbQuery(sql, callback);
}

DBService.prototype.getByReqQuery = function(reqQuery, callback) {
   const keys = Object.keys(reqQuery);
   const values  = keys.map(key => reqQuery[key]);
   const placeholders = keys.map(key => `${key}=?`).join(' && ');
   console.log(`get ${this.resource} with condition ${placeholders}`);
   const sql = `SELECT * FROM ${global.mySQLOptions.database}.${this.table} WHERE ${placeholders}`;
   dbQuery(sql, callback, values);
}

DBService.prototype.getResourceByID = function(id, callback) {
   console.log(`get ${this.resource} with id ${id}`)
   const sql = `SELECT * FROM ${global.mySQLOptions.database}.${this.table} WHERE ${this.identifier}=?`;
   dbQuery(sql, callback, [id]);
}

DBService.prototype.getLast = function(reqQuery, callback) {
   let sql = `SELECT MAX(${this.identifier}) AS id FROM ${global.mySQLOptions.database}.${this.table}`;
   let values = []
   if (reqQuery && Object.keys(reqQuery).length > 0){
      const keys = Object.keys(reqQuery);
      values  = keys.map(key => reqQuery[key]);
      const placeholders = keys.map(key => `${key}=?`).join(' && ');
      console.log(`get last ${this.resource} with condition ${placeholders}`);
      sql = sql + ` WHERE ${placeholders}`;
   } else {
      console.log(`get last ${this.resource}`)
   }
   dbQuery(sql, callback, values);
}

DBService.prototype.createResource = function(reqBody, callback) {
   if (this.identifier in reqBody){
      console.log(`create new ${this.resource} with id ${reqBody[this.identifier]}`)
   } else {
      console.log(`create new ${this.resource}`)
   }
   const keys = Object.keys(reqBody);
   const values  = keys.map(key => reqBody[key]);
   const columns = keys.join(', ');
   const placeholders = keys.map((_, index) => `?`).join(', ');

   const sql = `INSERT INTO ${global.mySQLOptions.database}.${this.table} (${columns}) VALUES (${placeholders})`;
   dbQuery(sql, callback, values);
}

DBService.prototype.updateResourceByID = function(id, reqBody, callback)  {
   console.log(`update ${this.resource} with id ${id}`)
   const keys = Object.keys(reqBody);
   const values  = keys.map(key => reqBody[key]);
   const sql = `UPDATE ${global.mySQLOptions.database}.${this.table} SET ${keys.map(key => `${key} = ?`).join(', ')} WHERE ${this.identifier}=?`;
   values.push(id);
   dbQuery(sql, callback, values);
}

DBService.prototype.deleteResourceByID = function(id, callback)  {
   console.log(`delete ${this.resource} with id ${id}`)
   const sql = `DELETE FROM ${global.mySQLOptions.database}.${this.table} WHERE ${this.identifier}=?`;
   dbQuery(sql, callback, [id]);
}

function callRoutine(routine, callback, params=null) {
   let sql = `call ${global.mySQLOptions.database}.${routine}();`;
   if (params && params.length) {
      const sParams = params.join(',');
      console.log(`call ${global.mySQLOptions.database}.${routine}(${sParams})`);
      const placeholders = params.map(key => '?').join(',');
      sql = `call ${global.mySQLOptions.database}.${routine}(${placeholders});`;
   } else {
      console.log(`call ${global.mySQLOptions.database}.${routine}()`);
   }
   dbQuery(sql, callback, params);
}

module.exports = {
   DBService,
   callRoutine
}