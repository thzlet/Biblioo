CREATE DATABASE IF NOT EXISTS biblioo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE biblioo;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    matricula VARCHAR(50),
    tipo ENUM('aluno', 'professor', 'admin') DEFAULT 'aluno',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_matricula (matricula)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO categorias (nome) VALUES 
    ('Tecnologia'),
    ('Ciências'),
    ('Literatura'),
    ('Direito'),
    ('Comportamento');

CREATE TABLE livros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    autor VARCHAR(255) NOT NULL,
    ano INT,
    paginas INT,
    categoria_id INT NOT NULL,
    subcategoria VARCHAR(100),
    isbn VARCHAR(20) UNIQUE,
    idioma VARCHAR(50) DEFAULT 'Português',
    sinopse TEXT,
    capa_url VARCHAR(500),
    total_exemplares INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id),
    INDEX idx_titulo (titulo),
    INDEX idx_autor (autor),
    INDEX idx_isbn (isbn),
    INDEX idx_categoria (categoria_id),
    FULLTEXT INDEX idx_busca (titulo, autor, sinopse)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE exemplares (
    id INT AUTO_INCREMENT PRIMARY KEY,
    livro_id INT NOT NULL,
    codigo_barras VARCHAR(50) 
    status ENUM('disponivel', 'emprestado', 'reservado', 'manutencao', 'perdido') DEFAULT 'disponivel',
    data_aquisicao DATE,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE,
    INDEX idx_status (status),
    INDEX idx_livro (livro_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE emprestimos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    exemplar_id INT NOT NULL,
    livro_id INT NOT NULL,
    data_emprestimo TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_devolucao_prevista DATE NOT NULL,
    data_devolucao_real TIMESTAMP NULL,
    status ENUM('ativo', 'devolvido', 'atrasado', 'renovado') DEFAULT 'ativo',
    renovacoes INT DEFAULT 0, 
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (exemplar_id) REFERENCES exemplares(id),
    FOREIGN KEY (livro_id) REFERENCES livros(id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_status (status),
    INDEX idx_data_devolucao (data_devolucao_prevista),
    INDEX idx_emprestimo_ativo (usuario_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE fila_espera (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    livro_id INT NOT NULL,
    posicao INT NOT NULL, 
    status ENUM('aguardando', 'notificado', 'atendido', 'cancelado') DEFAULT 'aguardando',
    data_entrada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_notificacao TIMESTAMP NULL, 
    data_limite_resposta TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (livro_id) REFERENCES livros(id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_livro (livro_id),
    INDEX idx_status (status),
    UNIQUE KEY unique_usuario_livro_ativo (usuario_id, livro_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE lista_desejos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    livro_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (livro_id) REFERENCES livros(id) ON DELETE CASCADE,
    UNIQUE KEY unique_usuario_livro (usuario_id, livro_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE configuracoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    valor VARCHAR(255) NOT NULL,
    descricao TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO configuracoes (chave, valor, descricao) 
    ('prazo_emprestimo_dias', '14', 'Prazo padrão para devolução de livros'),
    ('max_renovacoes', '2', 'Número máximo de renovações permitidas'),
    ('max_emprestimos_simultaneos', '5', 'Máximo de livros emprestados simultaneamente'),
    ('tempo_notificacao_fila_horas', '24', 'Tempo que o usuário tem para pegar o livro após notificação'),
    ('multa_diaria_atraso', '1.00', 'Valor da multa por dia de atraso');

CREATE VIEW v_livros_disponibilidade AS
SELECT 
    l.id,
    l.titulo,
    l.autor,
    l.ano,
    l.paginas,
    c.nome as categoria,
    l.subcategoria,
    l.isbn,
    l.idioma,
    l.sinopse,
    l.capa_url,
    l.total_exemplares,
    COUNT(CASE WHEN e.status = 'disponivel' THEN 1 END) as exemplares_disponiveis,
    CASE 
        WHEN COUNT(CASE WHEN e.status = 'disponivel' THEN 1 END) > 0 THEN TRUE 
        ELSE FALSE 
    END as disponivel
FROM livros l
JOIN categorias c ON l.categoria_id = c.id
LEFT JOIN exemplares e ON l.id = e.livro_id
GROUP BY l.id, l.titulo, l.autor, l.ano, l.paginas, c.nome, l.subcategoria, 
         l.isbn, l.idioma, l.sinopse, l.capa_url, l.total_exemplares;

CREATE VIEW v_emprestimos_ativos AS
SELECT 
    e.id,
    e.usuario_id,
    u.nome as usuario_nome,
    u.email as usuario_email,
    e.livro_id,
    l.titulo as livro_titulo,
    l.autor as livro_autor,
    l.capa_url as livro_capa,
    e.exemplar_id,
    e.data_emprestimo,
    e.data_devolucao_prevista,
    e.status,
    DATEDIFF(e.data_devolucao_prevista, CURDATE()) as dias_restantes,
    CASE 
        WHEN e.data_devolucao_prevista < CURDATE() THEN TRUE 
        ELSE FALSE 
    END as atrasado
FROM emprestimos e
JOIN usuarios u ON e.usuario_id = u.id
JOIN livros l ON e.livro_id = l.id
WHERE e.status = 'ativo';

CREATE VIEW v_fila_espera AS
SELECT 
    fe.id,
    fe.usuario_id,
    u.nome as usuario_nome,
    fe.livro_id,
    l.titulo as livro_titulo,
    l.autor as livro_autor,
    l.capa_url as livro_capa,
    ROW_NUMBER() OVER (PARTITION BY fe.livro_id ORDER BY fe.data_entrada) as posicao_real,
    fe.status,
    fe.data_entrada,
    fe.data_notificacao,
    fe.data_limite_resposta
FROM fila_espera fe
JOIN usuarios u ON fe.usuario_id = u.id
JOIN livros l ON fe.livro_id = l.id
WHERE fe.status IN ('aguardando', 'notificado');

DELIMITER //
CREATE TRIGGER trg_emprestimo_insert 
AFTER INSERT ON emprestimos
FOR EACH ROW
BEGIN
    UPDATE exemplares 
    SET status = 'emprestado' 
    WHERE id = NEW.exemplar_id;
END//

CREATE TRIGGER trg_emprestimo_update 
AFTER UPDATE ON emprestimos
FOR EACH ROW
BEGIN
    IF NEW.status = 'devolvido' AND OLD.status != 'devolvido' THEN
        UPDATE exemplares 
        SET status = 'disponivel' 
        WHERE id = NEW.exemplar_id;
    END IF;
END//
DELIMITER ;

DELIMITER //
CREATE PROCEDURE sp_solicitar_emprestimo(
    IN p_usuario_id INT,
    IN p_livro_id INT,
    OUT p_resultado VARCHAR(50),
    OUT p_emprestimo_id INT
)
BEGIN
    DECLARE v_exemplar_id INT;
    DECLARE v_exemplares_disponiveis INT;
    DECLARE v_emprestimos_ativos INT;
    DECLARE v_max_emprestimos INT;
    
    SELECT valor INTO v_max_emprestimos FROM configuracoes WHERE chave = 'max_emprestimos_simultaneos';
    
    SELECT COUNT(*) INTO v_emprestimos_ativos 
    FROM emprestimos 
    WHERE usuario_id = p_usuario_id AND status = 'ativo';
    
    IF v_emprestimos_ativos >= v_max_emprestimos THEN
        SET p_resultado = 'LIMITE_EXCEDIDO';
        SET p_emprestimo_id = NULL;
    ELSE
        SELECT COUNT(*) INTO v_exemplares_disponiveis 
        FROM exemplares 
        WHERE livro_id = p_livro_id AND status = 'disponivel';
        
        IF v_exemplares_disponiveis = 0 THEN
            SET p_resultado = 'INDISPONIVEL';
            SET p_emprestimo_id = NULL;
        ELSE
            START TRANSACTION;
            
            SELECT id INTO v_exemplar_id 
            FROM exemplares 
            WHERE livro_id = p_livro_id AND status = 'disponivel' 
            LIMIT 1 
            FOR UPDATE;
            
            INSERT INTO emprestimos (
                usuario_id, 
                exemplar_id, 
                livro_id, 
                data_devolucao_prevista,
                status
            ) VALUES (
                p_usuario_id, 
                v_exemplar_id, 
                p_livro_id, 
                DATE_ADD(CURDATE(), INTERVAL 14 DAY),
                'ativo'
            );
            
            SET p_emprestimo_id = LAST_INSERT_ID();
            SET p_resultado = 'SUCESSO';
            
            COMMIT;
        END IF;
    END IF;
END//

CREATE PROCEDURE sp_entrar_fila_espera(
    IN p_usuario_id INT,
    IN p_livro_id INT,
    OUT p_resultado VARCHAR(50)
)
BEGIN
    DECLARE v_ja_na_fila INT;
    
    SELECT COUNT(*) INTO v_ja_na_fila 
    FROM fila_espera 
    WHERE usuario_id = p_usuario_id 
      AND livro_id = p_livro_id 
      AND status IN ('aguardando', 'notificado');
    
    IF v_ja_na_fila > 0 THEN
        SET p_resultado = 'JA_NA_FILA';
    ELSE
        INSERT INTO fila_espera (usuario_id, livro_id, posicao, status) 
        VALUES (p_usuario_id, p_livro_id, 0, 'aguardando');
        SET p_resultado = 'SUCESSO';
    END IF;
END//

CREATE PROCEDURE sp_devolver_livro(
    IN p_emprestimo_id INT,
    IN p_usuario_id INT,
    OUT p_resultado VARCHAR(50)
)
BEGIN
    DECLARE v_exemplar_id INT;
    DECLARE v_livro_id INT;
    
    START TRANSACTION;
    
    SELECT exemplar_id, livro_id INTO v_exemplar_id, v_livro_id
    FROM emprestimos 
    WHERE id = p_emprestimo_id 
      AND usuario_id = p_usuario_id 
      AND status = 'ativo';
    
    IF v_exemplar_id IS NULL THEN
        SET p_resultado = 'EMPRESTIMO_NAO_ENCONTRADO';
        ROLLBACK;
    ELSE
        UPDATE emprestimos 
        SET status = 'devolvido', 
            data_devolucao_real = NOW() 
        WHERE id = p_emprestimo_id;
        
        UPDATE exemplares 
        SET status = 'disponivel' 
        WHERE id = v_exemplar_id;
        
        SET p_resultado = 'SUCESSO';
        COMMIT;
    END IF;
END//
DELIMITER ;

INSERT INTO usuarios (nome, email, senha_hash, matricula, tipo) VALUES 
    ('João Silva', 'joao@universidade.br', '$2b$10$YourHashHere', '2021001234', 'aluno'),
    ('Maria Santos', 'maria@universidade.br', '$2b$10$YourHashHere', '2021005678', 'aluno'),
    ('Admin', 'admin@universidade.br', '$2b$10$YourHashHere', NULL, 'admin');

INSERT INTO livros (titulo, autor, ano, paginas, categoria_id, subcategoria, isbn, idioma, sinopse, total_exemplares) VALUES
    ('Clean Code', 'Robert C. Martin', 2008, 431, 1, 'Programação', '978-0-13-235088-4', 'Português', 'Um guia essencial sobre como escrever código limpo, legível e de fácil manutenção.', 1),
    ('Design de Sistemas', 'Alex Xu', 2020, 560, 1, 'Arquitetura de Software', '978-0-13-235089-1', 'Português', 'Um guia completo sobre design de sistemas distribuídos.', 3),
    ('O Poder do Hábito', 'Charles Duhigg', 2012, 408, 5, 'Psicologia', '978-0-13-235090-7', 'Português', 'Por que fazemos o que fazemos na vida e nos negócios.', 5),
    ('O Algoritmo da Vida', 'Brian Christian', 2016, 368, 2, 'Ciência da Computação', '978-0-13-235091-4', 'Português', 'Como a ciência da computação pode ajudar você a tomar decisões melhores.', 2),
    ('Estruturas de Dados', 'Thomas Cormen', 2009, 1292, 1, 'Algoritmos', '978-0-13-235092-1', 'Português', 'O livro definitivo sobre algoritmos e estruturas de dados.', 4);

INSERT INTO exemplares (livro_id, codigo_barras, status) VALUES
    (1, 'LIV001-001', 'disponivel'),
    (2, 'LIV002-001', 'emprestado'),
    (2, 'LIV002-002', 'disponivel'),
    (2, 'LIV002-003', 'disponivel'),
    (3, 'LIV003-001', 'disponivel'),
    (3, 'LIV003-002', 'disponivel'),
    (4, 'LIV004-001', 'emprestado'),
    (4, 'LIV004-002', 'emprestado'),
    (5, 'LIV005-001', 'disponivel');

INSERT INTO emprestimos (usuario_id, exemplar_id, livro_id, data_emprestimo, data_devolucao_prevista, status) VALUES
    (1, 2, 2, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_ADD(NOW(), INTERVAL 9 DAY), 'ativo'),
    (2, 7, 4, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), 'ativo');

INSERT INTO fila_espera (usuario_id, livro_id, posicao, status, data_entrada) VALUES
    (1, 1, 1, 'aguardando', NOW());
