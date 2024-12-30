const Joi = require('joi');
const ResourceController = require('./mainController');

const createResultSchema = Joi.object({
   test_result_id: Joi.string().required(),
   project: Joi.string().required(),
   variant: Joi.string().required(),
   branch: Joi.string().required(),
   time_start: Joi.date().allow('').allow(null).default(null),
   time_end: Joi.date().allow('').allow(null).default(null),
   version_sw_target: Joi.string().allow('').allow(null).default(null),
   version_sw_test: Joi.string().allow('').allow(null).default(null),
   version_hardware: Joi.string().allow('').allow(null).default(null),
   jenkinsurl: Joi.string().allow('').allow(null).default(null),
   reporting_qualitygate: Joi.string().allow('').allow(null).default(null),
   result_state: Joi.string().default("in progress"),
   interpretation: Joi.string().allow('').allow(null).default(null)
})

const updateResultSchema = Joi.object({
   project: Joi.string(),
   variant: Joi.string(),
   branch: Joi.string(),
   time_start: Joi.date(),
   time_end: Joi.date(),
   version_sw_target: Joi.string(),
   version_sw_test: Joi.string(),
   version_hardware: Joi.string(),
   jenkinsurl: Joi.string(),
   reporting_qualitygate: Joi.string(),
   result_state: Joi.string(),
   interpretation: Joi.string(),
   external_id: Joi.string(),
   useForMetrix: Joi.number(),
   category_main: Joi.string(),
   category_sub: Joi.string(),
   num_of_reanimation: Joi.string()
})

module.exports = new ResourceController("result", 
                                       "tbl_result", 
                                       "test_result_id", 
                                       createResultSchema, 
                                       updateResultSchema)