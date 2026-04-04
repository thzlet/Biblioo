import { AppProvider, useApp } from '@/context/AppContext';
import { Login } from '@/sections/Login';
import { Header } from '@/sections/Header';
import { Catalogo } from '@/sections/Catalogo';
import { DetalhesLivro } from '@/sections/DetalhesLivro';
import { LivroIndisponivel } from '@/sections/LivroIndisponivel';
import { MeusEmprestimos } from '@/sections/MeusEmprestimos';
import { Toaster } from '@/components/ui/sonner';

function AppContent() {
  const { telaAtual, isAuthenticated } = useApp();

  // renderiza a tela atual
  const renderTela = () => {
    if (!isAuthenticated) {
      return <Login />;
    }

    switch (telaAtual) {
      case 'catalogo':
        return <Catalogo />;
      case 'detalhes-livro':
        return <DetalhesLivro />;
      case 'livro-indisponivel':
        return <LivroIndisponivel />;
      case 'meus-emprestimos':
        return <MeusEmprestimos />;
      default:
        return <Catalogo />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {isAuthenticated && <Header />}
      {renderTela()}
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
