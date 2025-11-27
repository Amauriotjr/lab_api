require('dotenv').config();
const express = require("express");
const sequelize = require('./db');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

require('./models/User');
require('./models/Empresa');
require('./models/Representante');
require('./models/Proposta');
require('./models/Cargo');
require('./models/Contrato');
require('./models/Permissao');
require('./models/CargoPermissao');
require('./models/Documento');
require('./models/Tarefa');
require('./models/Servico');
require('./models/GoogleToken');
require('./models/Notificacao');
require('./models/Comentario');
require('./models/Notificacao');

const { applyAssociations } = require('./database/associations');
applyAssociations(sequelize);

const app = express();
app.use(express.json());
app.use(cors());

const authRoutes = require('./routes/authRoutes');
const userRoutes = require("./routes/userRoutes");
const empresaRoutes = require("./routes/empresaRoutes");
const representanteRoutes = require("./routes/representanteRoutes");
const propostasRoutes = require('./routes/propostasRoutes');
const documentosRoutes = require('./routes/documentosRoutes');
const cargoRoutes = require('./routes/cargoRoutes');
const tarefaRoutes = require('./routes/tarefaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const googleDriveRoutes = require('./routes/integrations/googleDriveRoutes');
const servicoRoutes = require('./routes/servicoRoutes');
const contratoRoutes = require('./routes/contratoRoutes');
const contratosIntegrationRoutes = require('./routes/contratosIntegrationRoutes');
const googleCalendarRoutes = require('./integrations/googleCalendar/routes');
const notificacaoRoutes = require('./routes/notificacaoRoutes');
const comentarioRoutes = require('./routes/comentarioRoutes');

app.use('/api/auth', authRoutes);
app.use("/api/usuarios", userRoutes);
app.use("/api/empresas", empresaRoutes);
app.use("/api/representantes", representanteRoutes);
app.use('/api/propostas', propostasRoutes);
app.use('/api/documentos', documentosRoutes);
app.use('/api/integrations/google-drive', googleDriveRoutes);
app.use('/api/cargos', cargoRoutes);
app.use('/api/tarefas', tarefaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/servicos', servicoRoutes);
app.use('/api/contratos', contratoRoutes);
app.use('/api', contratosIntegrationRoutes);
app.use('/api/google-calendar', googleCalendarRoutes);
app.use('/api/notificacoes', notificacaoRoutes);
app.use('/api/comentarios', comentarioRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

sequelize.sync({ force: true }).then(() => {
  console.log("Banco de dados e associações sincronizados!");
  app.listen(3000, () => console.log("Servidor rodando na porta 3000 🚀"));

  // Cron opcional para verificar vencimentos próximos (tarefas com contrato)
  if (process.env.NOTIF_ENABLE_CRON === 'true') {
    const { verificarVencimentosProximos } = require('./services/notificacaoService');
    const intervaloMin = Number(process.env.NOTIF_CRON_INTERVAL_MIN || 60);
    const diasAhead = Number(process.env.NOTIF_DAYS_AHEAD || 7);
    const ms = Math.max(1, intervaloMin) * 60 * 1000;
    setInterval(() => {
      verificarVencimentosProximos(diasAhead)
        .then(r => console.log(`[notificacoes-cron] Verificados vencimentos (próx ${diasAhead} dias):`, r.total))
        .catch(err => console.warn('[notificacoes-cron] erro:', err.message));
    }, ms);
    console.log(`[notificacoes-cron] Ativado: cada ${intervaloMin} min, janela ${diasAhead} dias.`);
  }
}).catch(err => {
  console.error("Erro ao sincronizar o banco:", err.message);
});