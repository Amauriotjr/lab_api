const express = require('express');
const router = express.Router();

const controller = require('../controllers/notificacaoController');
const authMiddleware = require('../middlewares/authMiddleware'); 

/**
 * @swagger
 * tags:
 *   name: Notificações
 *   description: Endpoints para gerenciamento de notificações
 */

/**
 * @swagger
 * /notificacoes/minhas:
 *   get:
 *     summary: Lista todas as notificações não lidas do usuário autenticado
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de notificações não lidas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notificacao'
 *       401:
 *         description: Token inválido ou ausente
 */
router.get('/minhas', authMiddleware, controller.minhas);

/**
 * @swagger
 * /notificacoes/{id}/lida:
 *   put:
 *     summary: Marca uma notificação como lida
 *     tags: [Notificações]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID da notificação a ser marcada como lida
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Notificação marcada como lida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notificacao'
 *       404:
 *         description: Notificação não encontrada
 *       401:
 *         description: Token inválido ou ausente
 */
router.put('/:id/lida', authMiddleware, controller.marcarComoLida);

module.exports = router;
