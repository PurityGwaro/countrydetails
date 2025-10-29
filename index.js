const express = require("express");
const cors = require("cors");
require("dotenv").config();
const countryRoutes = require("./src/routes/countryRoutes");

const app = express();
const port = process.env.PORT || 3006;

app.use(cors());
app.use(express.json());
app.use('/countries', countryRoutes);
app.get('/', (req, res) => {
 res.json({ message: 'Country Details API is running' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});