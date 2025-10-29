const express = require('express');
const { refreshCountries, getAllCountries, getCountryByName, deleteCountryByName, getStatus, getSummaryImage } = require('../controllers/countryController');
const { validateCountryQuery } = require('../middleware/validation');

const router = express.Router();

router.post('/refresh', refreshCountries);
router.get('/status', getStatus);
router.get('/image', getSummaryImage);
router.get('/', validateCountryQuery, getAllCountries);
router.get('/:name', getCountryByName);
router.delete('/:name', deleteCountryByName);

module.exports = router;