const pool = require("../config/database");

const createCountriesTable = async () => {
    const connection = await pool.getConnection();
    const tableQuery = `
        CREATE TABLE IF NOT EXISTS countries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            capital VARCHAR(255),
            region VARCHAR(100),
            population BIGINT NOT NULL,
            currency_code VARCHAR(10),
            exchange_rate DECIMAL(15, 6),
            estimated_gdp DECIMAL(20, 2),
            flag_url TEXT,
            last_refreshed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
    `;

    const metadataQuery = `
        CREATE TABLE IF NOT EXISTS refresh_metadata (
        id INT PRIMARY KEY DEFAULT 1,
        total_countries INT DEFAULT 0,
        last_refreshed_at TIMESTAMP NULL,
        CHECK (id = 1)
        ) ENGINE=InnoDB;`;

    try {
        await connection.execute(tableQuery);
        console.log("Countries table created successfully");
        // Create metadata table for /status endpoint
        await connection.execute(metadataQuery);
        console.log("Metadata table created successfully");
        // Insert initial metadata row - learnt the table is an UPDATE hence the initial row has to exist(needs more research!!)
        const insertMetadata = `
            INSERT IGNORE INTO refresh_metadata (id, total_countries, last_refreshed_at)
            VALUES (1, 0, NULL);
            `;
        await connection.execute(insertMetadata);
        console.log("Initial metadata row inserted");
    } catch (error) {
        console.error("Error creating tables:", error);
    } finally {
        connection.release();
    }
};

createCountriesTable()
    .then(() => {
        console.log("Migration complete");
        process.exit(0);
    })
    .catch((error) => {
        console.error("Migration failed:", error);
        process.exit(1);
    });