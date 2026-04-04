import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, BookOpen, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { categorias } from '@/data/mock';

export function Catalogo() {
  const { 
    livrosFiltrados, 
    categoriaAtiva, 
    setCategoriaAtiva, 
    termoBusca, 
    setTermoBusca,
    setLivroSelecionado,
    setTelaAtual
  } = useApp();

  const handleLivroClick = (livro: typeof livrosFiltrados[0]) => {
    setLivroSelecionado(livro);
    setTelaAtual('detalhes-livro');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-3">
              Catálogo de Livros
            </h1>
            <p className="text-slate-500 text-lg">
              Encontre e empreste livros do acervo universitário
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8">
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Buscar por título, autor ou ISBN..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="pl-12 pr-4 h-14 text-base border-slate-200 rounded-xl focus:border-emerald-500 focus:ring-emerald-500 shadow-sm"
              />
              <Button 
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-700"
              >
                Buscar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categorias.map((categoria) => (
            <button
              key={categoria}
              onClick={() => setCategoriaAtiva(categoria as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                categoriaAtiva === categoria
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
              }`}
            >
              {categoria}
            </button>
          ))}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-slate-600">
            <span className="font-semibold text-slate-800">{livrosFiltrados.length}</span> livros encontrados
          </p>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {livrosFiltrados.map((livro) => (
            <div
              key={livro.id}
              onClick={() => handleLivroClick(livro)}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer"
            >
              {/* Book Cover */}
              <div className="aspect-[3/4] relative overflow-hidden bg-slate-100">
                {livro.capa ? (
                  <img
                    src={livro.capa}
                    alt={livro.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen className="w-16 h-16 text-slate-300" />
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge 
                    variant={livro.disponivel ? 'default' : 'secondary'}
                    className={`${
                      livro.disponivel 
                        ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' 
                        : 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                    }`}
                  >
                    {livro.disponivel ? 'Disponível' : 'Indisponível'}
                  </Badge>
                </div>
              </div>

              {/* Book Info */}
              <div className="p-4">
                <h3 className="font-semibold text-slate-800 mb-1 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                  {livro.titulo}
                </h3>
                <p className="text-sm text-slate-500 mb-2">
                  {livro.autor}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{livro.categoria}</span>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {livrosFiltrados.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              Nenhum livro encontrado
            </h3>
            <p className="text-slate-500">
              Tente buscar com outros termos ou categorias
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
