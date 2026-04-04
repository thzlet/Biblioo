import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Livro, Usuario, Emprestimo, FilaEspera, Tela, Categoria } from '@/types';
import { 
  livros, 
  usuarioMock, 
  emprestimosAtivosMock, 
  filaEsperaMock, 
  historicoEmprestimosMock 
} from '@/data/mock';

interface AppContextType {
  // navegação
  telaAtual: Tela;
  setTelaAtual: (tela: Tela) => void;
  livroSelecionado: Livro | null;
  setLivroSelecionado: (livro: Livro | null) => void;
  
  // autenticação
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => boolean;
  logout: () => void;
  
  // catálogo
  livros: Livro[];
  categoriaAtiva: Categoria;
  setCategoriaAtiva: (categoria: Categoria) => void;
  termoBusca: string;
  setTermoBusca: (termo: string) => void;
  livrosFiltrados: Livro[];
  
  // empréstimos
  emprestimosAtivos: Emprestimo[];
  filaEspera: FilaEspera[];
  historicoEmprestimos: Emprestimo[];
  solicitarEmprestimo: (livro: Livro) => boolean;
  entrarFilaEspera: (livro: Livro) => void;
  cancelarFilaEspera: (filaId: string) => void;
  devolverLivro: (emprestimoId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // navegação
  const [telaAtual, setTelaAtual] = useState<Tela>('login');
  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);
  
  // autenticação
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // catálogo
  const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria>('Todos');
  const [termoBusca, setTermoBusca] = useState('');
  
  // empréstimos
  const [emprestimosAtivos, setEmprestimosAtivos] = useState<Emprestimo[]>(emprestimosAtivosMock);
  const [filaEspera, setFilaEspera] = useState<FilaEspera[]>(filaEsperaMock);
  const [historicoEmprestimos, setHistoricoEmprestimos] = useState<Emprestimo[]>(historicoEmprestimosMock);

  // filtrar livros
  const livrosFiltrados = livros.filter(livro => {
    const matchCategoria = categoriaAtiva === 'Todos' || livro.categoria === categoriaAtiva;
    const termo = termoBusca.toLowerCase();
    const matchBusca = !termoBusca || 
      livro.titulo.toLowerCase().includes(termo) ||
      livro.autor.toLowerCase().includes(termo) ||
      livro.isbn.includes(termo);
    return matchCategoria && matchBusca;
  });

  // ogin
  const login = useCallback((email: string, senha: string) => {
    if (email && senha) {
      setUsuario(usuarioMock);
      setIsAuthenticated(true);
      setTelaAtual('catalogo');
      return true;
    }
    return false;
  }, []);

  // logout
  const logout = useCallback(() => {
    setUsuario(null);
    setIsAuthenticated(false);
    setTelaAtual('login');
  }, []);

  // solicitar empréstimo
  const solicitarEmprestimo = useCallback((livro: Livro): boolean => {
    if (livro.exemplaresDisponiveis > 0) {
      const novoEmprestimo: Emprestimo = {
        id: Date.now().toString(),
        livroId: livro.id,
        livro: { ...livro, exemplaresDisponiveis: livro.exemplaresDisponiveis - 1 },
        dataEmprestimo: new Date(),
        dataDevolucaoPrevista: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'ativo'
      };
      setEmprestimosAtivos(prev => [...prev, novoEmprestimo]);
      
      // atualiza disponibilidade do livro
      const livroAtualizado = livros.find(l => l.id === livro.id);
      if (livroAtualizado) {
        livroAtualizado.exemplaresDisponiveis--;
        if (livroAtualizado.exemplaresDisponiveis === 0) {
          livroAtualizado.disponivel = false;
        }
      }
      return true;
    }
    return false;
  }, []);

  // entrar na fila de espera
  const entrarFilaEspera = useCallback((livro: Livro) => {
    const novaFila: FilaEspera = {
      id: Date.now().toString(),
      livroId: livro.id,
      livro,
      posicao: 1,
      dataEntrada: new Date(),
      previsaoDisponibilidade: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    };
    setFilaEspera(prev => [...prev, novaFila]);
  }, []);

  // cancelar fila de espera
  const cancelarFilaEspera = useCallback((filaId: string) => {
    setFilaEspera(prev => prev.filter(f => f.id !== filaId));
  }, []);

  // devolver livro
  const devolverLivro = useCallback((emprestimoId: string) => {
    const emprestimo = emprestimosAtivos.find(e => e.id === emprestimoId);
    if (emprestimo) {
      const emprestimoDevolvido: Emprestimo = {
        ...emprestimo,
        dataDevolucaoReal: new Date(),
        status: 'devolvido'
      };
      setHistoricoEmprestimos(prev => [emprestimoDevolvido, ...prev]);
      setEmprestimosAtivos(prev => prev.filter(e => e.id !== emprestimoId));
      
      // atualiza disponibilidade do livro
      const livroAtualizado = livros.find(l => l.id === emprestimo.livroId);
      if (livroAtualizado) {
        livroAtualizado.exemplaresDisponiveis++;
        livroAtualizado.disponivel = true;
      }
    }
  }, [emprestimosAtivos]);

  return (
    <AppContext.Provider value={{
      telaAtual,
      setTelaAtual,
      livroSelecionado,
      setLivroSelecionado,
      usuario,
      isAuthenticated,
      login,
      logout,
      livros,
      categoriaAtiva,
      setCategoriaAtiva,
      termoBusca,
      setTermoBusca,
      livrosFiltrados,
      emprestimosAtivos,
      filaEspera,
      historicoEmprestimos,
      solicitarEmprestimo,
      entrarFilaEspera,
      cancelarFilaEspera,
      devolverLivro
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}
