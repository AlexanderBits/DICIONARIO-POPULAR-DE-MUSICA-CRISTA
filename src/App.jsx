import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
      Star, Users, Music, Search,
      Facebook, Twitter, Instagram, Shield
} from 'lucide-react';
import logo from './assets/logo.png';
import crisImg from './assets/cris.jpg';

// ----------------------------------------------------------------
// URL base da nossa API Backend (rodando em localhost:5000)
// ----------------------------------------------------------------
const API_URL = 'http://localhost:5000';

// ----------------------------------------------------------------
// Componente: Card de Verbete (resultado de busca / listagem)
// ----------------------------------------------------------------
function VerbeteCard({ verbete }) {
      const navigate = useNavigate();
      const titulo = verbete.titulo_formatado || verbete.titulo;
      return (
            <div
                  className="card-item"
                  onClick={() => navigate(`/verbete/${verbete.slug}`)}
                  style={{ cursor: 'pointer' }}
                  title={`Ver página de ${titulo}`}
            >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {verbete.foto_perfil && (
                              <img
                                    src={verbete.foto_perfil}
                                    alt={titulo}
                                    style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                              />
                        )}
                        <div>
                              <div className="card-item-title" style={{ color: '#121539', fontWeight: 600 }}>{titulo}</div>
                              <span className="card-item-link">{verbete.categoria_tipo}</span>
                        </div>
                  </div>
            </div>
      );
}

// ----------------------------------------------------------------
// Componente: Resultados de Busca Expandida (seção abaixo do hero)
// ----------------------------------------------------------------
function ResultadosBusca({ termo, resultados, carregando }) {
      if (!termo && resultados.length === 0) return null;
      return (
            <section style={{ padding: '30px 40px', background: '#f4f6f9', borderBottom: '1px solid #ddd' }}>
                  <h3 style={{ marginBottom: 15, color: '#121539' }}>
                        {carregando ? '🔄 Buscando...' : `📋 Resultados${termo ? ` para "${termo}"` : ''}: ${resultados.length} encontrado(s)`}
                  </h3>
                  {!carregando && resultados.length === 0 && termo && (
                        <p style={{ color: '#888' }}>Nenhum verbete encontrado. Tente outro termo.</p>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                        {resultados.map(v => <VerbeteCard key={v.id} verbete={v} />)}
                  </div>
            </section>
      );
}

// ----------------------------------------------------------------
// APP PRINCIPAL
// ----------------------------------------------------------------
function App() {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
      const [showCrisStory, setShowCrisStory] = useState(false);

      // --- Estados de Busca ---
      const [termoBusca, setTermoBusca] = useState('');
      const [categoriaBusca, setCategoriaBusca] = useState('');
      const [resultadosBusca, setResultadosBusca] = useState([]);
      const [buscando, setBuscando] = useState(false);
      const [buscaAtiva, setBuscaAtiva] = useState(false);

      // --- Estados dos Novos Verbetes (vindos da API) ---
      const [novosVerbetes, setNovosVerbetes] = useState([]);
      const [carregandoNovos, setCarregandoNovos] = useState(true);

      // --- Estado da letra selecionada na barra ---
      const [letraSelecionada, setLetraSelecionada] = useState(null);
      const [verbetesPorLetra, setVerbetesPorLetra] = useState([]);

      // -------------------------------------------------------
      // Ao carregar a página: busca os últimos verbetes publicados
      // -------------------------------------------------------
      useEffect(() => {
            fetch(`${API_URL}/api/v1/verbetes?limite=5`)
                  .then(r => r.json())
                  .then(data => {
                        setNovosVerbetes(data.dados || []);
                  })
                  .catch(() => setNovosVerbetes([]))
                  .finally(() => setCarregandoNovos(false));
      }, []);

      // -------------------------------------------------------
      // Função de Busca (conecta ao endpoint /api/v1/busca)
      // -------------------------------------------------------
      const handleBuscar = useCallback(async (e) => {
            if (e) e.preventDefault();
            if (!termoBusca.trim()) return;

            setBuscando(true);
            setBuscaAtiva(true);
            setLetraSelecionada(null);

            try {
                  const url = `${API_URL}/api/v1/busca?termo=${encodeURIComponent(termoBusca)}`;
                  const res = await fetch(url);
                  const dados = await res.json();
                  setResultadosBusca(dados);
            } catch {
                  setResultadosBusca([]);
            } finally {
                  setBuscando(false);
            }
      }, [termoBusca]);

      // -------------------------------------------------------
      // Função: Clique na Letra do Alfabeto
      // -------------------------------------------------------
      const handleLetra = useCallback(async (letra) => {
            setLetraSelecionada(letra);
            setBuscaAtiva(true);
            setBuscando(true);
            setTermoBusca('');
            setResultadosBusca([]);

            try {
                  const url = `${API_URL}/api/v1/verbetes?letra_inicial=${letra}${categoriaBusca ? `&categoria_tipo=${categoriaBusca}` : ''}`;
                  const res = await fetch(url);
                  const data = await res.json();
                  setVerbetesPorLetra(data.dados || []);
                  setResultadosBusca(data.dados || []);
            } catch {
                  setVerbetesPorLetra([]);
            } finally {
                  setBuscando(false);
            }
      }, [categoriaBusca]);

      return (
            <div className="app">
                  {/* Top Bar */}
                  <div className="top-bar">
                        <div className="alphabet">
                              {alphabet.map((letter) => (
                                    <a
                                          key={letter}
                                          href={`#${letter.toLowerCase()}`}
                                          onClick={(e) => { e.preventDefault(); handleLetra(letter); }}
                                          style={{
                                                fontWeight: letraSelecionada === letter ? 'bold' : 'normal',
                                                color: letraSelecionada === letter ? '#f47c20' : undefined,
                                                borderBottom: letraSelecionada === letter ? '2px solid #f47c20' : undefined,
                                          }}
                                    >
                                          {letter}
                                    </a>
                              ))}
                        </div>
                        <div className="lang-selector">
                              <img src="https://flagcdn.com/w20/br.png" alt="Brazil Flag" /> Português ✓
                        </div>
                  </div>

                  {/* Header */}
                  <header className="header">
                        <div className="logo">
                              <img src={logo} alt="GENNESIS Dicionário de Música Popular Brasileira Cristã" />
                        </div>

                        <div className="main-buttons">
                              <a href="#artistas" className="btn-circle" onClick={(e) => { e.preventDefault(); handleLetra('A'); }}>
                                    <div className="icon-container">
                                          <Star size={24} />
                                    </div>
                                    <span>Artistas</span>
                              </a>
                              <a href="#personalidades" className="btn-circle">
                                    <div className="icon-container">
                                          <Users size={24} />
                                    </div>
                                    <span>Personalidades</span>
                              </a>
                              <a href="#musicas" className="btn-circle">
                                    <div className="icon-container">
                                          <Music size={24} />
                                    </div>
                                    <span>Músicas</span>
                              </a>
                        </div>
                  </header>

                  {/* Hero Banner */}
                  <section className="hero">
                        <div className="hero-content">
                              <h1 className="hero-title">Procure aqui as Personalidades, Artistas e Músicas</h1>
                              <form className="search-form" onSubmit={handleBuscar}>
                                    <div className="search-input-group">
                                          <Search className="search-icon" />
                                          <input
                                                type="text"
                                                placeholder="Procurar por..."
                                                className="search-input"
                                                value={termoBusca}
                                                onChange={(e) => setTermoBusca(e.target.value)}
                                          />
                                    </div>
                                    <select
                                          className="category-select"
                                          value={categoriaBusca}
                                          onChange={(e) => setCategoriaBusca(e.target.value)}
                                    >
                                          <option value="">Selecione a Categoria</option>
                                          <option value="Cantor">Artistas</option>
                                          <option value="Grupo">Grupos / Bandas</option>
                                          <option value="Hino">Hinos</option>
                                          <option value="Album">Álbuns</option>
                                    </select>
                                    <button type="submit" className="search-btn">PROCURAR</button>
                              </form>
                        </div>
                  </section>

                  {/* Resultados de Busca (só aparece quando há busca ativa) */}
                  {buscaAtiva && (
                        <ResultadosBusca
                              termo={letraSelecionada ? `letra ${letraSelecionada}` : termoBusca}
                              resultados={resultadosBusca}
                              carregando={buscando}
                        />
                  )}

                  {/* Cards Section */}
                  <section className="cards-section">
                        {/* Card 1 – NOVOS VERBETES (via API) */}
                        <div className="card">
                              <h3 className="card-title">Novos Verbetes</h3>
                              {carregandoNovos ? (
                                    <p style={{ color: '#888', fontSize: 13 }}>Carregando...</p>
                              ) : novosVerbetes.length === 0 ? (
                                    <p style={{ color: '#aaa', fontSize: 13 }}>Nenhum verbete publicado ainda.</p>
                              ) : (
                                    novosVerbetes.map(v => <VerbeteCard key={v.id} verbete={v} />)
                              )}
                        </div>

                        {/* Card 2 */}
                        <div className="card">
                              <h3 className="card-title">Mais vistos nos últimos 30 dias</h3>
                              <div className="card-item">
                                    <div className="card-item-title">Prisma Brasil</div>
                                    <a href="#" className="card-item-link">Artistas</a>
                              </div>
                              <div className="card-item">
                                    <div className="card-item-title">Baruk</div>
                                    <a href="#" className="card-item-link">Artistas</a>
                              </div>
                        </div>

                        {/* Card 3 */}
                        <div className="card">
                              <h3 className="card-title">
                                    Aniversariantes do<br />Dia<br />
                                    <span style={{ fontSize: '14px', color: '#121539' }}>04 de novembro</span>
                              </h3>
                              <button className="bd-all-dates">Todas as<br />Datas</button>

                              <div className="bd-btns">
                                    <button className="bd-btn active">Todos</button>
                                    <button className="bd-btn">Nascidos</button>
                                    <button className="bd-btn">Falecidos</button>
                              </div>

                              <div className="bd-empty">
                                    Sem resultados para esse dia
                              </div>
                        </div>
                  </section>

                  {/* Content Section */}
                  <section className="content-section">
                        <div className="content-text">
                              <h2>Gennesis – Dicionário de Música<br />Popular Brasileira Cristã</h2>
                              <p>
                                    O Dicionário de Música Popular Brasileira Cristã GENNESIS foi criado em 2022 com a missão de ser totalmente dedicado à música cristã, por reconhecer sua fundamental relevância diante da indústria musical e cultural brasileira.
                              </p>
                              <p>
                                    Este conteúdo visa potencializar e oportunizar espaço para divulgação de produções de música cristã em suas variadas categorias: gospel, sacra, religiosa, hino, católica popular, cristã contemporânea, octoeco ou canto gregoriano. O dicionário de Música Popular Brasileira Cristã intitulado
                              </p>
                        </div>

                        <div className="grid-logos">
                              {Array.from({ length: 16 }).map((_, i) => (
                                    <div key={i} className={`grid-cell ${i % 2 === 0 ? 'bg-blue' : 'bg-orange'}`}>
                                          <span style={{ color: 'white', fontSize: '10px', fontWeight: 'bold' }}>GENNESIS</span>
                                    </div>
                              ))}
                        </div>
                  </section>

                  {/* Video & More Text Section */}
                  <section className="video-section">
                        <div className="video-text">
                              <p>Assista aos detalhes do lançamento do Dicionário Gênnesis da Música Popular Brasileira Cristã, realizado no auditório da Biblioteca Nacional. Idealizado por Cris Nascimento (CEO da CN Filmes), o projeto surge como o maior portal de preservação da memória musical cristã no Brasil. O vídeo apresenta o apoio da Secretaria de Cultura do Rio de Janeiro e a participação de autoridades, destacando a missão de catalogar desde os hinários centenários até a música contemporânea, reconhecendo o valor da arte cristã como patrimônio cultural brasileiro.</p>

                              {showCrisStory && (
                                    <div className="cris-story" style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                                                <img
                                                      src={crisImg}
                                                      alt="Cris Nascimento"
                                                      style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid white', flexShrink: 0 }}
                                                />
                                                <h4 style={{ color: '#121539', margin: 0, fontSize: '18px' }}>O Perfil de Cris Nascimento (A Idealizadora)</h4>
                                          </div>
                                          <p>A história dela explica por que o dicionário nasceu com esse rigor documental:</p>
                                          <ul style={{ paddingLeft: '20px', fontSize: '14px', lineHeight: '1.6' }}>
                                                <li style={{ marginBottom: '10px' }}><strong>Raízes Simples:</strong> Natural do interior de Pernambuco, ela aprendeu a ler com jornais de feira e gibis. Sua paixão por livros vem da infância humilde e do acesso a escolas públicas.</li>
                                                <li style={{ marginBottom: '10px' }}><strong>Trajetória na Biblioteca Nacional:</strong> Ela trabalhou na instituição de 1995 a 2003, no Departamento Nacional do Livro. Para ela, a Biblioteca Nacional é sua "segunda casa", onde ela chorava ao tocar em obras originais e documentos históricos.</li>
                                                <li><strong>Experiência Acadêmica:</strong> Teve passagem pela Academia Brasileira de Letras (ABL), onde trabalhou com bibliotecas e projetos culturais patrocinados pela Petrobras, convivendo com grandes intelectuais e obras autografadas de Machado de Assis e Euclides da Cunha.</li>
                                          </ul>
                                    </div>
                              )}

                              <button
                                    className="btn-learn-more"
                                    onClick={() => setShowCrisStory(!showCrisStory)}
                                    style={{ marginTop: '15px' }}
                              >
                                    {showCrisStory ? 'Ocultar História' : 'Conheça a Idealizadora'}
                              </button>
                        </div>
                        <div className="video-wrapper">
                              <iframe
                                    src="https://www.youtube.com/embed/uvSebTJ3r50"
                                    title="YouTube video player"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                              ></iframe>
                        </div>
                  </section>

                  {/* Footer Nav */}
                  <footer className="footer">
                        <nav className="footer-nav">
                              <a href="#apresentacao">Apresentação</a>
                              <a href="#quemsomos">Quem Somos</a>
                              <a href="#creditos">Créditos</a>
                              <a href="#agradecimentos">Agradecimentos</a>
                              <a href="#parceiros">Parceiros</a>
                        </nav>

                        <div className="footer-bottom">
                              <div className="footer-logo">
                                    <img src={logo} alt="GENNESIS Dicionário de Música Popular Brasileira Cristã" />
                              </div>
                              <div className="social-icons">
                                    <a href="#" className="social-icon fb"><Facebook size={20} /></a>
                                    <a href="#" className="social-icon tw"><Twitter size={20} /></a>
                                    <a href="https://www.instagram.com/dicionario.gennesis/" target="_blank" rel="noopener noreferrer" className="social-icon ig"><Instagram size={20} /></a>
                              </div>
                        </div>
                  </footer>

                  <div className="copyright">
                        Dicionário da Música Popular Brasileira Cristã – 2024 ©
                        {/* Escudo secreto do Admin */}
                        <a
                              href="/admin"
                              title="Acesso Restrito"
                              style={{ marginLeft: 12, opacity: 0.25, color: 'inherit', transition: 'opacity 0.3s' }}
                              onMouseEnter={e => e.currentTarget.style.opacity = 1}
                              onMouseLeave={e => e.currentTarget.style.opacity = 0.25}
                        >
                              <Shield size={14} />
                        </a>
                  </div>
            </div>
      );
}

export default App;
