const express = require('express');
const router = express.Router();
const ctrl = require('../../controllers/googleDriveController');

/**
 * @swagger
 * tags:
 *   - name: Google Drive
 *     description: Integração com Google Drive e Sheets
 */
module.exports = router;