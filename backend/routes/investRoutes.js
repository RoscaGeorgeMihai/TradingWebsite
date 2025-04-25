const express = require('express');
const router = express.Router();
const investController = require('../controllers/investController');
const { auth } = require('../middleware/auth');

router.get('/profile', auth, investController.getInvestmentProfile);

router.post('/deposit', auth, investController.depositFunds);

router.post('/withdraw', auth, investController.withdrawFunds);

module.exports = router;