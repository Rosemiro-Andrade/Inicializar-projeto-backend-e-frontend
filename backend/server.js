const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app = express();
app.use(express.json());

// =============================
// BANCO POSTGRESQL
// =============================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.connect()
  .then(() => console.log('Conectado ao PostgreSQL.'))
  .catch(err => console.error('Erro ao conectar:', err));

// Criar tabelas automaticamente
async function criarTabelas() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS stages (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS maquinas (
      id SERIAL PRIMARY KEY,
      stage_id INTEGER REFERENCES stages(id) ON DELETE CASCADE,
      nome TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS registros (
      id SERIAL PRIMARY KEY,
      maquina_id INTEGER REFERENCES maquinas(id) ON DELETE CASCADE,
      quantidade_total INTEGER NOT NULL,
      slot_identificacao TEXT,
      funcionando INTEGER NOT NULL,
      modulo TEXT,
      data_registro DATE DEFAULT CURRENT_DATE
    );
  `);
}

criarTabelas();

// =============================
// ROTAS API
// =============================

// STAGES
app.post('/api/stages', async (req, res) => {
  try {
    const { nome } = req.body;
    const result = await pool.query(
      'INSERT INTO stages (nome) VALUES ($1) RETURNING id',
      [nome]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(400).json(err);
  }
});

app.get('/api/stages', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stages ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(400).json(err);
  }
});

// MAQUINAS
app.post('/api/maquinas', async (req, res) => {
  try {
    const { stage_id, nome } = req.body;
    const result = await pool.query(
      'INSERT INTO maquinas (stage_id, nome) VALUES ($1, $2) RETURNING id',
      [stage_id, nome]
    );
    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(400).json(err);
  }
});

app.get('/api/maquinas/:stage_id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM maquinas WHERE stage_id = $1 ORDER BY id',
      [req.params.stage_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(400).json(err);
  }
});

// REGISTROS
app.post('/api/registros', async (req, res) => {
  try {
    const {
      maquina_id,
      quantidade_total,
      slot_identificacao,
      funcionando,
      modulo
    } = req.body;

    const result = await pool.query(
      `INSERT INTO registros 
      (maquina_id, quantidade_total, slot_identificacao, funcionando, modulo)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [maquina_id, quantidade_total, slot_identificacao, funcionando, modulo]
    );

    res.json({ id: result.rows[0].id });
  } catch (err) {
    res.status(400).json(err);
  }
});

app.get('/api/registros/:maquina_id', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT *,
      (funcionando::float / quantidade_total) * 100 AS porcentagem
      FROM registros
      WHERE maquina_id = $1
      ORDER BY data_registro DESC`,
      [req.params.maquina_id]
    );

    res.json(result.rows);
  } catch (err) {
    res.status(400).json(err);
  }
});

// =============================
// SERVIR ANGULAR BUILD
// =============================

const angularPath = path.join(__dirname, '../frontend/dist/frontend/browser');

app.use(express.static(angularPath));

app.use((req, res) => {
  res.sendFile(path.join(angularPath, 'index.html'));
});

// =============================
// PORTA
// =============================

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});