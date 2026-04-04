/**
 * BIBLIOO - AppContext com API (MySQL)
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Livro, Usuario, Emprestimo, FilaEspera, Tela, Categoria } from '@/types';
import axios from 'axios';
import { toast } from 'sonner';

// CONFIGURAÇÃO DA API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('biblioo_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratamento de erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('biblioo_token');
      window.location.href = '/'; // Redireciona para login
    }
    return Promise.reject(error);
  }
);

interface AppContextType {
  // Navegação
  telaAtual: Tela;
  setTelaAtual: (tela: Tela) => void;
  livroSelecionado: Livro | null;
  setLivroSelecionado: (livro: Livro | null) => void;
  
  // Autenticação
  usuario: Usuario | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
  
  // Catálogo
  livros: Livro[];
  carregandoLivros: boolean;
  categoriaAtiva: Categoria;
  setCategoriaAtiva: (categoria: Categoria) => void;
  termoBusca: string;
  setTermoBusca: (termo: string) => void;
  buscarLivros: () => Promise<void>;
  
  // Empréstimos
  emprestimosAtivos: Emprestimo[];
  filaEspera: FilaEspera[];
  historicoEmprestimos: Emprestimo[];
  carregandoEmprestimos: boolean;
  solicitarEmprestimo: (livro: Livro) => Promise<boolean>;
  entrarFilaEspera: (livro: Livro) => Promise<void>;
  cancelarFilaEspera: (filaId: string) => Promise<void>;
  devolverLivro: (emprestimoId: string) => Promise<void>;
  carregarEmprestimos: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Navegação
  const [telaAtual, setTelaAtual] = useState<Tela>('login');
  const [livroSelecionado, setLivroSelecionado] = useState<Livro | null>(null);
  
  // Autenticação
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Catálogo
  const [livros, setLivros] = useState<Livro[]>([]);
  const [carregandoLivros, setCarregandoLivros] = useState(false);
  const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria>('Todos');
  const [termoBusca, setTermoBusca] = useState('');
  
  // Empréstimos
  const [emprestimosAtivos, setEmprestimosAtivos] = useState<Emprestimo[]>([]);
  const [filaEspera, setFilaEspera] = useState<FilaEspera[]>([]);
  const [historicoEmprestimos, setHistoricoEmprestimos] = useState<Emprestimo[]>([]);
  const [carregandoEmprestimos, setCarregandoEmprestimos] = useState(false);

  // ============================================
  // FUNÇÕES DE API
  // ============================================

  // Buscar livros da API
  const buscarLivros = useCallback(async () => {
    setCarregandoLivros(true);
    try {
      const params = new URLSearchParams();
      if (categoriaAtiva !== 'Todos') params.append('categoria', categoriaAtiva);
      if (termoBusca) params.append('busca', termoBusca);
      
      const response = await api.get(`/livros?${params}`);
      
      // Mapear resposta da API para o formato do frontend
      const livrosMapeados: Livro[] = response.data.map((l: any) => ({
        id: String(l.id),
        titulo: l.titulo,
        autor: l.autor,
        ano: l.ano,
        paginas: l.paginas,
        categoria: l.categoria as Categoria,
        subcategoria: l.subcategoria,
        isbn: l.isbn,
        idioma: l.idioma,
        sinopse: l.sinopse,
        disponivel: Boolean(l.disponivel),
        totalExemplares: l.total_exemplares,
        exemplaresDisponiveis: l.exemplares_disponiveis,
        capa: l.capa_url
      }));
      
      setLivros(livrosMapeados);
    } catch (error: any) {
      toast.error('Erro ao carregar livros');
      console.error('Erro ao buscar livros:', error);
    } finally {
      setCarregandoLivros(false);
    }
  }, [categoriaAtiva, termoBusca]);

  // Carregar empréstimos do usuário
  const carregarEmprestimos = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setCarregandoEmprestimos(true);
    try {
      const [ativosRes, filaRes, historicoRes] = await Promise.all([
        api.get('/emprestimos/ativos'),
        api.get('/fila-espera'),
        api.get('/emprestimos/historico')
      ]);
      
      // Mapear empréstimos ativos
      const ativosMapeados: Emprestimo[] = ativosRes.data.map((e: any) => ({
        id: String(e.id),
        livroId: String(e.livro_id),
        livro: {
          id: String(e.livro_id),
          titulo: e.livro_titulo,
          autor: e.livro_autor,
          ano: 0,
          paginas: 0,
          categoria: 'Todos' as Categoria,
          subcategoria: '',
          isbn: '',
          idioma: '',
          sinopse: '',
          disponivel: false,
          totalExemplares: 0,
          exemplaresDisponiveis: 0,
          capa: e.livro_capa
        },
        dataEmprestimo: new Date(e.data_emprestimo),
        dataDevolucaoPrevista: new Date(e.data_devolucao_prevista),
        status: e.status
      }));
      
      // Mapear fila de espera
      const filaMapeada: FilaEspera[] = filaRes.data.map((f: any) => ({
        id: String(f.id),
        livroId: String(f.livro_id),
        livro: {
          id: String(f.livro_id),
          titulo: f.livro_titulo,
          autor: f.livro_autor,
          ano: 0,
          paginas: 0,
          categoria: 'Todos' as Categoria,
          subcategoria: '',
          isbn: '',
          idioma: '',
          sinopse: '',
          disponivel: false,
          totalExemplares: 0,
          exemplaresDisponiveis: 0,
          capa: f.livro_capa
        },
        posicao: f.posicao_real || 1,
        dataEntrada: new Date(f.data_entrada),
        previsaoDisponibilidade: f.data_limite_resposta ? new Date(f.data_limite_resposta) : undefined
      }));
      
      // Mapear histórico
      const historicoMapeado: Emprestimo[] = historicoRes.data.map((e: any) => ({
        id: String(e.id),
        livroId: String(e.livro_id),
        livro: {
          id: String(e.livro_id),
          titulo: e.livro_titulo,
          autor: e.livro_autor,
          ano: 0,
          paginas: 0,
          categoria: 'Todos' as Categoria,
          subcategoria: '',
          isbn: '',
          idioma: '',
          sinopse: '',
          disponivel: false,
          totalExemplares: 0,
          exemplaresDisponiveis: 0,
          capa: e.livro_capa
        },
        dataEmprestimo: new Date(e.data_emprestimo),
        dataDevolucaoPrevista: new Date(e.data_devolucao_prevista),
        dataDevolucaoReal: e.data_devolucao_real ? new Date(e.data_devolucao_real) : undefined,
        status: 'devolvido'
      }));
      
      setEmprestimosAtivos(ativosMapeados);
      setFilaEspera(filaMapeada);
      setHistoricoEmprestimos(historicoMapeado);
    } catch (error: any) {
      toast.error('Erro ao carregar empréstimos');
      console.error('Erro:', error);
    } finally {
      setCarregandoEmprestimos(false);
    }
  }, [isAuthenticated]);

  // ============================================
  // AUTENTICAÇÃO
  // ============================================

  const login = useCallback(async (email: string, senha: string): Promise<boolean> => {
    try {
      const response = await api.post('/login', { email, senha });
      const { token, usuario: userData } = response.data;
      
      localStorage.setItem('biblioo_token', token);
      
      const usuarioMapeado: Usuario = {
        id: String(userData.id),
        nome: userData.nome,
        email: userData.email,
        matricula: userData.matricula
      };
      
      setUsuario(usuarioMapeado);
      setIsAuthenticated(true);
      setTelaAtual('catalogo');
      
      // Carregar dados iniciais
      await Promise.all([buscarLivros(), carregarEmprestimos()]);
      
      toast.success(`Bem-vindo, ${userData.nome}!`);
      return true;
    } catch (error: any) {
      const mensagem = error.response?.data?.erro || 'Erro ao fazer login';
      toast.error(mensagem);
      return false;
    }
  }, [buscarLivros, carregarEmprestimos]);

  const logout = useCallback(() => {
    localStorage.removeItem('biblioo_token');
    setUsuario(null);
    setIsAuthenticated(false);
    setTelaAtual('login');
    setEmprestimosAtivos([]);
    setFilaEspera([]);
    setHistoricoEmprestimos([]);
    setLivros([]);
    toast.info('Você saiu do sistema');
  }, []);

  // ============================================
  // EMPRÉSTIMOS
  // ============================================

  const solicitarEmprestimo = useCallback(async (livro: Livro): Promise<boolean> => {
    try {
      await api.post('/emprestimos', { livroId: parseInt(livro.id) });
      
      toast.success('Empréstimo realizado com sucesso!');
      await Promise.all([carregarEmprestimos(), buscarLivros()]);
      return true;
    } catch (error: any) {
      const mensagem = error.response?.data?.erro || 'Erro ao solicitar empréstimo';
      
      if (mensagem === 'Livro indisponível') {
        return false;
      }
      
      toast.error(mensagem);
      return false;
    }
  }, [carregarEmprestimos, buscarLivros]);

  const entrarFilaEspera = useCallback(async (livro: Livro) => {
    try {
      await api.post('/fila-espera', { livroId: parseInt(livro.id) });
      toast.success('Você entrou na fila de espera!');
      await carregarEmprestimos();
    } catch (error: any) {
      const mensagem = error.response?.data?.erro || 'Erro ao entrar na fila';
      toast.error(mensagem);
    }
  }, [carregarEmprestimos]);

  const cancelarFilaEspera = useCallback(async (filaId: string) => {
    try {
      await api.delete(`/fila-espera/${filaId}`);
      toast.success('Você saiu da fila de espera');
      await carregarEmprestimos();
    } catch (error: any) {
      toast.error('Erro ao cancelar fila');
    }
  }, [carregarEmprestimos]);

  const devolverLivro = useCallback(async (emprestimoId: string) => {
    try {
      await api.put(`/emprestimos/${emprestimoId}/devolver`);
      toast.success('Livro devolvido com sucesso!');
      await Promise.all([carregarEmprestimos(), buscarLivros()]);
    } catch (error: any) {
      toast.error('Erro ao devolver livro');
    }
  }, [carregarEmprestimos, buscarLivros]);

  // ============================================
  // EFEITOS
  // ============================================

  // Verificar token ao iniciar
  useEffect(() => {
    const verificarToken = async () => {
      const token = localStorage.getItem('biblioo_token');
      if (token) {
        try {
          const response = await api.get('/perfil');
          const userData = response.data;
          
          setUsuario({
            id: String(userData.id),
            nome: userData.nome,
            email: userData.email,
            matricula: userData.matricula
          });
          setIsAuthenticated(true);
          
          // Carregar dados
          await Promise.all([buscarLivros(), carregarEmprestimos()]);
        } catch (error) {
          localStorage.removeItem('biblioo_token');
        }
      }
    };
    
    verificarToken();
  }, []);

  // Buscar livros quando filtros mudam
  useEffect(() => {
    if (isAuthenticated) {
      buscarLivros();
    }
  }, [categoriaAtiva, termoBusca, isAuthenticated, buscarLivros]);

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
      carregandoLivros,
      categoriaAtiva,
      setCategoriaAtiva,
      termoBusca,
      setTermoBusca,
      buscarLivros,
      emprestimosAtivos,
      filaEspera,
      historicoEmprestimos,
      carregandoEmprestimos,
      solicitarEmprestimo,
      entrarFilaEspera,
      cancelarFilaEspera,
      devolverLivro,
      carregarEmprestimos
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
