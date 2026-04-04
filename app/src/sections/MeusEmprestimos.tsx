import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Calendar, 
  AlertCircle,
  BookMarked,
  RotateCcw,
  X
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState } from 'react';

export function MeusEmprestimos() {
  const { 
    usuario, 
    emprestimosAtivos, 
    filaEspera, 
    historicoEmprestimos,
    devolverLivro,
    cancelarFilaEspera,
    setTelaAtual,
    setLivroSelecionado
  } = useApp();

  const [emprestimoParaDevolver, setEmprestimoParaDevolver] = useState<string | null>(null);
  const [filaParaCancelar, setFilaParaCancelar] = useState<string | null>(null);

  const handleVerLivro = (livro: typeof emprestimosAtivos[0]['livro']) => {
    setLivroSelecionado(livro);
    setTelaAtual('detalhes-livro');
  };

  const handleDevolver = () => {
    if (emprestimoParaDevolver) {
      devolverLivro(emprestimoParaDevolver);
      setEmprestimoParaDevolver(null);
    }
  };

  const handleCancelarFila = () => {
    if (filaParaCancelar) {
      cancelarFilaEspera(filaParaCancelar);
      setFilaParaCancelar(null);
    }
  };

  const formatarData = (data: Date) => {
    return new Date(data).toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Meus Empréstimos</h1>
          <p className="text-slate-500">
            Acompanhe seus empréstimos ativos, fila de espera e histórico
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1">Empréstimos ativos</p>
                <p className="text-3xl font-bold text-slate-800">{emprestimosAtivos.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1">Na fila de espera</p>
                <p className="text-3xl font-bold text-slate-800">{filaEspera.length}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm mb-1">Devolvidos</p>
                <p className="text-3xl font-bold text-slate-800">{historicoEmprestimos.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-200 rounded-full flex items-center justify-center">
              <span className="text-emerald-800 font-semibold">
                {usuario?.nome.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-semibold text-emerald-900">{usuario?.nome}</p>
              <p className="text-emerald-700 text-sm">{usuario?.email}</p>
            </div>
          </div>
        </div>

        {/* Active Loans */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-emerald-600" />
            Empréstimos Ativos
          </h2>
          {emprestimosAtivos.length > 0 ? (
            <div className="space-y-4">
              {emprestimosAtivos.map((emprestimo) => (
                <div 
                  key={emprestimo.id} 
                  className="bg-white rounded-xl border border-slate-200 p-4 md:p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      {emprestimo.livro.capa ? (
                        <img 
                          src={emprestimo.livro.capa} 
                          alt={emprestimo.livro.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 text-lg">{emprestimo.livro.titulo}</h3>
                      <p className="text-slate-500">{emprestimo.livro.autor}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-amber-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            Devolver até {formatarData(emprestimo.dataDevolucaoPrevista)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerLivro(emprestimo.livro)}
                      >
                        Ver livro
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => setEmprestimoParaDevolver(emprestimo.id)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Devolver
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Você não tem empréstimos ativos</p>
              <Button 
                variant="link" 
                onClick={() => setTelaAtual('catalogo')}
                className="text-emerald-600"
              >
                Explorar catálogo
              </Button>
            </div>
          )}
        </div>

        {/* Waitlist */}
        {filaEspera.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              Na Fila de Espera
            </h2>
            <div className="space-y-4">
              {filaEspera.map((fila) => (
                <div 
                  key={fila.id} 
                  className="bg-white rounded-xl border border-slate-200 p-4 md:p-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      {fila.livro.capa ? (
                        <img 
                          src={fila.livro.capa} 
                          alt={fila.livro.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800 text-lg">{fila.livro.titulo}</h3>
                      <p className="text-slate-500">{fila.livro.autor}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                          Posição {fila.posicao} na fila
                        </Badge>
                        {fila.previsaoDisponibilidade && (
                          <span className="text-sm text-slate-500">
                            Previsão: {formatarData(fila.previsaoDisponibilidade)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleVerLivro(fila.livro)}
                      >
                        Ver livro
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilaParaCancelar(fila.id)}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Sair da fila
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        <div>
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-blue-600" />
            Histórico de Devoluções
          </h2>
          {historicoEmprestimos.length > 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="divide-y divide-slate-100">
                {historicoEmprestimos.map((emprestimo) => (
                  <div 
                    key={emprestimo.id} 
                    className="p-4 md:p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-12 h-16 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                      {emprestimo.livro.capa ? (
                        <img 
                          src={emprestimo.livro.capa} 
                          alt={emprestimo.livro.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-slate-800">{emprestimo.livro.titulo}</h4>
                      <p className="text-sm text-slate-500">{emprestimo.livro.autor}</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        Devolvido em {formatarData(emprestimo.dataDevolucaoReal!)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVerLivro(emprestimo.livro)}
                    >
                      Ver
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Nenhum livro devolvido ainda</p>
            </div>
          )}
        </div>
      </div>

      {/* Return Confirmation Dialog */}
      <Dialog open={!!emprestimoParaDevolver} onOpenChange={() => setEmprestimoParaDevolver(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Devolução</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja devolver este livro?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setEmprestimoParaDevolver(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleDevolver}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Confirmar Devolução
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Waitlist Dialog */}
      <Dialog open={!!filaParaCancelar} onOpenChange={() => setFilaParaCancelar(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sair da Fila de Espera</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja sair da fila de espera deste livro?
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setFilaParaCancelar(null)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCancelarFila}
              variant="destructive"
              className="flex-1"
            >
              Sair da Fila
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
