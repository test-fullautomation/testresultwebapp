const Joi = require('joi');
const ResourceController = require('./mainController');

const createSchema = Joi.object({
   test_result_id: Joi.string().required(),
   interpretation: Joi.string().allow('').allow(null).default(null),
   comment: Joi.string().allow('').allow(null).default(null),
   tags: Joi.string().allow('').allow(null).default(null)
})

const updateSchema = Joi.object({
   interpretation: Joi.string(),
   comment: Joi.string(),
   tags: Joi.string()
})

module.exports = new ResourceController("user result", 
                                       "tbl_usr_result", 
                                       "test_result_id", 
                                       createSchema, 
                                       updateSchema)