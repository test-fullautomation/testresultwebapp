const Joi = require('joi');
const ResourceController = require('./mainController');

const createTestcaseSchema = Joi.object({
   name: Joi.string().allow('').allow(null).default(null),
   issue: Joi.string().allow('').allow(null).default(null),
   tcid: Joi.string().allow('').allow(null).default(null),
   fid: Joi.string().allow('').allow(null).default(null),
   component: Joi.string().allow('').allow(null).default(null),
   time_start: Joi.date().allow('').allow(null).default(null),
   result_main: Joi.string().allow('').allow(null).default(null),
   result_state: Joi.string().allow('').allow(null).default(null),
   result_return: Joi.number().allow('').allow(null).default(null),
   counter_resets: Joi.number().default(0),
   lastlog: Joi.string().allow('').allow(null).default(null),
   testnumber: Joi.string().allow('').allow(null).default(null),
   repeatcount: Joi.string().allow('').allow(null).default(null),
   test_result_id: Joi.string().required(),
   file_id: Joi.number().required()
})

const updateTestcaseSchema = Joi.object({
   name: Joi.string(),
   issue: Joi.string(),
   tcid: Joi.string(),
   fid: Joi.string(),
   component: Joi.string(),
   time_start: Joi.date(),
   result_main: Joi.string(),
   result_state: Joi.string(),
   result_return: Joi.number(),
   counter_resets: Joi.number(),
   lastlog: Joi.string(),
   testnumber: Joi.string(),
   repeatcount: Joi.string()
})

module.exports = new ResourceController("testcase", 
                                        "tbl_case", 
                                        "test_case_id", 
                                        createTestcaseSchema, 
                                        updateTestcaseSchema)