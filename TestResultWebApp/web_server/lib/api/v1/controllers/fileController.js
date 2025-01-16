const Joi = require('joi');
const ResourceController = require('./mainController');

const createFileSchema = Joi.object({
   test_result_id: Joi.string().required(),
   name: Joi.string().allow('').allow(null).default(null),
   tester_account: Joi.string().allow('').allow(null).default(null),
   tester_machine: Joi.string().allow('').allow(null).default(null),
   time_start: Joi.date().allow('').allow(null).default(null),
   time_end: Joi.date().allow('').allow(null).default(null),
   origin: Joi.string().allow('').allow(null).default(null)
})
const updateFileSchema = Joi.object({
   name: Joi.string(),
   tester_account: Joi.string(),
   tester_machine: Joi.string(),
   time_start: Joi.date(),
   time_end: Joi.date(),
   origin: Joi.string()
})
const querySchema = Joi.object({
   test_result_id: Joi.string(),
   name: Joi.string(),
   tester_account: Joi.string(),
   tester_machine: Joi.string(),
   time_start: Joi.date(),
   time_end: Joi.date(),
   origin: Joi.string()
})

module.exports = new ResourceController("file", 
                                       "tbl_file", 
                                       "file_id", 
                                       createFileSchema, 
                                       updateFileSchema,
                                       querySchema)