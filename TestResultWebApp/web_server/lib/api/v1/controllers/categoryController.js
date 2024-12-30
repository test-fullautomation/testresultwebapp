const Joi = require('joi');
const ResourceController = require('./mainController');

const createSchema = Joi.object({
   category: Joi.string().required()
})

const updateSchema = Joi.object({
   category: Joi.string().required()
})

module.exports = new ResourceController("category", 
                                       "tbl_result_categories", 
                                       "category_id", 
                                       createSchema, 
                                       updateSchema)