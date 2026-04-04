# React + TypeScript + Vite

Esse modelo fornece uma configuração mínima para fazer o React funcionar no Vite com HMR e algumas regras do ESLint.

Tem dois plugins oficiais estão disponíveis:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (ou [oxc](https://oxc.rs) quando usado em [rolldown-vite](https://vite.dev/guide/rolldown)) para atualização rápida
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) usa [SWC](https://swc.rs/) pra atualização

## React Compiler

O compilador React não está habilitado neste modelo devido ao seu impacto no desempenho de desenvolvimento e compilação. Pra add, consultar [esta documentação](https://react.dev/learn/react-compiler/installation).