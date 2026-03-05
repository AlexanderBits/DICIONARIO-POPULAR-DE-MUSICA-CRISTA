import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Shield, LogOut, Plus, Edit2, Trash2, Save, X, Eye, EyeOff, BookOpen, Music, Users, Star, ChevronLeft } from 'lucide-react';

const API_URL = 'http://localhost:5000';
const ADMIN_SENHA = 'gennesisrio2019';

const CATEGORIAS = ['Cantor', 'Grupo', 'Hino', 'Compositor', 'Personalidade', 'Album'];

const QUILL_MODULES = {
      toolbar: [
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean'],
      ],
};

// ─── Tela de LOGIN ──────────────────────────────────────────────
function LoginScreen({ onLogin }) {
      const [senha, setSenha] = useState('');
      const [mostrarSenha, setMostrarSenha] = useState(false);
      const [erro, setErro] = useState('');
      const [carregando, setCarregando] = useState(false);

      const handleSubmit = async (e) => {
            e.preventDefault();
            setCarregando(true);
            setErro('');
            // Validação simples local + teste no backend
            if (senha === ADMIN_SENHA) {
                  onLogin(senha);
            } else {
                  setErro('Senha incorreta. Tente novamente.');
            }
            setCarregando(false);
      };

      return (
            <div style={styles.loginOverlay}>
                  <div style={styles.loginBox}>
                        <div style={styles.loginHeader}>
                              <Shield size={48} color="#f47c20" />
                              <h2 style={{ margin: '16px 0 4px', color: '#121539', fontSize: 24 }}>Área Restrita</h2>
                              <p style={{ color: '#666', margin: 0, fontSize: 14 }}>Painel Administrativo — Gênnesis Dicionário</p>
                        </div>
                        <form onSubmit={handleSubmit} style={{ marginTop: 24 }}>
                              <label style={styles.label}>Senha de Acesso</label>
                              <div style={{ position: 'relative' }}>
                                    <input
                                          type={mostrarSenha ? 'text' : 'password'}
                                          value={senha}
                                          onChange={e => setSenha(e.target.value)}
                                          placeholder="Digite a senha..."
                                          style={styles.input}
                                          autoFocus
                                    />
                                    <button
                                          type="button"
                                          onClick={() => setMostrarSenha(!mostrarSenha)}
                                          style={styles.eyeBtn}
                                    >
                                          {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                              </div>
                              {erro && <p style={{ color: '#e53e3e', fontSize: 13, marginTop: 6 }}>{erro}</p>}
                              <button type="submit" style={styles.loginBtn} disabled={carregando}>
                                    {carregando ? 'Verificando...' : 'Entrar no Painel'}
                              </button>
                        </form>
                        <p style={{ color: '#aaa', fontSize: 11, textAlign: 'center', marginTop: 16 }}>
                              Acesso exclusivo para administradoras do Dicionário Gênnesis
                        </p>
                  </div>
            </div>
      );
}

// ─── Formulário CRIAR / EDITAR Verbete ─────────────────────────
function FormularioVerbete({ verbete, onSalvar, onCancelar, senha }) {
      const editando = !!verbete;
      const [form, setForm] = useState({
            titulo: verbete?.titulo || '',
            subtitulo: verbete?.subtitulo || '',
            categoria_tipo: verbete?.categoria_tipo || 'Cantor',
            texto_biografia: verbete?.texto_biografia || '',
            texto_letra: verbete?.texto_letra || '',
            referencias: verbete?.referencias || '',
            foto_perfil: verbete?.foto_perfil || '',
            capa_album: verbete?.capa_album || '',
            data_nascimento: verbete?.data_nascimento || '',
            ano_lancamento: verbete?.ano_lancamento || '',
            gravadora: verbete?.gravadora || '',
            youtube_url: verbete?.youtube_url || '',
            status: verbete?.status || 'Rascunho',
            slug: verbete?.slug || '',
      });
      const [salvando, setSalvando] = useState(false);
      const [erro, setErro] = useState('');

      const gerarSlug = (titulo) =>
            titulo.toLowerCase()
                  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                  .replace(/[^a-z0-9\s-]/g, '')
                  .trim().replace(/\s+/g, '-');

      const handleChange = (field, value) => {
            setForm(prev => {
                  const next = { ...prev, [field]: value };
                  if (field === 'titulo' && !editando) next.slug = gerarSlug(value);
                  return next;
            });
      };

      const handleSalvar = async (e) => {
            e.preventDefault();
            if (!form.titulo.trim()) { setErro('O Título é obrigatório.'); return; }
            if (!form.slug.trim()) { setErro('O Slug é obrigatório.'); return; }
            setSalvando(true);
            setErro('');

            const payload = { ...form };
            if (form.ano_lancamento) payload.ano_lancamento = parseInt(form.ano_lancamento);

            const url = editando
                  ? `${API_URL}/api/admin/verbetes/${verbete.id}`
                  : `${API_URL}/api/admin/verbetes`;
            const method = editando ? 'PUT' : 'POST';

            try {
                  const res = await fetch(url, {
                        method,
                        headers: { 'Content-Type': 'application/json', 'x-admin-senha': senha },
                        body: JSON.stringify(payload),
                  });
                  if (!res.ok) throw new Error((await res.json()).erro || 'Erro ao salvar');
                  onSalvar();
            } catch (err) {
                  setErro(err.message);
            } finally {
                  setSalvando(false);
            }
      };

      const isHino = form.categoria_tipo === 'Hino';
      const isAlbum = form.categoria_tipo === 'Album';

      return (
            <div style={styles.formContainer}>
                  <div style={styles.formHeader}>
                        <button onClick={onCancelar} style={styles.backBtn}><ChevronLeft size={20} /> Voltar</button>
                        <h2 style={{ margin: 0, color: '#121539' }}>
                              {editando ? `✏️ Editar: ${verbete.titulo}` : '➕ Novo Verbete'}
                        </h2>
                        <div style={{ display: 'flex', gap: 8 }}>
                              <button onClick={() => handleChange('status', 'Rascunho')} style={{ ...styles.statusBtn, background: form.status === 'Rascunho' ? '#f6ad55' : '#e2e8f0' }}>
                                    Rascunho
                              </button>
                              <button onClick={() => handleChange('status', 'Publicado')} style={{ ...styles.statusBtn, background: form.status === 'Publicado' ? '#68d391' : '#e2e8f0' }}>
                                    Publicado
                              </button>
                        </div>
                  </div>

                  <form onSubmit={handleSalvar} style={{ marginTop: 24 }}>
                        <div style={styles.grid2}>
                              <div>
                                    <label style={styles.label}>Título *</label>
                                    <input style={styles.input} value={form.titulo} onChange={e => handleChange('titulo', e.target.value)} placeholder="Ex: Aline Barros / Hino da Harpa Cristã 15 - Foi na Cruz" />
                                    {isHino && <small style={{ color: '#888' }}>💡 Para Hinos da Harpa, o título será formatado automaticamente ao salvar</small>}
                              </div>
                              <div>
                                    <label style={styles.label}>Subtítulo</label>
                                    <input style={styles.input} value={form.subtitulo} onChange={e => handleChange('subtitulo', e.target.value)} placeholder="Ex: Cantora Gospel Brasileira" />
                              </div>
                        </div>

                        <div style={styles.grid2}>
                              <div>
                                    <label style={styles.label}>Categoria *</label>
                                    <select style={styles.input} value={form.categoria_tipo} onChange={e => handleChange('categoria_tipo', e.target.value)}>
                                          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                              </div>
                              <div>
                                    <label style={styles.label}>Slug (URL)</label>
                                    <input style={styles.input} value={form.slug} onChange={e => handleChange('slug', e.target.value)} placeholder="Ex: aline-barros" />
                              </div>
                        </div>

                        {/* Foto / Capa */}
                        <div style={styles.grid2}>
                              <div>
                                    <label style={styles.label}>
                                          🌩️ {isAlbum ? 'Capa do Álbum' : 'Foto de Perfil'} — URL do Cloudinary
                                    </label>
                                    <input
                                          style={styles.input}
                                          value={isAlbum ? form.capa_album : form.foto_perfil}
                                          onChange={e => handleChange(isAlbum ? 'capa_album' : 'foto_perfil', e.target.value)}
                                          placeholder="https://res.cloudinary.com/seu-nome/image/upload/..."
                                    />
                                    {(form.foto_perfil || form.capa_album) && (
                                          <img src={isAlbum ? form.capa_album : form.foto_perfil} alt="preview" style={{ width: 60, height: 60, borderRadius: 8, marginTop: 6, objectFit: 'cover' }} />
                                    )}
                              </div>

                              {isAlbum ? (
                                    <div style={styles.grid2}>
                                          <div>
                                                <label style={styles.label}>Ano de Lançamento</label>
                                                <input style={styles.input} type="number" value={form.ano_lancamento} onChange={e => handleChange('ano_lancamento', e.target.value)} placeholder="Ex: 2005" />
                                          </div>
                                          <div>
                                                <label style={styles.label}>Gravadora</label>
                                                <input style={styles.input} value={form.gravadora} onChange={e => handleChange('gravadora', e.target.value)} placeholder="Ex: MK Music" />
                                          </div>
                                    </div>
                              ) : !isHino && (
                                    <div>
                                          <label style={styles.label}>Data de Nascimento</label>
                                          <input style={styles.input} type="date" value={form.data_nascimento} onChange={e => handleChange('data_nascimento', e.target.value)} />
                                    </div>
                              )}
                        </div>

                        {/* Editor Rich Text */}
                        <div style={{ marginBottom: 20 }}>
                              <label style={styles.label}>{isHino ? '📝 Letra e História do Hino' : '📝 Biografia / Histórico'}</label>
                              <ReactQuill
                                    value={isHino ? form.texto_letra : form.texto_biografia}
                                    onChange={val => handleChange(isHino ? 'texto_letra' : 'texto_biografia', val)}
                                    modules={QUILL_MODULES}
                                    theme="snow"
                                    style={{ background: '#fff', borderRadius: 8 }}
                                    placeholder="Escreva aqui a história, biografia ou texto do verbete..."
                              />
                        </div>

                        {/* Campo YouTube */}
                        <div style={{ marginBottom: 20 }}>
                              <label style={styles.label}>🎬 Link do Vídeo do YouTube</label>
                              <input
                                    style={styles.input}
                                    value={form.youtube_url}
                                    onChange={e => handleChange('youtube_url', e.target.value)}
                                    placeholder="Ex: https://www.youtube.com/watch?v=abc123 ou https://youtu.be/abc123"
                              />
                              <small style={{ color: '#888', display: 'block', marginTop: 4 }}>Cole o link do YouTube e o player será gerado automaticamente na página do artista.</small>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                              <label style={styles.label}>📚 Referências Bibliográficas</label>
                              <textarea
                                    style={{ ...styles.input, minHeight: 80, resize: 'vertical' }}
                                    value={form.referencias}
                                    onChange={e => handleChange('referencias', e.target.value)}
                                    placeholder="Links, livros, fontes consultadas..."
                              />
                        </div>

                        {erro && <p style={{ color: '#e53e3e', marginBottom: 12 }}>{erro}</p>}

                        <div style={{ display: 'flex', gap: 12 }}>
                              <button type="submit" style={styles.saveBtn} disabled={salvando}>
                                    <Save size={18} /> {salvando ? 'Salvando...' : (editando ? 'Atualizar Verbete' : 'Criar Verbete')}
                              </button>
                              <button type="button" onClick={onCancelar} style={styles.cancelBtn}>
                                    <X size={18} /> Cancelar
                              </button>
                        </div>
                  </form>
            </div>
      );
}

// ─── DASHBOARD — Listagem de Verbetes ───────────────────────────
function Dashboard({ senha, onLogout }) {
      const [verbetes, setVerbetes] = useState([]);
      const [carregando, setCarregando] = useState(true);
      const [filtroStatus, setFiltroStatus] = useState('todos');
      const [filtroCategoria, setFiltroCategoria] = useState('');
      const [filtroLetra, setFiltroLetra] = useState('');
      const [tela, setTela] = useState('lista'); // 'lista' | 'novo' | 'editar'
      const [verbeteEditando, setVerbeteEditando] = useState(null);

      const buscarTodos = async () => {
            setCarregando(true);
            try {
                  const res = await fetch(`${API_URL}/api/admin/verbetes-todos`, {
                        headers: { 'x-admin-senha': senha }
                  });
                  if (res.ok) {
                        const data = await res.json();
                        setVerbetes(data);
                  }
            } catch {
                  setVerbetes([]);
            } finally {
                  setCarregando(false);
            }
      };

      useEffect(() => { buscarTodos(); }, []);

      const excluir = async (id, titulo) => {
            if (!confirm(`Tem certeza que deseja EXCLUIR "${titulo}"?\nEsta ação não pode ser desfeita.`)) return;
            const res = await fetch(`${API_URL}/api/admin/verbetes/${id}`, {
                  method: 'DELETE',
                  headers: { 'x-admin-senha': senha }
            });
            if (res.ok) buscarTodos();
      };

      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

      const verbetesFiltrados = verbetes.filter(v => {
            if (filtroStatus === 'publicados' && v.status !== 'Publicado') return false;
            if (filtroStatus === 'rascunhos' && v.status !== 'Rascunho') return false;
            if (filtroCategoria && v.categoria_tipo !== filtroCategoria) return false;
            if (filtroLetra && !v.titulo.toUpperCase().startsWith(filtroLetra)) return false;
            return true;
      });

      if (tela === 'novo') return (
            <FormularioVerbete
                  verbete={null}
                  senha={senha}
                  onSalvar={() => { buscarTodos(); setTela('lista'); }}
                  onCancelar={() => setTela('lista')}
            />
      );

      if (tela === 'editar') return (
            <FormularioVerbete
                  verbete={verbeteEditando}
                  senha={senha}
                  onSalvar={() => { buscarTodos(); setTela('lista'); setVerbeteEditando(null); }}
                  onCancelar={() => { setTela('lista'); setVerbeteEditando(null); }}
            />
      );

      const totais = {
            todos: verbetes.length,
            publicados: verbetes.filter(v => v.status === 'Publicado').length,
            rascunhos: verbetes.filter(v => v.status === 'Rascunho').length,
      };

      return (
            <div style={styles.dashboard}>
                  {/* Sidebar */}
                  <aside style={styles.sidebar}>
                        <div style={styles.sidebarLogo}>
                              <Shield size={28} color="#f47c20" />
                              <span style={{ fontWeight: 700, color: '#fff', fontSize: 16 }}>Gênnesis<br /><small style={{ fontWeight: 400, fontSize: 11, opacity: 0.7 }}>Painel Admin</small></span>
                        </div>
                        <nav style={{ marginTop: 32 }}>
                              {[
                                    { icon: <BookOpen size={18} />, label: 'Verbetes', count: totais.todos },
                                    { icon: <Star size={18} />, label: 'Artistas', count: verbetes.filter(v => v.categoria_tipo === 'Cantor').length },
                                    { icon: <Users size={18} />, label: 'Grupos', count: verbetes.filter(v => v.categoria_tipo === 'Grupo').length },
                                    { icon: <Music size={18} />, label: 'Hinos', count: verbetes.filter(v => v.categoria_tipo === 'Hino').length },
                              ].map(item => (
                                    <div key={item.label} style={styles.sidebarItem}>
                                          {item.icon}
                                          <span style={{ flex: 1 }}>{item.label}</span>
                                          <span style={styles.badge}>{item.count}</span>
                                    </div>
                              ))}
                        </nav>
                        <button onClick={onLogout} style={styles.logoutBtn}>
                              <LogOut size={16} /> Sair
                        </button>
                  </aside>

                  {/* Main */}
                  <main style={styles.main}>
                        {/* Header */}
                        <div style={styles.mainHeader}>
                              <div>
                                    <h1 style={{ margin: 0, fontSize: 22, color: '#121539' }}>Gerenciar Verbetes</h1>
                                    <p style={{ margin: '4px 0 0', color: '#888', fontSize: 13 }}>
                                          {totais.publicados} publicados · {totais.rascunhos} rascunhos
                                    </p>
                              </div>
                              <button onClick={() => setTela('novo')} style={styles.newBtn}>
                                    <Plus size={18} /> Novo Verbete
                              </button>
                        </div>

                        {/* Filtros */}
                        <div style={styles.filtros}>
                              {/* Filtro Status */}
                              <div style={{ display: 'flex', gap: 8 }}>
                                    {[['todos', 'Todos'], ['publicados', '✅ Publicados'], ['rascunhos', '📝 Rascunhos']].map(([val, label]) => (
                                          <button key={val} onClick={() => setFiltroStatus(val)}
                                                style={{ ...styles.filterBtn, background: filtroStatus === val ? '#121539' : '#e2e8f0', color: filtroStatus === val ? '#fff' : '#333' }}>
                                                {label}
                                          </button>
                                    ))}
                              </div>
                              {/* Filtro Categoria */}
                              <select style={{ ...styles.input, width: 160, margin: 0 }} value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)}>
                                    <option value="">Todas Categorias</option>
                                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                        </div>

                        {/* Barra Alfabética */}
                        <div style={styles.alfabeto}>
                              <button onClick={() => setFiltroLetra('')} style={{ ...styles.letraBtn, background: !filtroLetra ? '#f47c20' : '#e2e8f0', color: !filtroLetra ? '#fff' : '#333' }}>Todos</button>
                              {alphabet.map(l => (
                                    <button key={l} onClick={() => setFiltroLetra(l === filtroLetra ? '' : l)}
                                          style={{ ...styles.letraBtn, background: filtroLetra === l ? '#f47c20' : '#e2e8f0', color: filtroLetra === l ? '#fff' : '#333' }}>
                                          {l}
                                    </button>
                              ))}
                        </div>

                        {/* Tabela */}
                        {carregando ? (
                              <p style={{ color: '#888', textAlign: 'center', padding: 40 }}>🔄 Carregando verbetes...</p>
                        ) : verbetesFiltrados.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: 60, color: '#aaa' }}>
                                    <BookOpen size={48} style={{ marginBottom: 12, opacity: 0.3 }} />
                                    <p>Nenhum verbete encontrado.</p>
                                    <button onClick={() => setTela('novo')} style={styles.newBtn}>+ Criar o primeiro</button>
                              </div>
                        ) : (
                              <div style={styles.tabela}>
                                    <div style={styles.tabelaHeader}>
                                          <span style={{ flex: 3 }}>Título</span>
                                          <span style={{ flex: 1 }}>Categoria</span>
                                          <span style={{ flex: 1 }}>Status</span>
                                          <span style={{ flex: 1 }}>Atualizado</span>
                                          <span style={{ flex: 1, textAlign: 'right' }}>Ações</span>
                                    </div>
                                    {verbetesFiltrados.map(v => (
                                          <div key={v.id} style={styles.tabelaRow}>
                                                <div style={{ flex: 3 }}>
                                                      <strong style={{ color: '#121539' }}>{v.titulo_formatado || v.titulo}</strong>
                                                      {v.subtitulo && <div style={{ fontSize: 12, color: '#888' }}>{v.subtitulo}</div>}
                                                </div>
                                                <span style={{ flex: 1, fontSize: 13, color: '#555' }}>{v.categoria_tipo}</span>
                                                <span style={{ flex: 1 }}>
                                                      <span style={{
                                                            padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                                            background: v.status === 'Publicado' ? '#C6F6D5' : '#FEFCBF',
                                                            color: v.status === 'Publicado' ? '#276749' : '#7B6400'
                                                      }}>
                                                            {v.status}
                                                      </span>
                                                </span>
                                                <span style={{ flex: 1, fontSize: 12, color: '#aaa' }}>
                                                      {new Date(v.data_atualizacao).toLocaleDateString('pt-BR')}
                                                </span>
                                                <div style={{ flex: 1, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                                                      <button onClick={() => { setVerbeteEditando(v); setTela('editar'); }} style={styles.actionBtn} title="Editar">
                                                            <Edit2 size={15} />
                                                      </button>
                                                      <button onClick={() => excluir(v.id, v.titulo)} style={{ ...styles.actionBtn, background: '#FED7D7', color: '#C53030' }} title="Excluir">
                                                            <Trash2 size={15} />
                                                      </button>
                                                </div>
                                          </div>
                                    ))}
                              </div>
                        )}
                  </main>
            </div>
      );
}

// ─── COMPONENTE RAIZ DO ADMIN ───────────────────────────────────
export default function AdminPanel() {
      const [autenticado, setAutenticado] = useState(false);
      const [senha, setSenha] = useState('');

      const handleLogin = (senhaCorreta) => {
            setSenha(senhaCorreta);
            setAutenticado(true);
      };

      const handleLogout = () => {
            setAutenticado(false);
            setSenha('');
      };

      if (!autenticado) return <LoginScreen onLogin={handleLogin} />;
      return <Dashboard senha={senha} onLogout={handleLogout} />;
}

// ─── ESTILOS INLINE ─────────────────────────────────────────────
const styles = {
      loginOverlay: { minHeight: '100vh', background: 'linear-gradient(135deg, #121539 0%, #1a2060 50%, #f47c20 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
      loginBox: { background: '#fff', borderRadius: 16, padding: '40px 48px', width: '100%', maxWidth: 420, boxShadow: '0 25px 60px rgba(0,0,0,0.3)' },
      loginHeader: { textAlign: 'center' },
      loginBtn: { width: '100%', padding: '14px', background: '#121539', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 16 },
      eyeBtn: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' },
      label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 6, marginTop: 16 },
      input: { width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
      dashboard: { display: 'flex', minHeight: '100vh', background: '#f7f8fc', fontFamily: 'Inter, sans-serif' },
      sidebar: { width: 220, background: '#121539', display: 'flex', flexDirection: 'column', padding: '24px 16px', position: 'sticky', top: 0, height: '100vh' },
      sidebarLogo: { display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 24, borderBottom: '1px solid rgba(255,255,255,0.1)' },
      sidebarItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 10px', color: 'rgba(255,255,255,0.8)', fontSize: 14, borderRadius: 8, marginBottom: 4, cursor: 'pointer' },
      badge: { background: 'rgba(244,124,32,0.8)', color: '#fff', fontSize: 11, padding: '1px 7px', borderRadius: 20, fontWeight: 700 },
      logoutBtn: { marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', padding: '10px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
      main: { flex: 1, padding: '32px 40px', overflowY: 'auto' },
      mainHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
      newBtn: { display: 'flex', alignItems: 'center', gap: 8, background: '#f47c20', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14 },
      filtros: { display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' },
      filterBtn: { padding: '8px 16px', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
      alfabeto: { display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 20 },
      letraBtn: { width: 32, height: 32, border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700 },
      tabela: { background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' },
      tabelaHeader: { display: 'flex', padding: '14px 20px', background: '#f7f8fc', borderBottom: '1px solid #e2e8f0', fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase' },
      tabelaRow: { display: 'flex', padding: '16px 20px', borderBottom: '1px solid #f0f0f0', alignItems: 'center', transition: 'background 0.15s' },
      actionBtn: { display: 'flex', alignItems: 'center', padding: '7px', background: '#EBF8FF', color: '#2B6CB0', border: 'none', borderRadius: 7, cursor: 'pointer' },
      formContainer: { padding: '32px 40px', background: '#f7f8fc', minHeight: '100vh', maxWidth: 900, margin: '0 auto' },
      formHeader: { display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' },
      backBtn: { display: 'flex', alignItems: 'center', gap: 4, background: '#e2e8f0', border: 'none', padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13 },
      statusBtn: { padding: '8px 16px', border: 'none', borderRadius: 20, cursor: 'pointer', fontWeight: 700, fontSize: 13 },
      saveBtn: { display: 'flex', alignItems: 'center', gap: 8, background: '#121539', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 15 },
      cancelBtn: { display: 'flex', alignItems: 'center', gap: 8, background: '#e2e8f0', color: '#333', border: 'none', padding: '14px 20px', borderRadius: 10, cursor: 'pointer', fontSize: 15 },
      grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
};
