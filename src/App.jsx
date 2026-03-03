import React from 'react';
import {
      Star, Users, Music, Search,
      Facebook, Twitter, Instagram
} from 'lucide-react';

function App() {
      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

      return (
            <div className="app">
                  {/* Top Bar */}
                  <div className="top-bar">
                        <div className="alphabet">
                              {alphabet.map((letter) => (
                                    <a key={letter} href={`#${letter.toLowerCase()}`}>{letter}</a>
                              ))}
                        </div>
                        <div className="lang-selector">
                              <img src="https://flagcdn.com/w20/br.png" alt="Brazil Flag" /> Português ✓
                        </div>
                  </div>

                  {/* Header */}
                  <header className="header">
                        <div className="logo">
                              {/* Logo placeholder - text based to resemble GENNESIS */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                    <span style={{ fontSize: '40px', fontWeight: '800', color: '#121539', letterSpacing: '-2px' }}>GEN<span style={{ color: '#F58133' }}>N</span>ESIS</span>
                                    <div style={{ display: 'flex', flexDirection: 'column', color: '#121539', fontSize: '10px', marginTop: '10px' }}>
                                          <span>Dicionário de Música</span>
                                          <span>Popular Brasileira Cristã</span>
                                    </div>
                              </div>
                        </div>

                        <div className="main-buttons">
                              <a href="#artistas" className="btn-circle">
                                    <Star size={24} />
                                    <span>Artistas</span>
                              </a>
                              <a href="#personalidades" className="btn-circle">
                                    <Users size={24} />
                                    <span>Personalidades</span>
                              </a>
                              <a href="#musicas" className="btn-circle">
                                    <Music size={24} />
                                    <span>Músicas</span>
                              </a>
                        </div>
                  </header>

                  {/* Hero Banner */}
                  <section className="hero">
                        <div className="hero-content">
                              <h1 className="hero-title">Procure aqui as Personalidades, Artistas e Músicas</h1>
                              <form className="search-form">
                                    <div className="search-input-group">
                                          <Search className="search-icon" />
                                          <input type="text" placeholder="Procurar por..." className="search-input" />
                                    </div>
                                    <select className="category-select">
                                          <option>Selecione a Categoria</option>
                                          <option>Artistas</option>
                                          <option>Personalidades</option>
                                          <option>Músicas</option>
                                    </select>
                                    <button type="submit" className="search-btn">PROCURAR</button>
                              </form>
                        </div>
                  </section>

                  {/* Cards Section */}
                  <section className="cards-section">
                        {/* Card 1 */}
                        <div className="card">
                              <h3 className="card-title">Novos Verbetes</h3>
                              <div className="card-item">
                                    <div className="card-item-title">Baruk</div>
                                    <a href="#" className="card-item-link">Veja mais em Artistas</a>
                              </div>
                              <div className="card-item">
                                    <div className="card-item-title">Prisma Brasil</div>
                                    <a href="#" className="card-item-link">Veja mais em Artistas</a>
                              </div>
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

                        {/* Grid Logos */}
                        {/* Placeholder for the checkered logo pattern seen in the image */}
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
                              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.</p>
                              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.</p>
                              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.</p>
                              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec ullamcorper mattis, pulvinar dapibus leo.</p>
                              <button className="btn-learn-more">Saiba Mais</button>
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
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                          <span style={{ fontSize: '30px', fontWeight: '800', color: '#121539', letterSpacing: '-2px' }}>GEN<span style={{ color: '#F58133' }}>N</span>ESIS</span>
                                          <div style={{ display: 'flex', flexDirection: 'column', color: '#121539', fontSize: '8px', marginTop: '8px' }}>
                                                <span>Dicionário de Música</span>
                                                <span>Popular Brasileira Cristã</span>
                                          </div>
                                    </div>
                              </div>
                              <div className="social-icons">
                                    <a href="#" className="social-icon fb"><Facebook size={20} /></a>
                                    <a href="#" className="social-icon tw"><Twitter size={20} /></a>
                                    <a href="#" className="social-icon ig"><Instagram size={20} /></a>
                              </div>
                        </div>
                  </footer>
                  <div className="copyright">
                        Dicionário da Música Popular Brasileira Cristã – 2024 ©
                  </div>
            </div>
      );
}

export default App;
