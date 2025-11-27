const { google } = require('googleapis');


async function listWeekly({ userId, date, tokenStore }) {
  const auth = await tokenStore.getClient(userId);
  if (!auth) throw new Error('Usuário não autenticado com o Google.');
  const calendar = google.calendar({ version: 'v3', auth });

  // basic weekly range
  const start = new Date(date || Date.now());
  const day = start.getDay();
  const diff = start.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(start.setDate(diff));
  monday.setHours(0,0,0,0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate()+6);
  sunday.setHours(23,59,59,999);

  const resp = await calendar.events.list({
    calendarId: 'primary',
    timeMin: monday.toISOString(),
    timeMax: sunday.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 50,
  });
  return resp.data.items || [];
}

async function listMonthly({ userId, year, month, tokenStore }) {
  const auth = await tokenStore.getClient(userId);
  if (!auth) throw new Error('Usuário não autenticado com o Google.');
  const calendar = google.calendar({ version: 'v3', auth });

  const y = Number(year) || new Date().getFullYear();
  const m = Number(month) || (new Date().getMonth()+1);
  const start = new Date(Date.UTC(y, m-1, 1, 0,0,0));
  const end = new Date(Date.UTC(y, m, 0, 23,59,59));

  const resp = await calendar.events.list({
    calendarId: 'primary',
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 250,
  });
  return resp.data.items || [];
}

async function createMeeting({ userId, payload, tokenStore }) {
  const auth = await tokenStore.getClient(userId);
  if (!auth) throw new Error('Usuário não autenticado com o Google.');
  const calendar = google.calendar({ version: 'v3', auth });

  // Clona o payload para não modificar o objeto original
  const body = { ...payload };

  // Se não houver local presencial definido ou se indicar reunião online,
  // gera automaticamente um link do Google Meet.
  const location = (body.location || '').toLowerCase();
  if (!body.location || location.includes('online') || location.includes('remoto') || location.includes('virtual')) {
    body.conferenceData = {
      createRequest: {
        requestId: `meet-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  }

  const res = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: body,
    conferenceDataVersion: body.conferenceData ? 1 : undefined,
    sendUpdates: body.sendUpdates || 'none',
  });
  return res.data;
}

module.exports = { listWeekly, listMonthly, createMeeting };
