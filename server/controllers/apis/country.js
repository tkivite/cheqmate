'use strict';
const express = require('express');
const countryService = require('../../services/country/countries');
let router = express.Router();
router.get('/', countryService.fetchCountries);
module.exports = router;