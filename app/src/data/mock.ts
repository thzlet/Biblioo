import type { Livro, Usuario, Emprestimo, FilaEspera } from '@/types';

export const livros: Livro[] = [
  {
    id: '1',
    titulo: 'Clean Code',
    autor: 'Robert C. Martin',
    ano: 2008,
    paginas: 431,
    categoria: 'Tecnologia',
    subcategoria: 'Programação',
    isbn: '978-0-13-235088-4',
    idioma: 'Português',
    sinopse: 'Um guia essencial sobre como escrever código limpo, legível e de fácil manutenção. Aborda boas práticas, padrões e princípios que todo desenvolvedor deve conhecer. Leitura obrigatória na área.',
    disponivel: true,
    totalExemplares: 1,
    exemplaresDisponiveis: 1,
    capa: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=300&h=450&fit=crop'
  },
  {
    id: '2',
    titulo: 'Design de Sistemas',
    autor: 'Alex Xu',
    ano: 2020,
    paginas: 560,
    categoria: 'Tecnologia',
    subcategoria: 'Arquitetura de Software',
    isbn: '978-0-13-235089-1',
    idioma: 'Português',
    sinopse: 'Um guia completo sobre design de sistemas distribuídos, escaláveis e resilientes. Aprenda a projetar sistemas que suportam milhões de usuários.',
    disponivel: true,
    totalExemplares: 3,
    exemplaresDisponiveis: 3,
    capa: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=450&fit=crop'
  },
  {
    id: '3',
    titulo: 'O Poder do Hábito',
    autor: 'Charles Duhigg',
    ano: 2012,
    paginas: 408,
    categoria: 'Comportamento',
    subcategoria: 'Psicologia',
    isbn: '978-0-13-235090-7',
    idioma: 'Português',
    sinopse: 'Por que fazemos o que fazemos na vida e nos negócios. Um livro fascinante sobre a ciência dos hábitos e como transformá-los.',
    disponivel: true,
    totalExemplares: 5,
    exemplaresDisponiveis: 5,
    capa: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=450&fit=crop'
  },
  {
    id: '4',
    titulo: 'O Algoritmo da Vida',
    autor: 'Brian Christian',
    ano: 2016,
    paginas: 368,
    categoria: 'Ciências',
    subcategoria: 'Ciência da Computação',
    isbn: '978-0-13-235091-4',
    idioma: 'Português',
    sinopse: 'Como a ciência da computação pode ajudar você a tomar decisões melhores. Uma jornada fascinante pelo mundo dos algoritmos.',
    disponivel: false,
    totalExemplares: 2,
    exemplaresDisponiveis: 0,
    capa: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=450&fit=crop'
  },
  {
    id: '5',
    titulo: 'Estruturas de Dados',
    autor: 'Thomas Cormen',
    ano: 2009,
    paginas: 1292,
    categoria: 'Tecnologia',
    subcategoria: 'Algoritmos',
    isbn: '978-0-13-235092-1',
    idioma: 'Português',
    sinopse: 'O livro definitivo sobre algoritmos e estruturas de dados. Essencial para qualquer estudante ou profissional de computação.',
    disponivel: false,
    totalExemplares: 4,
    exemplaresDisponiveis: 0,
    capa: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=300&h=450&fit=crop'
  },
  {
    id: '6',
    titulo: 'Arquitetura Limpa',
    autor: 'Robert C. Martin',
    ano: 2017,
    paginas: 432,
    categoria: 'Tecnologia',
    subcategoria: 'Arquitetura de Software',
    isbn: '978-0-13-235093-8',
    idioma: 'Português',
    sinopse: 'Um guia prático sobre como estruturar aplicações robustas, escaláveis e de fácil manutenção. Aprenda os princípios da arquitetura limpa.',
    disponivel: true,
    totalExemplares: 3,
    exemplaresDisponiveis: 3,
    capa: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300&h=450&fit=crop'
  },
  {
    id: '7',
    titulo: 'Pensando Rápido e Devagar',
    autor: 'Daniel Kahneman',
    ano: 2011,
    paginas: 499,
    categoria: 'Comportamento',
    subcategoria: 'Psicologia',
    isbn: '978-0-13-235094-5',
    idioma: 'Português',
    sinopse: 'Uma jornada pelos dois sistemas que dirigem o nosso pensamento: o rápido, emocional e intuitivo, e o lento, lógico e deliberativo.',
    disponivel: true,
    totalExemplares: 6,
    exemplaresDisponiveis: 6,
    capa: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=300&h=450&fit=crop'
  },
  {
    id: '8',
    titulo: 'Dom Casmurro',
    autor: 'Machado de Assis',
    ano: 1899,
    paginas: 256,
    categoria: 'Literatura',
    subcategoria: 'Romance Brasileiro',
    isbn: '978-0-13-235095-2',
    idioma: 'Português',
    sinopse: 'A história de Bentinho e Capitu, uma das mais fascinantes narrativas da literatura brasileira. Será que Capitu traiu Bentinho?',
    disponivel: true,
    totalExemplares: 8,
    exemplaresDisponiveis: 8,
    capa: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=450&fit=crop'
  },
  {
    id: '9',
    titulo: 'Direito Constitucional',
    autor: 'José Afonso da Silva',
    ano: 2018,
    paginas: 892,
    categoria: 'Direito',
    subcategoria: 'Constitucional',
    isbn: '978-0-13-235096-9',
    idioma: 'Português',
    sinopse: 'Obra fundamental para o estudo do direito constitucional brasileiro. Análise completa da Constituição de 1988.',
    disponivel: true,
    totalExemplares: 4,
    exemplaresDisponiveis: 4,
    capa: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=450&fit=crop'
  },
  {
    id: '10',
    titulo: 'A Origem das Espécies',
    autor: 'Charles Darwin',
    ano: 1859,
    paginas: 502,
    categoria: 'Ciências',
    subcategoria: 'Biologia',
    isbn: '978-0-13-235097-6',
    idioma: 'Português',
    sinopse: 'A obra que revolucionou a biologia e nossa compreensão sobre a vida na Terra. A teoria da evolução por seleção natural.',
    disponivel: true,
    totalExemplares: 3,
    exemplaresDisponiveis: 3,
    capa: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=450&fit=crop'
  }
];

export const usuarioMock: Usuario = {
  id: '1',
  nome: 'João Silva',
  email: 'joao@universidade.br',
  matricula: '2021001234'
};

export const emprestimosAtivosMock: Emprestimo[] = [
  {
    id: '1',
    livroId: '2',
    livro: livros[1],
    dataEmprestimo: new Date('2025-04-01'),
    dataDevolucaoPrevista: new Date('2025-04-22'),
    status: 'ativo'
  }
];

export const filaEsperaMock: FilaEspera[] = [
  {
    id: '1',
    livroId: '1',
    livro: livros[0],
    posicao: 1,
    dataEntrada: new Date('2025-04-01'),
    previsaoDisponibilidade: new Date('2025-04-15')
  }
];

export const historicoEmprestimosMock: Emprestimo[] = [
  {
    id: '2',
    livroId: '4',
    livro: livros[3],
    dataEmprestimo: new Date('2025-02-15'),
    dataDevolucaoPrevista: new Date('2025-03-01'),
    dataDevolucaoReal: new Date('2025-03-01'),
    status: 'devolvido'
  },
  {
    id: '3',
    livroId: '5',
    livro: livros[4],
    dataEmprestimo: new Date('2025-01-27'),
    dataDevolucaoPrevista: new Date('2025-02-10'),
    dataDevolucaoReal: new Date('2025-02-10'),
    status: 'devolvido'
  },
  {
    id: '4',
    livroId: '3',
    livro: livros[2],
    dataEmprestimo: new Date('2025-01-06'),
    dataDevolucaoPrevista: new Date('2025-01-20'),
    dataDevolucaoReal: new Date('2025-01-20'),
    status: 'devolvido'
  },
  {
    id: '5',
    livroId: '7',
    livro: livros[6],
    dataEmprestimo: new Date('2024-12-22'),
    dataDevolucaoPrevista: new Date('2025-01-05'),
    dataDevolucaoReal: new Date('2025-01-05'),
    status: 'devolvido'
  }
];

export const categorias = ['Todos', 'Tecnologia', 'Ciências', 'Literatura', 'Direito', 'Comportamento'] as const;
