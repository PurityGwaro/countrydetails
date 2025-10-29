const { fetchCountriesData, fetchExchangeRates } = require('../services/externalApi');
const Country = require('../models/Country');
const { generateSummaryImage } = require('../services/imageGenerator');

/**
 * POST /countries/refresh
 * Fetches country data and exchange rates, processes them, and stores in database
 */
const refreshCountries = async (req, res) => {
    try {
        const [countries, exchangeRates] = await Promise.all([
            fetchCountriesData(),
            fetchExchangeRates()
        ]);

        let successCount = 0;
        let errorCount = 0;

        for (const country of countries) {
            try {
                let currencyCode = null;
                let exchangeRate = null;
                let estimatedGdp = null;

                if (country.currencies && country.currencies.length > 0) {
                    currencyCode = country.currencies[0].code;

                    if (currencyCode && exchangeRates[currencyCode]) {
                        exchangeRate = exchangeRates[currencyCode];

                        // Calculate estimated GDP
                        // Formula: population × random(1000-2000) ÷ exchange_rate
                        const randomMultiplier = Math.floor(Math.random() * 1001) + 1000;
                        estimatedGdp = (country.population * randomMultiplier) / exchangeRate;
                    }
                }

                if (!currencyCode) {
                    estimatedGdp = 0;
                }

                const countryData = {
                    name: country.name,
                    capital: country.capital || null,
                    region: country.region || null,
                    population: country.population,
                    currency_code: currencyCode,
                    exchange_rate: exchangeRate,
                    estimated_gdp: estimatedGdp,
                    flag_url: country.flag || null
                };

                await Country.upsert(countryData);
                successCount++;

            } catch (error) {
                errorCount++;
            }
        }

        await Country.updateMetadata(successCount);

        try {
            await generateSummaryImage();
        } catch (imageError) {
            console.error('Failed to generate summary image:', imageError.message);
        }

        res.status(200).json({
            message: 'Countries refreshed successfully',
            total_processed: countries.length,
            successful: successCount,
            failed: errorCount
        });

    } catch (error) {
        if (error.message.includes('RestCountries API') || error.message.includes('Exchange Rate API')) {
            return res.status(503).json({
                error: 'External data source unavailable',
                details: error.message
            });
        }

        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

/**
 * GET /countries
 * Get all countries with optional filters and sorting
 * Query params: ?region=Africa&currency=NGN&sort=gdp_desc
 */
const getAllCountries = async (req, res) => {
    try {
        const filters = {
            region: req.query.region,
            currency: req.query.currency,
            sort: req.query.sort
        };

        Object.keys(filters).forEach(key => {
            if (filters[key] === undefined) {
                delete filters[key];
            }
        });

        const countries = await Country.findAll(filters);

        res.status(200).json(countries);

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

const getCountryByName = async (req, res) => {
    try {
        const { name } = req.params;
        const country = await Country.findByName(name);

        if (!country) {
            return res.status(404).json({
                error: 'Country not found'
            });
        }

        res.status(200).json(country);

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

const deleteCountryByName = async (req, res) => {
    try {
        const { name } = req.params;
        const deleted = await Country.deleteByName(name);

        if (!deleted) {
            return res.status(404).json({
                error: 'Country not found'
            });
        }

        res.status(200).json({
            message: `Country '${name}' deleted successfully`
        });

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

const getStatus = async (req, res) => {
    try {
        const metadata = await Country.getMetadata();
        if (!metadata) {
            return res.status(200).json({
                total_countries: 0,
                last_refreshed_at: null
            });
        }
        res.status(200).json({
            total_countries: metadata.total_countries,
            last_refreshed_at: metadata.last_refreshed_at
        });
    } catch (error) {
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

const getSummaryImage = async (req, res) => {
    try {
        const fs = require('fs');
        const path = require('path');
        const imagePath = path.join(__dirname, '../../cache/summary.png');
        if (!fs.existsSync(imagePath)) {
            return res.status(404).json({ error: "Summary image not found" });
        }
        res.sendFile(imagePath);
    } catch (error) {
        console.error('Error serving image:', error.message);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

module.exports = {
    refreshCountries,
    getAllCountries,
    getCountryByName,
    deleteCountryByName,
    getStatus,
    getSummaryImage
};