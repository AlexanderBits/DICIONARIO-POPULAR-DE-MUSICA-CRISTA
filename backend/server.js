require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// -------------------------------------------------------------
// HELPER: Lógica de Regra de Negócio (Hook) para Título do Hino
// -------------------------------------------------------------
function formatarTituloHino(tituloOriginal) {
      // O padrão busca: "Hino da Harpa Cristã" + [espaço] + [número] + " - " + [Nome]
      const regex = /^Hino da Harpa Cristã (\d+) [–-] (.+)$/i;
      const match = tituloOriginal.match(regex);

      if (match) {
            const numero = match[1]; // Ex: "15"
            const nome = match[2];   // Ex: "Foi na Cruz"
            return `Hino ${numero} da Harpa Cristã ${nome}`;
      }
      return tituloOriginal; // Sem mudanças se não bater o regex
}

// Sanitiza campos antes de salvar no banco
// Evita erros de tipo (string vazia onde Prisma espera Int ou null)
function sanitizarDados(dados) {
      const out = {};
      for (const [k, v] of Object.entries(dados)) {
            if (v === '' || v === undefined) {
                  out[k] = null; // string vazia → null
            } else {
                  out[k] = v;
            }
      }
      // Campos que o banco espera como Int
      if (out.ano_lancamento !== null && out.ano_lancamento !== undefined) {
            out.ano_lancamento = parseInt(out.ano_lancamento) || null;
      }
      return out;
}

// =============================================================
// ENDPOINTS PÚBLICOS (CONSUMIDOS PELA FRONT PAGE)
// SÓ DEVEM RETORNAR ITENS COM STATUS 'Publicado'
// =============================================================

// Listar Verbetes (Paginado & Filtrado)
app.get('/api/v1/verbetes', async (req, res) => {
      try {
            const { letra_inicial, categoria_tipo, pagina = 1, limite = 20 } = req.query;

            // Constrói objeto de filtros para o banco de dados
            const whereClause = { status: 'Publicado' };
            if (letra_inicial) {
                  whereClause.titulo = { startsWith: letra_inicial };
            }
            if (categoria_tipo) {
                  whereClause.categoria_tipo = categoria_tipo;
            }

            const skip = (Number(pagina) - 1) * Number(limite);
            const take = Number(limite);

            const verbetes = await prisma.verbete.findMany({
                  where: whereClause,
                  skip, take,
                  select: {
                        id: true,
                        titulo: true,
                        titulo_formatado: true,
                        subtitulo: true,
                        slug: true,
                        categoria_tipo: true,
                        foto_perfil: true,
                        capa_album: true,
                        data_atualizacao: true
                  },
                  orderBy: { titulo: 'asc' }
            });

            const total = await prisma.verbete.count({ where: whereClause });
            res.json({
                  dados: verbetes,
                  paginacao: {
                        total,
                        pagina_atual: Number(pagina),
                        limite: take
                  }
            });
      } catch (error) {
            res.status(500).json({ erro: 'Erro no servidor' });
      }
});

// Busca Rápida (Termo em qualquer lugar do Título/Subtítulo)
app.get('/api/v1/busca', async (req, res) => {
      try {
            const { termo } = req.query;
            if (!termo) return res.json([]);

            const verbetes = await prisma.verbete.findMany({
                  where: {
                        status: 'Publicado',
                        OR: [
                              { titulo: { contains: termo } },
                              { subtitulo: { contains: termo } },
                              { titulo_formatado: { contains: termo } }
                        ]
                  },
                  take: 10,
                  select: { id: true, titulo: true, categoria_tipo: true, slug: true }
            });
            res.json(verbetes);
      } catch (error) {
            res.status(500).json({ erro: 'Erro na busca' });
      }
});

// Detalhes de um Verbete pelo SLUG
app.get('/api/v1/verbetes/:slug', async (req, res) => {
      try {
            const verbete = await prisma.verbete.findUnique({
                  where: { slug: req.params.slug }
            });
            if (!verbete || verbete.status !== 'Publicado') {
                  return res.status(404).json({ erro: 'Verbete não encontrado' });
            }
            // Trazer relacionamentos em uma consulta separada se houver
            const relacionamentos = await prisma.verbeteObras.findMany({
                  where: { OR: [{ ator_id: verbete.id }, { obra_id: verbete.id }] }
            });
            res.json({ ...verbete, relacionamentos });
      } catch (error) {
            res.status(500).json({ erro: 'Erro ao buscar detalhes' });
      }
});

// =============================================================
// ENDPOINTS DE ADMIN (CRUD PROTEGIDO POR SENHA)
// A Senha geral provisória é "gennesisrio2019" combinada nas Etapas
// =============================================================

// Exemplo simples de Middleware de Autenticação (simulação do escudo)
function simulaAuthAdmin(req, res, next) {
      const senhaInformada = req.headers['x-admin-senha'];
      if (senhaInformada === 'gennesisrio2019') {
            next();
      } else {
            res.status(401).json({ erro: 'Acesso Restrito: Senha Inválida' });
      }
}

// Listar TODOS os verbetes para o Admin (inclusive Rascunhos)
app.get('/api/admin/verbetes-todos', simulaAuthAdmin, async (req, res) => {
      try {
            const verbetes = await prisma.verbete.findMany({
                  orderBy: { data_atualizacao: 'desc' }
            });
            res.json(verbetes);
      } catch (error) {
            res.status(500).json({ erro: 'Erro ao listar verbetes' });
      }
});

// Criar novo verbete
app.post('/api/admin/verbetes', simulaAuthAdmin, async (req, res) => {
      try {
            let dados = req.body;

            // Sanitiza campos (evita erro de tipo com strings vazias)
            dados = sanitizarDados(dados);

            // Regra de Negócio Automática para Títulos de Hinos
            if (dados.categoria_tipo === 'Hino' && dados.titulo) {
                  dados.titulo_formatado = formatarTituloHino(dados.titulo);
            } else if (dados.categoria_tipo !== 'Hino') {
                  dados.titulo_formatado = null;
            }

            const recemCriado = await prisma.verbete.create({ data: dados });
            res.status(201).json({ mensagem: 'Verbete Criado com Sucesso', id: recemCriado.id });
      } catch (error) {
            res.status(400).json({ erro: 'Erro ao criar verbete', detalhes: error.message });
      }
});

// Editar um verbete existente
app.put('/api/admin/verbetes/:id', simulaAuthAdmin, async (req, res) => {
      try {
            let dados = req.body;

            dados = sanitizarDados(dados);

            // O Hook rola aqui de novo se houver alteração de título
            if (dados.categoria_tipo === 'Hino' && dados.titulo) {
                  dados.titulo_formatado = formatarTituloHino(dados.titulo);
            } else if (dados.categoria_tipo !== 'Hino') {
                  dados.titulo_formatado = null;
            }

            const editado = await prisma.verbete.update({
                  where: { id: req.params.id },
                  data: dados
            });
            res.json({ mensagem: 'Verbete Atualizado!', editado });
      } catch (error) {
            res.status(400).json({ erro: 'Erro ao editar verbete', detalhes: error.message });
      }
});

// Excluir (Deletar) um verbete
app.delete('/api/admin/verbetes/:id', simulaAuthAdmin, async (req, res) => {
      try {
            await prisma.verbete.delete({ where: { id: req.params.id } });
            res.json({ mensagem: 'Verbete Removido do Sistema!' });
      } catch (error) {
            res.status(400).json({ erro: 'Erro ao deletar verbete' });
      }
});

// Inicializando...
app.listen(PORT, () => {
      console.log(`[Base44] Dicionário Backend Rodando na porta ${PORT}`);
});
