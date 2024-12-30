const Joi = require('joi');
const ResourceController = require('./mainController');

const createSchema = Joi.object({
   project: Joi.string().required(),
   variant: Joi.string().required(),
   branch: Joi.string().required()
})
const updateSchema = Joi.object({
   project: Joi.string(),
   variant: Joi.string(),
   branch: Joi.string()
})
const querySchema = Joi.object({
   project: Joi.string(),
   variant: Joi.string(),
   branch: Joi.string()
})

module.exports = new ResourceController("project", 
                                       "tbl_prj", 
                                       "project", 
                                       createSchema, 
                                       updateSchema,
                                       querySchema)