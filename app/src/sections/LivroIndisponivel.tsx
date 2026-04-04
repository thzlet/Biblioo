import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft, Clock, BookOpen, Users, Calendar } from 'lucide-react';

export function LivroIndisponivel() {
  const { livroSelecionado, setTelaAtual, entrarFilaEspera } = useApp();

  if (!livroSelecionado) return null;

  const livro = livroSelecionado;
  const previsaoDevolucao = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

  const handleEntrarFila = () => {
    entrarFilaEspera(livro);
    setTelaAtual('meus-emprestimos');
  };

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
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Alert Banner */}
          <div className="bg-amber-50 border-b border-amber-100 p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-amber-800 mb-1">
                  Livro Indisponível
                </h1>
                <p className="text-amber-700">
                  Outro leitor acabou de pegar este exemplar
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 md:p-8">
            {/* Message */}
            <div className="mb-8">
              <p className="text-slate-600 mb-2">
                O livro foi reservado enquanto você confirmava o empréstimo.
              </p>
              <p className="text-slate-600">
                Infelizmente há apenas <strong>1 cópia</strong> no acervo.
              </p>
            </div>

            {/* Book Info */}
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl mb-8">
              <div className="w-16 h-20 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
                {livro.capa ? (
                  <img 
                    src={livro.capa} 
                    alt={livro.titulo} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8 text-slate-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-slate-800 text-lg">{livro.titulo}</h2>
                <p className="text-slate-500">{livro.autor}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Indisponível
                  </span>
                </div>
              </div>
            </div>

            {/* Return Date */}
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl mb-8">
              <Calendar className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm text-slate-500">Previsão de devolução:</p>
                <p className="font-semibold text-slate-800">
                  {previsaoDevolucao.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button
                size="lg"
                onClick={handleEntrarFila}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              >
                <Clock className="w-5 h-5 mr-2" />
                Entrar na fila de espera
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => setTelaAtual('catalogo')}
                className="flex-1 border-slate-200"
              >
                <BookOpen className="w-5 h-5 mr-2" />
                Ver outros livros
              </Button>
            </div>

            {/* Info Box */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
              <Users className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800 mb-1">
                  Controle de concorrência:
                </p>
                <p className="text-blue-700 text-sm">
                  O sistema garante que apenas um leitor consiga o empréstimo quando dois tentam ao mesmo tempo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
