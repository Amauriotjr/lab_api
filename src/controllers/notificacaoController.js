const notificacaoService = require('../services/notificacaoService');

module.exports = {
  async minhas(req, res) {
    try {
      // AQUI ESTÁ A CORREÇÃO (de 'id_usuario' para 'id')
      const userId = req.user?.id || Number(req.query.usuarioId);

      if (!userId) return res.status(400).json({ error: 'usuarioId é obrigatório (query) se não houver usuário autenticado.' });
      const lista = await notificacaoService.listarNaoLidas(userId);
      return res.status(200).json(lista);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  },

  async marcarComoLida(req, res) {
    try {
      const id = Number(req.params.id);

      // E AQUI ESTÁ A SEGUNDA CORREÇÃO (de 'id_usuario' para 'id')
      const userId = req.user?.id || Number(req.body.usuarioId) || Number(req.query.usuarioId);

      if (!id || !userId) return res.status(400).json({ error: 'id e usuarioId são obrigatórios.' });
      const n = await notificacaoService.marcarComoLida(id, userId);
      return res.status(200).json(n);
    } catch (e) {
      return res.status(404).json({ error: e.message });
    }
  }
};