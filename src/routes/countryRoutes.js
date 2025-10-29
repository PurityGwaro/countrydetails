const express = require('express');
const { refreshCountries, getAllCountries, getCountryByName, deleteCountryByName, getStatus, getSummaryImage } = require('../controllers/countryController');

const router = express.Router();

router.post('/refresh', refreshCountries);
router.get('/status', getStatus);
router.get('/image', getSummaryImage);
router.get('/', getAllCountries);
router.get('/:name', getCountryByName);
router.delete('/:name', deleteCountryByName);

module.exports = router;