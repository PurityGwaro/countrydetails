const express = require("express");
const cors = require("cors");
require("dotenv").config();
const countryRoutes = require("./src/routes/countryRoutes");

const app = express();
const port = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Country Details API is running' });
});

app.use('/countries', countryRoutes);

app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    });
});

app.use((err, req, res, next) => {
    res.status(500).json({
        message: err.message
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});