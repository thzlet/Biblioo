/**
 * backend api (node.js + express + mysql)
 * 
 * 1. npm init -y
 * 2. npm install express mysql2 bcrypt jsonwebtoken cors dotenv
 * 3. node server.js
 */

const express = require('express'); // importa o express, que é o framework pra criar servidor HTTP
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt'); // usado pra criptografar senhas
const jwt = require('jsonwebtoken'); // gera tokens
const cors = require('cors');
require('dotenv').config(); // senha do banco, chave JWT

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_muito_segura';

// middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // urls do frontend
  credentials: true
}));
app.use(express.json());

// pool de conexões mysql
const pool = mysql.createPool({ // conjunto de conexões
  host: process.env.DB_HOST || 'localhost', // endereço do banco
  user: process.env.DB_USER || 'root', 
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'biblioo',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, // maximo de conexoes simultaneas
  queueLimit: 0, // limite da fila de espera
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// ============================================
// MIDDLEWARE DE AUTENTICAÇÃO
// ============================================
/*
aqui ele vai verificar se tem token, validar JWT, consultar o banco
*/
const autenticar = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization; // pega o header Authorization da requisição
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) { // verifica se o token foi enviado e se está no formato "Bearer TOKEN"
      return res.status(401).json({ erro: 'Token não fornecido' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);  // verifica e decodifica o token usando a chave secreta
    
    // verificar se usuário ainda existe e está ativo
    const [rows] = await pool.execute(
      'SELECT id, nome, email, matricula, tipo FROM usuarios WHERE id = ? AND ativo = TRUE',
      [decoded.id]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ erro: 'Usuário não encontrado ou inativo' });
    }
    
    req.usuario = rows[0];
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ erro: 'Token inválido' });
    } // token expirado 
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: 'Token expirado' });
    } // erro generico
    console.error('Erro na autenticação:', err);
    res.status(500).json({ erro: 'Erro interno' });
  }
};

// ============================================
// ROTAS DE AUTENTICAÇÃO
// ============================================

// POST /api/login
app.post('/api/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    
    if (!email || !senha) { // validacao basica
      return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
    }
    
    const [rows] = await pool.execute(
      'SELECT * FROM usuarios WHERE email = ? AND ativo = TRUE', // filtra usuario inativo
      [email]
    );
    
    if (rows.length === 0) { // vendo se existe
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }
    
    const usuario = rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);  // senha vs hash do banco
    
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Email ou senha incorretos' });
    }
    
    const token = jwt.sign(
      { id: usuario.id, email: usuario.email, tipo: usuario.tipo }, // dados dentro do token 
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        matricula: usuario.matricula,
        tipo: usuario.tipo
      }
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// POST /api/register
app.post('/api/register', async (req, res) => { // rota post para registrar novo usuario  
  try {
    const { nome, email, senha, matricula } = req.body; // extrai os campos do corpo da requisição
    
    if (!nome || !email || !senha) { // validação 
      return res.status(400).json({ erro: 'Nome, email e senha são obrigatórios' });
    }
    
    // verificar se email já existe
    const [existente] = await pool.execute(
      'SELECT id FROM usuarios WHERE email = ?',
      [email]
    );
    
    if (existente.length > 0) {
      return res.status(400).json({ erro: 'Email já cadastrado' });
    }
    
    // gera o hash da senha com bcrypt
    const senhaHash = await bcrypt.hash(senha, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nome, email, senha_hash, matricula) VALUES (?, ?, ?, ?)',
      [nome, email, senhaHash, matricula || null]
    );
    
    res.status(201).json({
      sucesso: true,
      usuario: {
        id: result.insertId,
        nome,
        email,
        matricula
      }
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

// GET /api/perfil
app.get('/api/perfil', autenticar, async (req, res) => {
  res.json(req.usuario);
});

// ============================================
// ROTAS DE LIVROS
// ============================================

// GET /api/livros
app.get('/api/livros', autenticar, async (req, res) => {
  try {
    const { categoria, busca } = req.query;
    
    let sql = 'SELECT * FROM v_livros_disponibilidade WHERE 1=1';
    const params = [];
    
    if (categoria && categoria !== 'Todos') {
      sql += ' AND categoria = ?';
      params.push(categoria);
    }
    
    if (busca) {
      sql += ' AND (titulo LIKE ? OR autor LIKE ? OR isbn LIKE ?)';
      params.push(`%${busca}%`, `%${busca}%`, `%${busca}%`);
    }
    
    sql += ' ORDER BY titulo ASC';
    
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar livros:', error);
    res.status(500).json({ erro: 'Erro ao buscar livros' });
  }
});

// GET /api/livros/:id
app.get('/api/livros/:id', autenticar, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [rows] = await pool.execute(
      'SELECT * FROM v_livros_disponibilidade WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Livro não encontrado' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar livro:', error);
    res.status(500).json({ erro: 'Erro ao buscar livro' });
  }
});

// GET /api/categorias
app.get('/api/categorias', autenticar, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM categorias ORDER BY nome');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.status(500).json({ erro: 'Erro ao buscar categorias' });
  }
});

// ============================================
// ROTAS DE EMPRÉSTIMOS
// ============================================

// GET /api/emprestimos/ativos
app.get('/api/emprestimos/ativos', autenticar, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    
    const [rows] = await pool.execute(
      `SELECT 
        e.id,
        e.livro_id,
        l.titulo as livro_titulo,
        l.autor as livro_autor,
        l.capa_url as livro_capa,
        e.data_emprestimo,
        e.data_devolucao_prevista,
        e.status,
        DATEDIFF(e.data_devolucao_prevista, CURDATE()) as dias_restantes
      FROM emprestimos e
      JOIN livros l ON e.livro_id = l.id
      WHERE e.usuario_id = ? AND e.status = 'ativo'
      ORDER BY e.data_devolucao_prevista ASC`,
      [usuarioId]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar empréstimos:', error);
    res.status(500).json({ erro: 'Erro ao buscar empréstimos' });
  }
});

// POST /api/emprestimos
app.post('/api/emprestimos', autenticar, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { livroId } = req.body;
    const usuarioId = req.usuario.id;
    
    if (!livroId) {
      return res.status(400).json({ erro: 'ID do livro é obrigatório' });
    }
    
    await connection.beginTransaction();
    
    // verificar limite de empréstimos
    const [config] = await connection.execute(
      "SELECT valor FROM configuracoes WHERE chave = 'max_emprestimos_simultaneos'"
    );
    const maxEmprestimos = parseInt(config[0]?.valor || '5');
    
    const [emprestimosAtivos] = await connection.execute(
      'SELECT COUNT(*) as total FROM emprestimos WHERE usuario_id = ? AND status = ?',
      [usuarioId, 'ativo']
    );
    
    if (emprestimosAtivos[0].total >= maxEmprestimos) {
      await connection.rollback();
      return res.status(400).json({ 
        erro: 'Limite de empréstimos excedido',
        limite: maxEmprestimos,
        atual: emprestimosAtivos[0].total
      });
    }
    
    // verificar se já tem este livro emprestado
    const [jaEmprestado] = await connection.execute(
      'SELECT id FROM emprestimos WHERE usuario_id = ? AND livro_id = ? AND status = ?',
      [usuarioId, livroId, 'ativo']
    );
    
    if (jaEmprestado.length > 0) {
      await connection.rollback();
      return res.status(400).json({ erro: 'Você já possui este livro emprestado' });
    }
    
    // buscar exemplar disponível com LOCK
    const [exemplares] = await connection.execute(
      'SELECT id FROM exemplares WHERE livro_id = ? AND status = ? LIMIT 1 FOR UPDATE',
      [livroId, 'disponivel']
    );
    
    if (exemplares.length === 0) {
      await connection.rollback();
      return res.status(400).json({ erro: 'Livro indisponível' });
    }
    
    const exemplarId = exemplares[0].id;
    
    // buscar prazo de devolução
    const [prazoConfig] = await connection.execute(
      "SELECT valor FROM configuracoes WHERE chave = 'prazo_emprestimo_dias'"
    );
    const prazoDias = parseInt(prazoConfig[0]?.valor || '14');
    
    // criar empréstimo
    const [result] = await connection.execute(
      `INSERT INTO emprestimos 
       (usuario_id, exemplar_id, livro_id, data_devolucao_prevista, status) 
       VALUES (?, ?, ?, DATE_ADD(CURDATE(), INTERVAL ? DAY), ?)`,
      [usuarioId, exemplarId, livroId, prazoDias, 'ativo']
    );
    
    // atualizar status do exemplar
    await connection.execute(
      'UPDATE exemplares SET status = ? WHERE id = ?',
      ['emprestado', exemplarId]
    );
    
    await connection.commit();
    
    res.status(201).json({
      sucesso: true,
      emprestimoId: result.insertId,
      mensagem: 'Empréstimo realizado com sucesso'
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao criar empréstimo:', error);
    res.status(500).json({ erro: 'Erro ao criar empréstimo' });
  } finally {
    connection.release();
  }
});

// PUT /api/emprestimos/:id/devolver
app.put('/api/emprestimos/:id/devolver', autenticar, async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;
    
    await connection.beginTransaction();
    
    // verificar empréstimo
    const [emprestimos] = await connection.execute(
      'SELECT * FROM emprestimos WHERE id = ? AND usuario_id = ? AND status = ?',
      [id, usuarioId, 'ativo']
    );
    
    if (emprestimos.length === 0) {
      await connection.rollback();
      return res.status(404).json({ erro: 'Empréstimo não encontrado' });
    }
    
    const emprestimo = emprestimos[0];
    
    // atualizar empréstimo
    await connection.execute(
      'UPDATE emprestimos SET status = ?, data_devolucao_real = NOW() WHERE id = ?',
      ['devolvido', id]
    );
    
    // liberar exemplar
    await connection.execute(
      'UPDATE exemplares SET status = ? WHERE id = ?',
      ['disponivel', emprestimo.exemplar_id]
    );
    
    // verificar fila de espera
    const [fila] = await connection.execute(
      `SELECT fe.*, u.email, u.nome 
       FROM fila_espera fe
       JOIN usuarios u ON fe.usuario_id = u.id
       WHERE fe.livro_id = ? AND fe.status = 'aguardando'
       ORDER BY fe.data_entrada ASC
       LIMIT 1`,
      [emprestimo.livro_id]
    );
    
    if (fila.length > 0) {
      // notificar próximo da fila
      await connection.execute(
        `UPDATE fila_espera 
         SET status = 'notificado', 
             data_notificacao = NOW(),
             data_limite_resposta = DATE_ADD(NOW(), INTERVAL 24 HOUR)
         WHERE id = ?`,
        [fila[0].id]
      );
      
      console.log(`Notificar ${fila[0].email} que o livro está disponível`);
    }
    
    await connection.commit();
    
    res.json({
      sucesso: true,
      mensagem: 'Livro devolvido com sucesso'
    });
    
  } catch (error) {
    await connection.rollback();
    console.error('Erro ao devolver livro:', error);
    res.status(500).json({ erro: 'Erro ao devolver livro' });
  } finally {
    connection.release();
  }
});

// GET /api/emprestimos/historico
app.get('/api/emprestimos/historico', autenticar, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    
    const [rows] = await pool.execute(
      `SELECT 
        e.id,
        e.livro_id,
        l.titulo as livro_titulo,
        l.autor as livro_autor,
        l.capa_url as livro_capa,
        e.data_emprestimo,
        e.data_devolucao_prevista,
        e.data_devolucao_real,
        e.status
      FROM emprestimos e
      JOIN livros l ON e.livro_id = l.id
      WHERE e.usuario_id = ? AND e.status = 'devolvido'
      ORDER BY e.data_devolucao_real DESC`,
      [usuarioId]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    res.status(500).json({ erro: 'Erro ao buscar histórico' });
  }
});

// ============================================
// ROTAS DE FILA DE ESPERA
// ============================================

// GET /api/fila-espera
app.get('/api/fila-espera', autenticar, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    
    const [rows] = await pool.execute(
      `SELECT 
        fe.id,
        fe.livro_id,
        l.titulo as livro_titulo,
        l.autor as livro_autor,
        l.capa_url as livro_capa,
        fe.status,
        fe.data_entrada,
        fe.data_notificacao,
        fe.data_limite_resposta,
        (
          SELECT COUNT(*) + 1 
          FROM fila_espera f2 
          WHERE f2.livro_id = fe.livro_id 
            AND f2.data_entrada < fe.data_entrada 
            AND f2.status IN ('aguardando', 'notificado')
        ) as posicao_real
      FROM fila_espera fe
      JOIN livros l ON fe.livro_id = l.id
      WHERE fe.usuario_id = ? AND fe.status IN ('aguardando', 'notificado')
      ORDER BY fe.data_entrada ASC`,
      [usuarioId]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar fila:', error);
    res.status(500).json({ erro: 'Erro ao buscar fila de espera' });
  }
});

// POST /api/fila-espera
app.post('/api/fila-espera', autenticar, async (req, res) => {
  try {
    const { livroId } = req.body;
    const usuarioId = req.usuario.id;
    
    if (!livroId) {
      return res.status(400).json({ erro: 'ID do livro é obrigatório' });
    }
    
    // verificar se já está na fila
    const [existente] = await pool.execute(
      `SELECT id FROM fila_espera 
       WHERE usuario_id = ? AND livro_id = ? AND status IN ('aguardando', 'notificado')`,
      [usuarioId, livroId]
    );
    
    if (existente.length > 0) {
      return res.status(400).json({ erro: 'Você já está na fila de espera deste livro' });
    }
    
    // inserir na fila
    const [result] = await pool.execute(
      'INSERT INTO fila_espera (usuario_id, livro_id, posicao, status) VALUES (?, ?, 0, ?)',
      [usuarioId, livroId, 'aguardando']
    );
    
    res.status(201).json({
      sucesso: true,
      filaId: result.insertId,
      mensagem: 'Você entrou na fila de espera'
    });
    
  } catch (error) {
    console.error('Erro ao entrar na fila:', error);
    res.status(500).json({ erro: 'Erro ao entrar na fila de espera' });
  }
});

// DELETE /api/fila-espera/:id
app.delete('/api/fila-espera/:id', autenticar, async (req, res) => { // cancela um item da fila de espera
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;
    
    const [result] = await pool.execute( // executa a query no banco para cancelar o item
      "UPDATE fila_espera SET status = 'cancelado' WHERE id = ? AND usuario_id = ?",
      [id, usuarioId]
    );
    
    if (result.affectedRows === 0) { // se nenhuma linha foi afetada, o item não existe ou não pertence ao usuário
      return res.status(404).json({ erro: 'Item da fila não encontrado' });
    }
    
    res.json({
      sucesso: true,
      mensagem: 'Você saiu da fila de espera'
    });
    
  } catch (error) {
    console.error('Erro ao cancelar fila:', error);
    res.status(500).json({ erro: 'Erro ao cancelar fila de espera' });
  }
});

// ============================================
// ROTAS ADMIN (só pros adm)
// ============================================

const apenasAdmin = (req, res, next) => {
  if (req.usuario.tipo !== 'admin') {
    return res.status(403).json({ erro: 'Acesso restrito a administradores' });
  }
  next();
};

// GET /api/admin/emprestimos (todos os empréstimos)
app.get('/api/admin/emprestimos', autenticar, apenasAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT e.*, u.nome as usuario_nome, u.email as usuario_email, l.titulo as livro_titulo
       FROM emprestimos e
       JOIN usuarios u ON e.usuario_id = u.id
       JOIN livros l ON e.livro_id = l.id
       ORDER BY e.data_emprestimo DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro ao buscar empréstimos' });
  }
});

// POST /api/admin/livros (cadastrar livro)
app.post('/api/admin/livros', autenticar, apenasAdmin, async (req, res) => {
  try {
    const { titulo, autor, ano, paginas, categoria_id, subcategoria, isbn, sinopse, total_exemplares } = req.body;
    
    const [result] = await pool.execute(
      `INSERT INTO livros (titulo, autor, ano, paginas, categoria_id, subcategoria, isbn, sinopse, total_exemplares)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [titulo, autor, ano, paginas, categoria_id, subcategoria, isbn, sinopse, total_exemplares || 1]
    );
    
    // criar exemplares
    const livroId = result.insertId; // pega o ID do livro que acabou de ser inserido no banco
    const numExemplares = total_exemplares || 1; // define quantos exemplares serão criados ou exibe 1 por padrão (se total_exemplares nao existir)
    
    for (let i = 1; i <= numExemplares; i++) {
      await pool.execute(
        'INSERT INTO exemplares (livro_id, codigo_barras, status) VALUES (?, ?, ?)', // insere um novo exemplar na tabela
        [livroId, `LIV${String(livroId).padStart(3, '0')}-${String(i).padStart(3, '0')}`, 'disponivel']
      );
    }
    
    res.status(201).json({ sucesso: true, livroId });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ erro: 'Erro ao cadastrar livro' });
  }
});

// ============================================
// HEALTH CHECK
// ============================================
app.get('/api/health', async (req, res) => { // verifica se a api ta rodando 
  try {
    await pool.execute('SELECT 1'); // ping no banco 
    res.json({ status: 'OK', database: 'Conectado' });
  } catch (error) {
    res.status(500).json({ status: 'ERRO', database: 'Desconectado' });
  }
});

// ============================================
// INICIAR SERVIDOR
// ============================================
app.listen(PORT, () => {
  console.log(`🚀 Servidor Biblioo rodando na porta ${PORT}`); // exibe no console que o servidor está rodando
  console.log(`📚 API disponível em: http://localhost:${PORT}/api`); // mostra a URL base da API para acesso
});

// tratamento de erros não capturados
process.on('unhandledRejection', (err) => { // captura erros de Promises que não foram tratados
  console.error('Erro não tratado:', err); // exibe o erro no console para debug
});
