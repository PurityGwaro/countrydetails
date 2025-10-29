const pool = require('../config/database');

/**
 * Insert or Update a country (UPSERT)
 * If country exists (by name), update it. Otherwise, insert new.
 * - Uses the UNIQUE constraint on 'name' field
 */
const upsert = async (countryData) => {
    const query = `
        INSERT INTO countries (
            name, capital, region, population, 
            currency_code, exchange_rate, estimated_gdp, flag_url
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            capital = VALUES(capital),
            region = VALUES(region),
            population = VALUES(population),
            currency_code = VALUES(currency_code),
            exchange_rate = VALUES(exchange_rate),
            estimated_gdp = VALUES(estimated_gdp),
            flag_url = VALUES(flag_url),
            last_refreshed_at = CURRENT_TIMESTAMP;
    `;

    const values = [
        countryData.name,
        countryData.capital || null,
        countryData.region || null,
        countryData.population,
        countryData.currency_code || null,
        countryData.exchange_rate || null,
        countryData.estimated_gdp || null,
        countryData.flag_url || null
    ];

    try {
        const [result] = await pool.query(query, values);
        return result;
    } catch (error) {
        console.error('Error upserting country:', error.message);
        throw error;
    }
};

/**
 * Get all countries with optional filters and sorting
 * 
 * MySQL Concept: WHERE clause and ORDER BY
 * - Similar to MongoDB's .find({ region: 'Africa' }).sort({ population: -1 })
 */
const findAll = async (filters = {}) => {
    let query = 'SELECT * FROM countries WHERE 1=1';
    const values = [];

    if (filters.region) {
        query += ' AND region = ?';
        values.push(filters.region);
    }

    if (filters.currency) {
        query += ' AND currency_code = ?';
        values.push(filters.currency);
    }

    if (filters.sort) {
        const [field, order] = filters.sort.split('_');
        if (field === 'gdp') {
            query += ` ORDER BY estimated_gdp ${order.toUpperCase()}`;
        } else if (field === 'population') {
            query += ` ORDER BY population ${order.toUpperCase()}`;
        }
    } else {
        query += ' ORDER BY name ASC';
    }

    try {
        const [rows] = await pool.query(query, values);
        return rows;
    } catch (error) {
        console.error('Error fetching countries:', error.message);
        throw error;
    }
};

/**
 * Find a single country by name
 * 
 * MySQL Concept: WHERE with LIMIT 1
 * - Similar to MongoDB's .findOne({ name: 'Nigeria' })
 */
const findByName = async (name) => {
    const query = 'SELECT * FROM countries WHERE name = ? LIMIT 1';

    try {
        const [rows] = await pool.query(query, [name]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error finding country:', error.message);
        throw error;
    }
};

/**
 * Delete a country by name
 * 
 * MySQL Concept: DELETE FROM
 * - Similar to MongoDB's .deleteOne({ name: 'Nigeria' })
 */
const deleteByName = async (name) => {
    const query = 'DELETE FROM countries WHERE name = ?';

    try {
        const [result] = await pool.query(query, [name]);
        return result.affectedRows > 0;
    } catch (error) {
        console.error('Error deleting country:', error.message);
        throw error;
    }
};

/**
 * Update refresh metadata (total count and timestamp)
 */
const updateMetadata = async (totalCountries) => {
    const query = `
        UPDATE refresh_metadata 
        SET total_countries = ?, last_refreshed_at = CURRENT_TIMESTAMP 
        WHERE id = 1;
    `;

    try {
        await pool.query(query, [totalCountries]);
    } catch (error) {
        console.error('Error updating metadata:', error.message);
        throw error;
    }
};

/**
 * Get refresh metadata
 */
const getMetadata = async () => {
    const query = 'SELECT * FROM refresh_metadata WHERE id = 1';

    try {
        const [rows] = await pool.query(query);
        return rows[0] || null;
    } catch (error) {
        console.error('Error fetching metadata:', error.message);
        throw error;
    }
};

module.exports = {
    upsert,
    findAll,
    findByName,
    deleteByName,
    updateMetadata,
    getMetadata
};