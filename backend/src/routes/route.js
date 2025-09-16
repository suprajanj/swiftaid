const express = require('express');
const router = express.Router();

const controller = require('../controller/controller');

router.get('/alerts', controller.getAllAlerts);
router.put('/alerts/:id', controller.acceptAlert);
router.get('/alerts/:id', controller.displayAlertDetails);

module.exports = router;
