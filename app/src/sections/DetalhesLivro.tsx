import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Clock, 
  Hash, 
  Globe, 
  Layers,
  Heart,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export function DetalhesLivro() {
  const { 
    livroSelecionado, 
    setTelaAtual, 
    solicitarEmprestimo,
    entrarFilaEspera,
    emprestimosAtivos,
    filaEspera
  } = useApp();

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!livroSelecionado) return null;

  const livro = livroSelecionado;
  const jaEmprestado = emprestimosAtivos.some(e => e.livroId === livro.id);
  const naFila = filaEspera.some(f => f.livroId === livro.id);

  const handleSolicitarEmprestimo = async () => {
    setIsProcessing(true);
    // Simula processamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const sucesso = solicitarEmprestimo(livro);
    setIsProcessing(false);
    setShowConfirmDialog(false);
    
    if (sucesso) {
      setShowSuccessDialog(true);
    } else {
      // Livro ficou indisponível
      setTelaAtual('livro-indisponivel');
    }
  };

  const handleEntrarFila = () => {
    entrarFilaEspera(livro);
    setTelaAtual('meus-emprestimos');
  };

  const dataDevolucao = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => setTelaAtual('catalogo')}
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Voltar ao catálogo</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Book Cover */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="aspect-[3/4] relative">
                {livro.capa ? (
                  <img
                    src={livro.capa}
                    alt={livro.titulo}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <BookOpen className="w-24 h-24 text-slate-300" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Book Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 shadow-sm">
              {/* Title & Author */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                    {livro.titulo}
                  </h1>
                  <Badge 
                    variant={livro.disponivel ? 'default' : 'secondary'}
                    className={`shrink-0 ${
                      livro.disponivel 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {livro.disponivel ? 'Disponível' : 'Indisponível'}
                  </Badge>
                </div>
                <p className="text-lg text-slate-600">
                  {livro.autor} <span className="text-slate-400">·</span> {livro.ano} <span className="text-slate-400">·</span> {livro.paginas} págs.
                </p>
                <p className="text-emerald-700 font-medium mt-2">
                  {livro.exemplaresDisponiveis} exemplar{livro.exemplaresDisponiveis !== 1 ? 'es' : ''} disponível
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mb-8">
                {livro.disponivel && !jaEmprestado && !naFila ? (
                  <Button
                    size="lg"
                    onClick={() => setShowConfirmDialog(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
                  >
                    <BookOpen className="w-5 h-5 mr-2" />
                    Solicitar Empréstimo
                  </Button>
                ) : jaEmprestado ? (
                  <Button
                    size="lg"
                    disabled
                    variant="outline"
                    className="border-emerald-200 text-emerald-700"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Você já possui este livro
                  </Button>
                ) : naFila ? (
                  <Button
                    size="lg"
                    disabled
                    variant="outline"
                    className="border-amber-200 text-amber-700"
                  >
                    <Clock className="w-5 h-5 mr-2" />
                    Você está na fila de espera
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleEntrarFila}
                    variant="outline"
                    className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                  >
                    <Clock className="w-5 h-5 mr-2" />
                    Entrar na fila de espera
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="border-slate-200"
                >
                  <Heart className="w-5 h-5 mr-2" />
                  Adicionar à lista de desejos
                </Button>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Layers className="w-4 h-4" />
                    <span className="text-sm">Categoria</span>
                  </div>
                  <p className="font-medium text-slate-800">{livro.categoria}</p>
                  <p className="text-sm text-slate-500">{livro.subcategoria}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Prazo de devolução</span>
                  </div>
                  <p className="font-medium text-slate-800">14 dias corridos</p>
                  <p className="text-sm text-slate-500">
                    Até {dataDevolucao.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Hash className="w-4 h-4" />
                    <span className="text-sm">ISBN</span>
                  </div>
                  <p className="font-medium text-slate-800">{livro.isbn}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Idioma</span>
                  </div>
                  <p className="font-medium text-slate-800">{livro.idioma}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">Exemplares disponíveis</span>
                  </div>
                  <p className="font-medium text-slate-800">
                    {livro.exemplaresDisponiveis} / {livro.totalExemplares}
                  </p>
                </div>
              </div>

              {/* Synopsis */}
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-3">Sinopse</h2>
                <p className="text-slate-600 leading-relaxed">
                  {livro.sinopse}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirmar Empréstimo</DialogTitle>
            <DialogDescription>
              Você está solicitando o empréstimo do livro:
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="w-12 h-16 bg-slate-200 rounded overflow-hidden flex-shrink-0">
                {livro.capa && (
                  <img src={livro.capa} alt={livro.titulo} className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <p className="font-semibold text-slate-800">{livro.titulo}</p>
                <p className="text-sm text-slate-500">{livro.autor}</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
              <div className="flex items-center gap-2 text-emerald-700 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Data de devolução prevista:</span>
              </div>
              <p className="text-emerald-800 text-lg font-semibold">
                {dataDevolucao.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
              <p className="text-emerald-600 text-sm mt-1">Prazo: 14 dias corridos</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSolicitarEmprestimo}
              disabled={isProcessing}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {isProcessing ? 'Processando...' : 'Confirmar Empréstimo'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <DialogTitle className="text-xl text-center">Empréstimo Realizado!</DialogTitle>
            <DialogDescription className="text-center">
              O livro <strong>{livro.titulo}</strong> foi emprestado com sucesso.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="p-4 bg-slate-50 rounded-lg text-center">
              <p className="text-slate-600 mb-2">Data de devolução:</p>
              <p className="text-xl font-bold text-slate-800">
                {dataDevolucao.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowSuccessDialog(false);
                setTelaAtual('catalogo');
              }}
              className="flex-1"
            >
              Voltar ao Catálogo
            </Button>
            <Button
              onClick={() => {
                setShowSuccessDialog(false);
                setTelaAtual('meus-emprestimos');
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              Ver Meus Empréstimos
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
