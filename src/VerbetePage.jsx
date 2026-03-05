import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Maximize2, X, Calendar, BookOpen, Music, ExternalLink } from 'lucide-react';
import logo from './assets/logo.png';

const API_URL = 'http://localhost:5000';

// ─── Utilitário: extrai o videoId de qualquer formato de URL do YouTube ───
function extrairYouTubeId(url) {
      if (!url) return null;
      const regexes = [
            /[?&]v=([^&#]+)/,              // https://www.youtube.com/watch?v=ID
            /youtu\.be\/([^?&#]+)/,        // https://youtu.be/ID
            /youtube\.com\/embed\/([^?&#]+)/, // https://www.youtube.com/embed/ID
            /youtube\.com\/shorts\/([^?&#]+)/, // https://www.youtube.com/shorts/ID
      ];
      for (const regex of regexes) {
            const match = url.match(regex);
            if (match) return match[1];
      }
      return null;
}

// ─── Parâmetros do player para manter usuário no site ─────────────────────
function gerarEmbedUrl(videoId) {
      const params = new URLSearchParams({
            rel: '0',              // Só mostra vídeos do mesmo canal nos sugeridos
            modestbranding: '1',   // Reduz a marca do YouTube
            fs: '1',               // Permite fullscreen dentro da página
            iv_load_policy: '3',   // Desativa anotações
            disablekb: '0',        // Permite teclado
            color: 'white',        // Barra de progresso branca
            playsinline: '1',      // Reproduz inline no mobile
      });
      return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

// ─── Componente: Player de Vídeo com Modal Fullscreen ─────────────────────
function VideoPlayer({ url, titulo }) {
      const videoId = extrairYouTubeId(url);
      const [modalAberto, setModalAberto] = useState(false);

      if (!videoId) return null;

      const embedUrl = gerarEmbedUrl(videoId);

      return (
            <>
                  {/* Player inline responsivo */}
                  <div style={styles.videoSection}>
                        <div style={styles.videoTitulo}>
                              <Play size={20} color="#f47c20" />
                              <span>Assista ao Artista</span>
                        </div>
                        <div style={styles.videoWrapper}>
                              <iframe
                                    src={embedUrl}
                                    title={`Vídeo de ${titulo}`}
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                    allowFullScreen
                                    style={styles.videoIframe}
                              />
                        </div>
                        <button onClick={() => setModalAberto(true)} style={styles.fullscreenBtn}>
                              <Maximize2 size={16} /> Ampliar Vídeo em Tela Cheia
                        </button>
                  </div>

                  {/* Modal de Tela Cheia – permanece dentro do site */}
                  {modalAberto && (
                        <div
                              style={styles.modalOverlay}
                              onClick={e => { if (e.target === e.currentTarget) setModalAberto(false); }}
                        >
                              <div style={styles.modalContent}>
                                    <button onClick={() => setModalAberto(false)} style={styles.modalClose}>
                                          <X size={24} />
                                    </button>
                                    <div style={styles.modalVideoWrapper}>
                                          <iframe
                                                src={`${embedUrl}&autoplay=1`}
                                                title={`Vídeo de ${titulo} — Tela Cheia`}
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                                                allowFullScreen
                                                style={{ width: '100%', height: '100%', borderRadius: 8 }}
                                          />
                                    </div>
                              </div>
                        </div>
                  )}
            </>
      );
}

// ─── Página de Verbete (Artista / Hino / Álbum) ────────────────────────────
export default function VerbetePage() {
      const { slug } = useParams();
      const navigate = useNavigate();
      const [verbete, setVerbete] = useState(null);
      const [carregando, setCarregando] = useState(true);
      const [erro, setErro] = useState('');

      useEffect(() => {
            if (!slug) return;
            setCarregando(true);
            fetch(`${API_URL}/api/v1/verbetes/${slug}`)
                  .then(r => {
                        if (!r.ok) throw new Error('Verbete não encontrado');
                        return r.json();
                  })
                  .then(data => setVerbete(data))
                  .catch(e => setErro(e.message))
                  .finally(() => setCarregando(false));
      }, [slug]);

      if (carregando) return (
            <div style={styles.centrado}>
                  <div style={styles.spinner} />
                  <p style={{ color: '#888', marginTop: 16 }}>Carregando verbete...</p>
            </div>
      );

      if (erro || !verbete) return (
            <div style={styles.centrado}>
                  <BookOpen size={64} style={{ opacity: 0.2, marginBottom: 16 }} />
                  <h2>Verbete não encontrado</h2>
                  <p style={{ color: '#888' }}>Este conteúdo pode ter sido removido ou ainda não foi publicado.</p>
                  <button onClick={() => navigate('/')} style={styles.voltarBtn}>← Voltar ao Dicionário</button>
            </div>
      );

      const hasVideo = extrairYouTubeId(verbete.youtube_url);

      return (
            <div style={styles.pagina}>
                  {/* Barra de topo */}
                  <header style={styles.header}>
                        <div style={styles.headerInner}>
                              <button onClick={() => navigate('/')} style={styles.backBtn}>
                                    <ChevronLeft size={20} /> Voltar ao Dicionário
                              </button>
                              <img src={logo} alt="Gênnesis" style={{ height: 50, objectFit: 'contain' }} />
                        </div>
                  </header>

                  {/* Conteúdo Principal */}
                  <main style={styles.main}>
                        {/* Hero do Verbete */}
                        <div style={styles.hero}>
                              {verbete.foto_perfil && (
                                    <img
                                          src={verbete.foto_perfil}
                                          alt={verbete.titulo}
                                          style={styles.fotoPerfil}
                                          onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                              )}
                              <div>
                                    <span style={styles.categoriaBadge}>{verbete.categoria_tipo}</span>
                                    <h1 style={styles.titulo}>{verbete.titulo_formatado || verbete.titulo}</h1>
                                    {verbete.subtitulo && <p style={styles.subtitulo}>{verbete.subtitulo}</p>}
                                    {verbete.data_nascimento && (
                                          <div style={styles.dataInfo}>
                                                <Calendar size={14} />
                                                <span>Nascimento: {new Date(verbete.data_nascimento).toLocaleDateString('pt-BR')}</span>
                                          </div>
                                    )}
                              </div>
                        </div>

                        <div style={styles.colunasLayout}>
                              {/* Coluna Principal */}
                              <div style={styles.colunaPrincipal}>
                                    {/* Biografia / Texto */}
                                    {(verbete.texto_biografia || verbete.texto_letra) && (
                                          <section style={styles.secao}>
                                                <h2 style={styles.secaoTitulo}>
                                                      <BookOpen size={20} color="#f47c20" />
                                                      {verbete.categoria_tipo === 'Hino' ? 'Letra e História' : 'Biografia'}
                                                </h2>
                                                <div
                                                      style={styles.biography}
                                                      dangerouslySetInnerHTML={{
                                                            __html: verbete.texto_biografia || verbete.texto_letra || ''
                                                      }}
                                                />
                                          </section>
                                    )}

                                    {/* ✅ SEÇÃO DE VÍDEO DO YOUTUBE */}
                                    {hasVideo && (
                                          <VideoPlayer url={verbete.youtube_url} titulo={verbete.titulo} />
                                    )}

                                    {/* Referências */}
                                    {verbete.referencias && (
                                          <section style={styles.secao}>
                                                <h2 style={styles.secaoTitulo}>
                                                      <BookOpen size={18} color="#888" />
                                                      Referências
                                                </h2>
                                                <div style={styles.referencias}>
                                                      {verbete.referencias}
                                                </div>
                                          </section>
                                    )}
                              </div>

                              {/* Coluna Lateral */}
                              <aside style={styles.aside}>
                                    <div style={styles.fichaCard}>
                                          <h3 style={styles.fichaTitle}>📋 Ficha do Verbete</h3>
                                          <div style={styles.fichaRow}><strong>Categoria:</strong> {verbete.categoria_tipo}</div>
                                          {verbete.data_nascimento && (
                                                <div style={styles.fichaRow}><strong>Nascimento:</strong> {new Date(verbete.data_nascimento).toLocaleDateString('pt-BR')}</div>
                                          )}
                                          {verbete.data_falecimento && (
                                                <div style={styles.fichaRow}><strong>Falecimento:</strong> {new Date(verbete.data_falecimento).toLocaleDateString('pt-BR')}</div>
                                          )}
                                          {verbete.gravadora && (
                                                <div style={styles.fichaRow}><strong>Gravadora:</strong> {verbete.gravadora}</div>
                                          )}
                                          {verbete.ano_lancamento && (
                                                <div style={styles.fichaRow}><strong>Ano:</strong> {verbete.ano_lancamento}</div>
                                          )}
                                          <div style={styles.fichaRow}>
                                                <strong>Atualizado:</strong> {new Date(verbete.data_atualizacao).toLocaleDateString('pt-BR')}
                                          </div>
                                    </div>
                              </aside>
                        </div>
                  </main>

                  {/* Rodapé */}
                  <footer style={styles.footer}>
                        <img src={logo} alt="Gênnesis" style={{ height: 40 }} />
                        <span style={{ color: '#888', fontSize: 13 }}>Dicionário da Música Popular Brasileira Cristã – 2024 ©</span>
                  </footer>
            </div>
      );
}

// ─── ESTILOS ────────────────────────────────────────────────────────────────
const styles = {
      pagina: { minHeight: '100vh', background: '#f7f8fc', fontFamily: 'Inter, sans-serif' },
      header: { background: '#121539', padding: '12px 32px', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 10px rgba(0,0,0,0.3)' },
      headerInner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 960, margin: '0 auto' },
      backBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14, transition: 'background 0.2s' },
      main: { maxWidth: 960, margin: '0 auto', padding: '32px 20px' },
      hero: { display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 4px 20px rgba(0,0,0,0.07)' },
      fotoPerfil: { width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '4px solid #f47c20', flexShrink: 0 },
      categoriaBadge: { background: '#f47c20', color: '#fff', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, display: 'inline-block', marginBottom: 8 },
      titulo: { margin: '0 0 6px', fontSize: 32, color: '#121539', lineHeight: 1.2 },
      subtitulo: { margin: '0 0 8px', fontSize: 16, color: '#666' },
      dataInfo: { display: 'flex', alignItems: 'center', gap: 6, color: '#888', fontSize: 13 },
      colunasLayout: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' },
      colunaPrincipal: { display: 'flex', flexDirection: 'column', gap: 20 },
      aside: { display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 80 },
      secao: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
      secaoTitulo: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, color: '#121539', marginTop: 0, marginBottom: 16, borderBottom: '2px solid #f5f5f5', paddingBottom: 12 },
      biography: { lineHeight: 1.8, color: '#333', fontSize: 15 },
      referencias: { color: '#555', fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' },
      fichaCard: { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
      fichaTitle: { margin: '0 0 16px', fontSize: 15, color: '#121539', borderBottom: '2px solid #f5f5f5', paddingBottom: 10 },
      fichaRow: { fontSize: 13, color: '#555', marginBottom: 10, lineHeight: 1.5 },
      footer: { background: '#121539', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 48 },
      centrado: { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 },
      voltarBtn: { background: '#121539', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: 10, cursor: 'pointer', fontSize: 15, marginTop: 16 },
      spinner: { width: 48, height: 48, border: '4px solid #e2e8f0', borderTopColor: '#f47c20', borderRadius: '50%', animation: 'spin 1s linear infinite' },

      // ─── Estilos do Player de Vídeo ──────────────────────────────
      videoSection: { background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
      videoTitulo: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 18, fontWeight: 700, color: '#121539', marginBottom: 16, borderBottom: '2px solid #f5f5f5', paddingBottom: 12 },
      // Container 16:9 responsivo — padrão da indústria para iframes de vídeo
      videoWrapper: { position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 10, background: '#000' },
      videoIframe: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 },
      fullscreenBtn: { display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: '1.5px solid #e2e8f0', color: '#555', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, marginTop: 12, transition: 'all 0.2s' },

      // ─── Modal de Tela Cheia ────────────────────────────────────
      modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
      modalContent: { position: 'relative', width: '100%', maxWidth: 1100, background: '#000', borderRadius: 12, overflow: 'hidden' },
      modalClose: { position: 'absolute', top: 12, right: 12, background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', padding: 8, borderRadius: '50%', cursor: 'pointer', zIndex: 10, backdropFilter: 'blur(4px)' },
      // Container 16:9 para o modal
      modalVideoWrapper: { position: 'relative', paddingBottom: '56.25%', height: 0 },
};
