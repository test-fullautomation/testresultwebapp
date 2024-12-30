const Joi = require('joi');
const ResourceController = require('./mainController');

const createSchema = Joi.object({
   test_result_id: Joi.string().required(),
   abort_reason: Joi.string().allow('').allow(null).default(null),
   msg_detail: Joi.string().allow('').allow(null).default(null)
})

const updateSchema = Joi.object({
   abort_reason: Joi.string(),
   msg_detail: Joi.string()
})

module.exports = new ResourceController("abort", 
                                       "tbl_abort", 
                                       "test_result_id", 
                                       createSchema, 
                                       updateSchema)