export type Categoria = 'Todos' | 'Tecnologia' | 'Ciências' | 'Literatura' | 'Direito' | 'Comportamento';

export interface Livro {
  id: string;
  titulo: string;
  autor: string;
  ano: number;
  paginas: number;
  categoria: Categoria;
  subcategoria: string;
  isbn: string;
  idioma: string;
  sinopse: string;
  disponivel: boolean;
  totalExemplares: number;
  exemplaresDisponiveis: number;
  capa?: string;
}

export interface Emprestimo {
  id: string;
  livroId: string;
  livro: Livro;
  dataEmprestimo: Date;
  dataDevolucaoPrevista: Date;
  dataDevolucaoReal?: Date;
  status: 'ativo' | 'devolvido' | 'atrasado';
}

export interface FilaEspera {
  id: string;
  livroId: string;
  livro: Livro;
  posicao: number;
  dataEntrada: Date;
  previsaoDisponibilidade?: Date;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  matricula?: string;
}

export type Tela = 'login' | 'catalogo' | 'detalhes-livro' | 'livro-indisponivel' | 'meus-emprestimos';
