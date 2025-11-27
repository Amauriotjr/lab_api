const Notificacao = require('../models/Notificacao');
const User = require('../models/User');
const Cargo = require('../models/Cargo');
const { Op } = require('sequelize');
const { enviarEmail } = require('./emailService');

async function criarNotificacao(usuarioIdDestino, mensagem, options = {}) {
  if (!usuarioIdDestino) throw new Error('usuarioIdDestino é obrigatório');
  if (!mensagem) throw new Error('mensagem é obrigatória');

  const notif = await Notificacao.create({
    usuario_id_destino: usuarioIdDestino,
    mensagem,
    lida: false
  });

  if (options.email !== false) {
    try {
      const user = await User.findOne({ where: { id_usuario: usuarioIdDestino } });
      if (user?.email) {
        await enviarEmail(user.email, 'Nova notificação', mensagem);
      }
    } catch (e) {
      console.warn('[notificacaoService] Falha ao enviar e-mail:', e.message);
    }
  }

  return notif;
}

async function listarNaoLidas(usuarioIdDestino) {
  return await Notificacao.findAll({
    where: { usuario_id_destino: usuarioIdDestino, lida: false },
    order: [['criado_em', 'DESC']]
  });
}

async function marcarComoLida(idNotificacao, usuarioIdDestino) {
  const n = await Notificacao.findOne({ where: { id_notificacao: idNotificacao, usuario_id_destino: usuarioIdDestino } });
  if (!n) throw new Error('Notificação não encontrada');
  await n.update({ lida: true });
  return n;
}

async function usuariosGerentes() {
  // encontra usuários cujo cargo é "Gerente"
  const gerentes = await User.findAll({
    include: [{ model: Cargo, where: { nome_cargo: { [Op.like]: 'Gerente%' } }, required: true }]
  });
  return gerentes;
}

async function notificarGerentes(mensagem, options = {}) {
  const gerentes = await usuariosGerentes();
  const results = [];
  for (const g of gerentes) {
    const r = await criarNotificacao(g.id_usuario, mensagem, options);
    results.push(r);
  }
  return results;
}

// Cron opcional: verifica tarefas com contrato e data_fim próxima
async function verificarVencimentosProximos(dias = 7) {
  const Tarefa = require('../models/Tarefa');
  const agora = new Date();
  const limite = new Date(agora.getTime() + dias * 24 * 60 * 60 * 1000);
  const proximas = await Tarefa.findAll({
    where: {
      contrato_id: { [Op.ne]: null },
      data_fim: { [Op.gte]: agora, [Op.lte]: limite }
    }
  });

  for (const t of proximas) {
    if (t.responsavel_id) {
      const msg = `Vencimento próximo da tarefa "${t.titulo}" (até ${new Date(t.data_fim).toLocaleString()}).`;
      await criarNotificacao(t.responsavel_id, msg);
    }
  }

  return { total: proximas.length };
}

module.exports = {
  criarNotificacao,
  listarNaoLidas,
  marcarComoLida,
  notificarGerentes,
  verificarVencimentosProximos
};
