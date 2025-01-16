const Joi = require('joi');
const ResourceController = require('./mainController');

const createSchema = Joi.object({
   test_case_id: Joi.number().required(),
   time_start: Joi.date().allow('').allow(null).default(null),
   component_name: Joi.string().allow('').allow(null).default(null),
   binary_name: Joi.string().allow('').allow(null).default(null),
   MEM_RSS: Joi.number().allow('').allow(null).default(null),
   MEM_PSS: Joi.number().allow('').allow(null).default(null),
   MEM_Anonymus: Joi.number().allow('').allow(null).default(null),
   Storage: Joi.number().allow('').allow(null).default(null),
   CPU: Joi.number().allow('').allow(null).default(null)
})

const updateSchema = Joi.object({
   time_start: Joi.date(),
   component_name: Joi.string(),
   binary_name: Joi.string(),
   MEM_RSS: Joi.number(),
   MEM_PSS: Joi.number(),
   MEM_Anonymus: Joi.number(),
   Storage: Joi.number(),
   CPU: Joi.number()
})

module.exports = new ResourceController("ccr component", 
                                       "tbl_ccr_components", 
                                       "ccr_components_id", 
                                       createSchema, 
                                       updateSchema)