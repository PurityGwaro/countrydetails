const Joi = require('joi');

const validateCountryQuery = (req, res, next) => {
    const schema = Joi.object({
        region: Joi.string().trim().optional(),
        currency: Joi.string().trim().optional(),
        sort: Joi.string()
            .valid('gdp_desc', 'gdp_asc', 'population_desc', 'population_asc')
            .optional()
            .messages({
                'any.only': 'Sort must be one of: gdp_desc, gdp_asc, population_desc, population_asc'
            })
    }).unknown(false);
    
    const { error } = schema.validate(req.query, { abortEarly: false });
    
    if (error) {
        const details = {};
        error.details.forEach(detail => {
            const key = detail.path[0];
            details[key] = detail.message.replace(/"/g, '');
        });
        
        return res.status(400).json({
            error: 'Validation failed',
            details
        });
    }
    
    next();
};

const validateCountryData = (countryData) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        capital: Joi.string().allow(null).optional(),
        region: Joi.string().allow(null).optional(),
        population: Joi.number().integer().required(),
        currency_code: Joi.string().allow(null).optional(),
        exchange_rate: Joi.number().allow(null).optional(),
        estimated_gdp: Joi.number().allow(null).optional(),
        flag_url: Joi.string().uri().allow(null).optional()
    });
    
    const { error, value } = schema.validate(countryData, { abortEarly: false });
    
    if (error) {
        const details = {};
        error.details.forEach(detail => {
            const key = detail.path[0];
            details[key] = 'is required';
        });
        
        throw {
            error: 'Validation failed',
            details
        };
    }
    
    return value;
};

module.exports = {
    validateCountryQuery,
    validateCountryData
};