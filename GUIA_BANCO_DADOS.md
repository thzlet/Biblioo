# BIBLIOO - Guia Completo do Banco de Dados
# Índice

1. [Arquitetura de Dados](#arquitetura-de-dados)
2. [Estrutura das Tabelas](#estrutura-das-tabelas)
3. [Relacionamentos](#relacionamentos)

---
## Arquitetura de Dados
### Diagrama das Entidades

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  usuarios   │     │   livros    │     │ categorias  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)     │     │ id (PK)     │
│ nome        │     │ titulo      │     │ nome        │
│ email       │◄────┤ categoria_id│────►│ descricao   │
│ senha_hash  │     │ autor       │     └─────────────┘
│ matricula   │     │ isbn        │
└─────────────┘     │ total_exemplares
       │            └─────────────┘
       │                   │
       │            ┌─────────────┐
       │            │  exemplares │
       │            ├─────────────┤
       │            │ id (PK)     │
       └───────────►│ livro_id    │
                    │ status      │
                    │ codigo_barras
                    └─────────────┘
                           │
       ┌───────────────────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│ emprestimos │     │ fila_espera │
├─────────────┤     ├─────────────┤
│ id (PK)     │     │ id (PK)     │
│ usuario_id  │     │ usuario_id  │
│ exemplar_id │     │ livro_id    │
│ livro_id    │     │ posicao     │
│ status      │     │ status      │
│ data_emprest│     │ data_entrada│
│ data_devol..│     └─────────────┘
└─────────────┘
```

---

## Estrutura das Tabelas

### 1. **Usuarios** 
Armazena todos os usuários do sistema.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT (PK) | Identificador único |
| `nome` | VARCHAR(255) | Nome completo |
| `email` | VARCHAR(255) | Email único para login |
| `senha_hash` | VARCHAR(255) | Hash bcrypt da senha |
| `matricula` | VARCHAR(50) | Número de matrícula |
| `tipo` | ENUM | aluno/professor/admin |
| `ativo` | BOOLEAN | Se a conta está ativa |

```sql
-- Exemplo de INSERT
INSERT INTO usuarios (nome, email, senha_hash, matricula) 
VALUES ('João Silva', 'joao@universidade.br', '$2b$10$...', '2021001234');
```

### 2. **Categorias** 
Categorias dos livros.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT (PK) | Identificador |
| `nome` | VARCHAR(100) | Nome da categoria |
| `descricao` | TEXT | Descrição opcional |

**Categorias padrão:**
- Tecnologia
- Ciências
- Literatura
- Direito
- Comportamento

### 3. **Livros** 
Catálogo de livros.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT (PK) | Identificador |
| `titulo` | VARCHAR(255) | Título do livro |
| `autor` | VARCHAR(255) | Nome do autor |
| `ano` | INT | Ano de publicação |
| `paginas` | INT | Número de páginas |
| `categoria_id` | INT (FK) | Referência à categoria |
| `subcategoria` | VARCHAR(100) | Subcategoria |
| `isbn` | VARCHAR(20) | Código ISBN único |
| `idioma` | VARCHAR(50) | Idioma do livro |
| `sinopse` | TEXT | Descrição/resumo |
| `capa_url` | VARCHAR(500) | URL da imagem |
| `total_exemplares` | INT | Total de cópias |

### 4. **Exemplares** 
Cada cópia física de um livro.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT (PK) | Identificador |
| `livro_id` | INT (FK) | Referência ao livro |
| `codigo_barras` | VARCHAR(50) | Código de barras único |
| `status` | ENUM | disponivel/emprestado/reservado/manutencao/perdido |
| `data_aquisicao` | DATE | Quando foi adquirido |

**Importante:** Um livro pode ter vários exemplares. O status de disponibilidade é controlado aqui.

### 5. **Emprestimos** 
Registra todos os empréstimos.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT (PK) | Identificador |
| `usuario_id` | INT (FK) | Quem pegou o livro |
| `exemplar_id` | INT (FK) | Qual cópia foi emprestada |
| `livro_id` | INT (FK) | Qual livro |
| `data_emprestimo` | TIMESTAMP | Data do empréstimo |
| `data_devolucao_prevista` | DATE | Prazo de devolução |
| `data_devolucao_real` | TIMESTAMP | Data real da devolução |
| `status` | ENUM | ativo/devolvido/atrasado/renovado |
| `renovacoes` | INT | Quantas vezes foi renovado |

### 6. **Fila_espera** 
Fila de espera para livros indisponíveis.

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INT (PK) | Identificador |
| `usuario_id` | INT (FK) | Usuário na fila |
| `livro_id` | INT (FK) | Livro desejado |
| `posicao` | INT | Posição na fila |
| `status` | ENUM | aguardando/notificado/atendido/cancelado |
| `data_entrada` | TIMESTAMP | Quando entrou na fila |
| `data_notificacao` | TIMESTAMP | Quando foi notificado |

---

## Relacionamentos

```
usuarios 1:N emprestimos (um usuário pode ter vários empréstimos)
usuarios 1:N fila_espera (um usuário pode estar em várias filas)
livros 1:N exemplares (um livro pode ter várias cópias)
livros 1:N emprestimos (um livro pode ter vários empréstimos)
livros N:1 categorias (vários livros podem ter a mesma categoria)
exemplares 1:N emprestimos (um exemplar pode ter vários empréstimos no histórico)

```
