
// Alerta Cheias — Backend simples (Node + Express)
// Guarda os reportes num ficheiro JSON local (reports.json), sem precisar de
// nenhuma base de dados instalada. Suficiente para o hackathon e para testar
// com vários telemóveis ligados à mesma rede Wi-Fi/rede local.

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'reports.json');

app.use(cors());
app.use(express.json());

// --- Persistência simples em ficheiro ---
function loadReports() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) {
    return [];
  }
}

function saveReports(reports) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(reports, null, 2));
}

// --- Rotas ---

// GET /api/reports — devolve todos os reportes em bruto
app.get('/api/reports', (req, res) => {
  res.json(loadReports());
});

// POST /api/reports — cria um novo reporte
// body esperado: { bairro: string, level: number (0-4), note?: string }
app.post('/api/reports', (req, res) => {
  const { bairro, level, note } = req.body;

  if (!bairro || typeof bairro !== 'string') {
    return res.status(400).json({ error: 'Campo "bairro" é obrigatório.' });
  }
  if (typeof level !== 'number' || level < 0 || level > 4) {
    return res.status(400).json({ error: 'Campo "level" deve ser um número entre 0 e 4.' });
  }

  const reports = loadReports();
  const novoReporte = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7),
    bairro: bairro.trim(),
    level,
    note: note || null,
    time: Date.now()
  };

  reports.push(novoReporte);
  saveReports(reports);

  res.status(201).json(novoReporte);
});

// GET /api/bairro-status — estado atual (último nível + tendência) por bairro
// Já vem ordenado do mais crítico para o menos crítico — pronto para a lista do frontend.
app.get('/api/bairro-status', (req, res) => {
  const reports = loadReports();
  const porBairro = {};

  for (const r of reports) {
    if (!porBairro[r.bairro]) porBairro[r.bairro] = [];
    porBairro[r.bairro].push(r);
  }

  const statuses = Object.entries(porBairro).map(([bairro, lista]) => {
    lista.sort((a, b) => a.time - b.time);
    const ultimo = lista[lista.length - 1];
    const anterior = lista.length > 1 ? lista[lista.length - 2] : null;

    return {
      bairro,
      level: ultimo.level,
      time: ultimo.time,
      count: lista.length,
      rising: anterior ? ultimo.level > anterior.level : false
    };
  });

  statuses.sort((a, b) => b.level - a.level || b.time - a.time);
  res.json(statuses);
});

// DELETE /api/reports — limpa todos os dados (útil para reiniciar a demo)
app.delete('/api/reports', (req, res) => {
  saveReports([]);
  res.json({ ok: true });
});

// Verificação rápida de que o servidor está de pé
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor Alerta Cheias a correr em http://localhost:${PORT}`);
  console.log(`   Reportes guardados em: ${DATA_FILE}`);
});
