const express = require('express');
const { refreshCountries, getAllCountries, getCountryByName, deleteCountryByName, getStatus } = require('../controllers/countryController');

const router = express.Router();

router.post('/refresh', refreshCountries);
router.get('/status', getStatus);
router.get('/', getAllCountries);
router.get('/:name', getCountryByName);
router.delete('/:name', deleteCountryByName);

module.exports = router;