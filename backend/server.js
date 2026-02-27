const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Erro ao conectar ao banco:', err.message);
    } else {
        console.log('Conectado ao SQLite.');
    }
});

// Criar tabelas
db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS stages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS maquinas (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            stage_id INTEGER,
            nome TEXT NOT NULL,
            FOREIGN KEY(stage_id) REFERENCES stages(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS registros (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            maquina_id INTEGER,
            quantidade_total INTEGER NOT NULL,
            slot_identificacao TEXT,
            funcionando INTEGER NOT NULL,
            modulo TEXT,
            data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(maquina_id) REFERENCES maquinas(id)
        )
    `);

});

// =============================
// ROTAS
// =============================

// Teste API
app.get('/', (req, res) => {
    res.json({ message: 'API monitoramento rodando 🚀' });
});

// =============================
// STAGES
// =============================

app.post('/stages', (req, res) => {
    const { nome } = req.body;

    db.run(
        `INSERT INTO stages (nome) VALUES (?)`,
        [nome],
        function (err) {
            if (err) return res.status(400).json(err);
            res.json({ id: this.lastID });
        }
    );
});

app.get('/stages', (req, res) => {
    db.all(`SELECT * FROM stages`, [], (err, rows) => {
        if (err) return res.status(400).json(err);
        res.json(rows);
    });
});

// =============================
// MAQUINAS
// =============================

app.post('/maquinas', (req, res) => {
    const { stage_id, nome } = req.body;

    db.run(
        `INSERT INTO maquinas (stage_id, nome) VALUES (?, ?)`,
        [stage_id, nome],
        function (err) {
            if (err) return res.status(400).json(err);
            res.json({ id: this.lastID });
        }
    );
});

app.get('/maquinas/:stage_id', (req, res) => {
    db.all(
        `SELECT * FROM maquinas WHERE stage_id = ?`,
        [req.params.stage_id],
        (err, rows) => {
            if (err) return res.status(400).json(err);
            res.json(rows);
        }
    );
});

// =============================
// REGISTROS (Histórico)
// =============================

app.post('/registros', (req, res) => {
    const {
        maquina_id,
        quantidade_total,
        slot_identificacao,
        funcionando,
        modulo
    } = req.body;

    db.run(
        `INSERT INTO registros 
        (maquina_id, quantidade_total, slot_identificacao, funcionando, modulo)
        VALUES (?, ?, ?, ?, ?)`,
        [maquina_id, quantidade_total, slot_identificacao, funcionando, modulo],
        function (err) {
            if (err) return res.status(400).json(err);
            res.json({ id: this.lastID });
        }
    );
});

// Buscar histórico por máquina
app.get('/registros/:maquina_id', (req, res) => {
    db.all(
        `SELECT *,
        (CAST(funcionando AS FLOAT) / quantidade_total) * 100 AS porcentagem
        FROM registros
        WHERE maquina_id = ?
        ORDER BY data_registro DESC`,
        [req.params.maquina_id],
        (err, rows) => {
            if (err) return res.status(400).json(err);
            res.json(rows);
        }
    );
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});