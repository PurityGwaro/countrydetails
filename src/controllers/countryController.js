const { fetchCountriesData, fetchExchangeRates } = require('../services/externalApi');
const Country = require('../models/Country');

/**
 * POST /countries/refresh
 * Fetches country data and exchange rates, processes them, and stores in database
 */
const refreshCountries = async (req, res) => {
    try {
        console.log('Fetching countries and exchange rates...');
        const [countries, exchangeRates] = await Promise.all([
            fetchCountriesData(),
            fetchExchangeRates()
        ]);

        console.log(`Fetched ${countries.length} countries and ${Object.keys(exchangeRates).length} exchange rates`);

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
                        const randomMultiplier = Math.floor(Math.random() * 1001) + 1000; // 1000-2000
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
                console.error(`Error processing country ${country.name}:`, error.message);
                errorCount++;
            }
        }

        await Country.updateMetadata(successCount);

        console.log(`✅ Refresh complete: ${successCount} countries saved, ${errorCount} errors`);

        res.status(200).json({
            message: 'Countries refreshed successfully',
            total_processed: countries.length,
            successful: successCount,
            failed: errorCount
        });

    } catch (error) {
        console.error('Error refreshing countries:', error.message);

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
        console.error('Error fetching countries:', error.message);
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
        console.error('Error fetching country:', error.message);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
};

module.exports = {
    refreshCountries,
    getAllCountries,
    getCountryByName
};