import React, { useState, useEffect } from 'react';
import { Search, LogIn, LogOut, Plus, Edit, Trash2, Eye, Star, UserPlus, CheckCircle, XCircle } from 'lucide-react';

const API_URL = 'https://script.google.com/macros/s/AKfycbxjBTHeBoUXUvJVExM-xcU3v3zVdsAN6k6RUDsw-s6QI1HPMSMX6tN5hdm6pczUZTo/exec';

// ============================================================
// 角色權限判斷
// 核心成員：所有功能
// 協作教師：上傳、下載、編輯自己的影片
// 下載會員：只能下載（含通用帳號）
// ============================================================
const canUpload   = (role: string) => role === '核心成員' || role === '協作教師';
const canDownload = (role: string) => ['核心成員', '協作教師', '下載會員'].includes(role);
const isCoreRole  = (role: string) => role === '核心成員';

// ============================================================
// 主應用程式
// ============================================================
export default function MediaLibraryApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser]   = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState('public');

  useEffect(() => {
    const t = localStorage.getItem('mlToken');
    const u = localStorage.getItem('mlUser');
    if (t && u) { setToken(t); setUser(JSON.parse(u)); setIsLoggedIn(true); }
  }, []);

  const handleLogin = (userData: any, userToken: string) => {
    setUser(userData); setToken(userToken); setIsLoggedIn(true);
    localStorage.setItem('mlToken', userToken);
    localStorage.setItem('mlUser', JSON.stringify(userData));
    // 核心成員直接進管理後台，其他角色留在首頁
    if (isCoreRole(userData.role)) setCurrentView('admin');
    else setCurrentView('public');
  };

  const handleLogout = () => {
    setUser(null); setToken(null); setIsLoggedIn(false);
    localStorage.removeItem('mlToken'); localStorage.removeItem('mlUser');
    setCurrentView('public');
  };

  const isCoreUser = isCoreRole(user?.role);
  const showAdmin  = isLoggedIn && (isCoreUser || canUpload(user?.role));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── 導覽列 ── */}
      <nav className="bg-blue-600 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">媒體素養教學影片資源庫</h1>
          <div className="flex gap-3 items-center">
            <button onClick={() => setCurrentView('public')} className="px-4 py-2 rounded text-white hover:bg-blue-700">
              <Eye className="inline mr-1" size={16} />瀏覽影片
            </button>
            {isLoggedIn ? (
              <>
                {showAdmin && (
                  <button onClick={() => setCurrentView('admin')} className="px-4 py-2 rounded text-white hover:bg-blue-700">
                    {isCoreUser ? '管理後台' : '我的影片'}
                  </button>
                )}
                <div className="text-sm text-right">
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-white/70 text-xs">{user.role}</div>
                </div>
                <button onClick={handleLogout} className="px-4 py-2 rounded text-white bg-red-500 hover:bg-red-600">
                  <LogOut className="inline mr-1" size={16} />登出
                </button>
              </>
            ) : (
              <button onClick={() => setCurrentView('login')} className="px-4 py-2 rounded text-white bg-green-500 hover:bg-green-600">
                <LogIn className="inline mr-1" size={16} />登入 / 申請
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── 主內容 ── */}
      <div className="flex-1 container mx-auto px-4 py-8">
        {currentView === 'login'  && !isLoggedIn && <LoginPage onLogin={handleLogin} apiUrl={API_URL} />}
        {currentView === 'public' && <PublicView apiUrl={API_URL} isLoggedIn={isLoggedIn} userRole={user?.role} />}
        {currentView === 'admin'  && isLoggedIn  && <AdminView apiUrl={API_URL} token={token!} user={user} isCoreUser={isCoreUser} />}
      </div>

      {/* ── 頁尾 ── */}
      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-lg font-semibold">南崁國中媒體素養教師社群</p>
            <p className="text-sm text-gray-400">Nankan Junior High School Media Literacy Community</p>
          </div>
          <div className="text-sm text-gray-400 text-center md:text-right">
            <p>© {new Date().getFullYear()} 版權所有</p>
            <p className="mt-1">致力於推動媒體素養教育</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// 登入 / 申請頁面（切換兩個 Tab）
// ============================================================
function LoginPage({ onLogin, apiUrl }: { onLogin: any; apiUrl: string }) {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  return (
    <div className="max-w-lg mx-auto">
      {/* Tab 切換 */}
      <div className="flex bg-white rounded-t-lg shadow-sm border-b overflow-hidden">
        <button onClick={() => setTab('login')}
          className={`flex-1 py-3 font-medium text-sm transition ${tab === 'login' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
          <LogIn className="inline mr-2" size={16} />成員登入
        </button>
        <button onClick={() => setTab('register')}
          className={`flex-1 py-3 font-medium text-sm transition ${tab === 'register' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
          <UserPlus className="inline mr-2" size={16} />申請加入
        </button>
      </div>

      <div className="bg-white rounded-b-lg shadow-lg p-8">
        {tab === 'login'    ? <LoginForm    onLogin={onLogin} apiUrl={apiUrl} /> : null}
        {tab === 'register' ? <RegisterForm apiUrl={apiUrl} onDone={() => setTab('login')} /> : null}
      </div>
    </div>
  );
}

// ── 登入表單 ──
function LoginForm({ onLogin, apiUrl }: { onLogin: any; apiUrl: string }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const submit = async () => {
    if (!email || !password) { setError('請填寫帳號和密碼'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${apiUrl}?action=login`, { method: 'POST', body: JSON.stringify({ email, password }) });
      const r   = await res.json();
      if (r.statusCode === 200 && r.data.success) onLogin(r.data.user, r.data.token);
      else setError(r.data.error || '登入失敗');
    } catch { setError('網路錯誤，請稍後再試'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">成員登入</h2>
        <p className="text-gray-500 text-sm mt-1">核心成員 · 協作教師 · 下載會員</p>
      </div>

      <div>
        <label className="block text-gray-700 mb-1 text-sm font-medium">帳號（Email）</label>
        <input type="text" value={email} onChange={e => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <div>
        <label className="block text-gray-700 mb-1 text-sm font-medium">密碼</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && submit()}
          placeholder="••••••••"
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

      <button onClick={submit} disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition font-medium">
        {loading ? '登入中...' : '登入'}
      </button>

      <div className="p-3 bg-gray-50 rounded text-xs text-gray-500">
        <p>• <strong>核心成員</strong>：上傳、審核、管理所有影片</p>
        <p>• <strong>協作教師</strong>：上傳影片、下載資源（需申請）</p>
        <p>• <strong>下載會員</strong>：下載資源（需申請或使用通用帳號）</p>
      </div>
    </div>
  );
}

// ── 申請表單 ──
function RegisterForm({ apiUrl, onDone }: { apiUrl: string; onDone: () => void }) {
  // 預設角色固定為「下載會員」
  const [form, setForm] = useState({ name: '', school: '', email: '', password: '', confirm: '' });
  const [message, setMessage] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const s = (k: string) => (e: any) => setForm({ ...form, [k]: e.target.value });

  const submit = async () => {
    if (!form.name || !form.email || !form.password) { setError('請填寫所有必填欄位'); return; }
    if (form.password !== form.confirm) { setError('兩次輸入的密碼不一致'); return; }
    if (form.password.length < 6) { setError('密碼至少 6 個字元'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${apiUrl}?action=register`, {
        method: 'POST',
        body: JSON.stringify({ name: form.name, school: form.school, email: form.email, password: form.password, role: '下載會員' })
      });
      const r = await res.json();
      if (r.statusCode === 200) setMessage(r.data.message);
      else setError(r.data.error || '申請失敗');
    } catch { setError('網路錯誤，請稍後再試'); }
    finally { setLoading(false); }
  };

  if (message) return (
    <div className="text-center space-y-4 py-4">
      <div className="text-5xl">✅</div>
      <h3 className="text-lg font-bold text-green-700">申請成功！</h3>
      <p className="text-gray-600 text-sm">{message}</p>
      <button onClick={onDone} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">返回登入</button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold">申請加入</h2>
        <p className="text-gray-500 text-sm mt-1">送出後等待核心成員審核通過即可登入</p>
      </div>

      {/* 申請後角色說明 */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
        <span className="text-2xl">📥</span>
        <div>
          <p className="font-medium text-blue-800 text-sm">申請通過後成為「下載會員」</p>
          <p className="text-blue-600 text-xs mt-0.5">可下載所有已審核影片的備份資源。如需上傳影片，審核通過後請聯繫核心成員升級帳號。</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">姓名 <span className="text-red-500">*</span></label>
          <input value={form.name} onChange={s('name')} placeholder="王小明"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">學校（選填）</label>
          <input value={form.school} onChange={s('school')} placeholder="某某國中"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
        <input type="email" value={form.email} onChange={s('email')} placeholder="your@email.com"
          className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">密碼 <span className="text-red-500">*</span></label>
          <input type="password" value={form.password} onChange={s('password')} placeholder="至少 6 碼"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">確認密碼 <span className="text-red-500">*</span></label>
          <input type="password" value={form.confirm} onChange={s('confirm')} placeholder="再輸入一次"
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
        </div>
      </div>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

      <button onClick={submit} disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition font-medium">
        {loading ? '送出中...' : '送出申請'}
      </button>
      <p className="text-xs text-gray-400 text-center"><span className="text-red-500">*</span> 為必填欄位</p>
    </div>
  );
}

// ============================================================
// 公開瀏覽頁面
// ============================================================
function PublicView({ apiUrl, isLoggedIn, userRole }: { apiUrl: string; isLoggedIn: boolean; userRole?: string }) {
  const [allVideos, setAllVideos]           = useState<any[]>([]);
  const [videos, setVideos]                 = useState<any[]>([]);
  const [categories, setCategories]         = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword]   = useState('');
  const [loading, setLoading]               = useState(true);
  const [viewMode, setViewMode]             = useState('card');
  const canDL = isLoggedIn && userRole ? canDownload(userRole) : false;

  useEffect(() => { loadCategories(); loadVideos(); }, []);

  const loadCategories = async () => {
    try {
      const r = await (await fetch(`${apiUrl}?action=getCategories`)).json();
      if (r.statusCode === 200) setCategories(r.data.categories || []);
    } catch {}
  };

  const loadVideos = async () => {
    setLoading(true);
    try {
      const r = await (await fetch(`${apiUrl}?action=getVideos`)).json();
      if (r.statusCode === 200) { setAllVideos(r.data.videos); setVideos(r.data.videos); }
    } catch {}
    finally { setLoading(false); }
  };

  const filterByCategory = (cat: string) => {
    setSelectedCategory(cat);
    setVideos(!cat ? allVideos : allVideos.filter(v => {
      return String(v['主題分類'] || '').split(/[,、;]/).map(c => c.trim()).includes(cat);
    }));
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) { filterByCategory(selectedCategory); return; }
    setLoading(true);
    try {
      const r = await (await fetch(`${apiUrl}?action=searchVideos&keyword=${encodeURIComponent(searchKeyword)}`)).json();
      if (r.statusCode === 200) {
        let res = r.data.videos;
        if (selectedCategory) res = res.filter((v: any) => String(v['主題分類'] || '').split(/[,、;]/).map((c: string) => c.trim()).includes(selectedCategory));
        setVideos(res);
      }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <input type="text" placeholder="搜尋影片標題、內容..." value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <button onClick={handleSearch} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">搜尋</button>
        </div>
        <div className="flex gap-2 flex-wrap mb-4">
          <button onClick={() => filterByCategory('')}
            className={`px-4 py-2 rounded ${selectedCategory === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>全部</button>
          {categories.map((cat, i) => (
            <button key={i} onClick={() => filterByCategory(cat)}
              className={`px-4 py-2 rounded ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{cat}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 pt-4 border-t">
          <span className="text-sm text-gray-600 mr-1">檢視模式：</span>
          {[['card','📱 卡片式'],['list','📋 列表式'],['table','📊 表格式']].map(([m,l]) => (
            <button key={m} onClick={() => setViewMode(m)}
              className={`px-3 py-1.5 rounded text-sm ${viewMode === m ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>{l}</button>
          ))}
          <span className="ml-auto text-sm text-gray-500">共 {videos.length} 部影片</span>
        </div>
      </div>

      {loading ? <div className="text-center py-12 text-gray-500">載入中...</div> :
        videos.length === 0 ? <div className="text-center py-12 text-gray-500">沒有找到符合條件的影片</div> : (
        <>
          {viewMode === 'card' && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{videos.map((v,i) => <VideoCard key={i} video={v} canDownload={canDL} />)}</div>}
          {viewMode === 'list' && <div className="space-y-3">{videos.map((v,i) => <VideoListItem key={i} video={v} canDownload={canDL} />)}</div>}
          {viewMode === 'table' && (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>{['影片標題','主題分類','時長','適用階段','操作'].map(h => <th key={h} className="px-4 py-3 text-left text-sm font-medium text-gray-700">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y">{videos.map((v,i) => <VideoTableRow key={i} video={v} canDownload={canDL} />)}</tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function VideoCard({ video, canDownload }: { video: any; canDownload: boolean }) {
  const link = video['影片連結'] || video['YouTube連結'];
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-base flex-1 leading-snug">{video['影片標題']}</h3>
        {video['審核狀態'] === '精選' && <Star className="text-yellow-500 fill-yellow-500 flex-shrink-0 ml-2" size={18} />}
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{video['主題分類']}</span>
        <span className="text-gray-500 text-xs">{video['時長(分鐘)']} 分鐘</span>
        <span className="text-gray-500 text-xs">{video['適用階段']}</span>
      </div>
      <p className="text-gray-600 text-sm mb-3 flex-1 line-clamp-3">{video['內容摘要']}</p>
      <div className="flex gap-2 mt-auto">
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="flex-1 text-center px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">觀看影片</a>
        {canDownload && video['Drive備份連結'] && (
          <a href={video['Drive備份連結']} target="_blank" rel="noopener noreferrer"
            className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">下載</a>
        )}
      </div>
    </div>
  );
}

function VideoListItem({ video, canDownload }: { video: any; canDownload: boolean }) {
  const link = video['影片連結'] || video['YouTube連結'];
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4 flex items-start gap-4">
      <div className="flex-1">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="font-bold text-base">{video['影片標題']}</h3>
          {video['審核狀態'] === '精選' && <Star className="text-yellow-500 fill-yellow-500 flex-shrink-0 mt-0.5" size={16} />}
        </div>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{video['內容摘要']}</p>
        <div className="flex flex-wrap gap-2">
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{video['主題分類']}</span>
          <span className="text-gray-500 text-xs">{video['時長(分鐘)']} 分鐘</span>
          <span className="text-gray-500 text-xs">{video['適用階段']}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-shrink-0">
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 whitespace-nowrap">觀看影片</a>
        {canDownload && video['Drive備份連結'] && (
          <a href={video['Drive備份連結']} target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 whitespace-nowrap">下載備份</a>
        )}
      </div>
    </div>
  );
}

function VideoTableRow({ video, canDownload }: { video: any; canDownload: boolean }) {
  const link = video['影片連結'] || video['YouTube連結'];
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 max-w-xs">
        <div className="flex items-center gap-1">
          <span className="font-medium text-sm">{video['影片標題']}</span>
          {video['審核狀態'] === '精選' && <Star className="text-yellow-500 fill-yellow-500" size={14} />}
        </div>
      </td>
      <td className="px-4 py-3"><span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{video['主題分類']}</span></td>
      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{video['時長(分鐘)']} 分鐘</td>
      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{video['適用階段']}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <a href={link} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">觀看</a>
          {canDownload && video['Drive備份連結'] && (
            <a href={video['Drive備份連結']} target="_blank" rel="noopener noreferrer" className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">下載</a>
          )}
        </div>
      </td>
    </tr>
  );
}

// ============================================================
// 管理後台
// ============================================================
function AdminView({ apiUrl, token, user, isCoreUser }: { apiUrl: string; token: string; user: any; isCoreUser: boolean }) {
  const [activeTab, setActiveTab] = useState(isCoreUser ? 'pending' : 'myVideos');

  const tabs = [
    ...(isCoreUser ? [
      { key: 'pending',    label: '待審影片' },
      { key: 'all',        label: '所有影片' },
      { key: 'members',    label: '👥 會員審核' },
    ] : [
      { key: 'myVideos',   label: '我的影片' },
    ]),
    { key: 'add', label: '＋ 新增影片' },
  ];

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">{isCoreUser ? '管理後台' : '我的影片管理'}</h2>
        <span className="text-gray-500 text-sm">{user.name}（{user.role}）</span>
      </div>
      <div className="bg-white rounded-lg shadow">
        <div className="border-b flex overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-5 py-3 whitespace-nowrap text-sm font-medium transition ${activeTab === t.key ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}>
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === 'add'      && <VideoForm apiUrl={apiUrl} token={token} user={user} />}
          {activeTab === 'pending'  && isCoreUser && <VideoManagement apiUrl={apiUrl} token={token} status="待審" isCoreUser={isCoreUser} userEmail={user.email} />}
          {activeTab === 'all'      && isCoreUser && <VideoManagement apiUrl={apiUrl} token={token} status="all" isCoreUser={isCoreUser} userEmail={user.email} />}
          {activeTab === 'myVideos' && !isCoreUser && <VideoManagement apiUrl={apiUrl} token={token} status="myVideos" isCoreUser={isCoreUser} userEmail={user.email} />}
          {activeTab === 'members'  && isCoreUser && <MemberApproval apiUrl={apiUrl} token={token} />}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 會員審核（核心成員專用）
// ============================================================
function MemberApproval({ apiUrl, token }: { apiUrl: string; token: string }) {
  const [members, setMembers]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [message, setMessage]   = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const r = await (await fetch(`${apiUrl}?action=getPendingMembers&token=${encodeURIComponent(token)}`)).json();
      if (r.statusCode === 200) setMembers(r.data.members || []);
    } catch {}
    finally { setLoading(false); }
  };

  const approve = async (email: string, role: string) => {
    try {
      const r = await (await fetch(`${apiUrl}?action=approveMember`, {
        method: 'POST', body: JSON.stringify({ email, role, token })
      })).json();
      if (r.statusCode === 200) { flash(`✓ 已核准 ${email}`); load(); }
      else flash(`✗ ${r.data.error}`);
    } catch { flash('✗ 網路錯誤'); }
  };

  const reject = async (email: string) => {
    if (!confirm(`確定拒絕 ${email} 的申請嗎？`)) return;
    try {
      const r = await (await fetch(`${apiUrl}?action=rejectMember`, {
        method: 'POST', body: JSON.stringify({ email, token })
      })).json();
      if (r.statusCode === 200) { flash(`已拒絕 ${email}`); load(); }
      else flash(`✗ ${r.data.error}`);
    } catch { flash('✗ 網路錯誤'); }
  };

  const flash = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  if (loading) return <div className="text-center py-8 text-gray-500">載入中...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">待審核會員申請</h3>
        <button onClick={load} className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded text-sm hover:bg-gray-200">重新整理</button>
      </div>

      {message && (
        <div className={`p-3 rounded text-sm ${message.startsWith('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      {members.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <CheckCircle className="mx-auto mb-3 text-green-400" size={48} />
          <p>目前沒有待審核的申請</p>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map((m, i) => (
            <div key={i} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold">{m.name}</span>
                    <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs">{m.role}</span>
                  </div>
                  <p className="text-sm text-gray-600">{m.email}</p>
                  {m.school && <p className="text-sm text-gray-500">{m.school}</p>}
                  {m.applyDate && <p className="text-xs text-gray-400 mt-1">申請日期：{m.applyDate}</p>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => approve(m.email, m.role)}
                    className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 flex items-center gap-1">
                    <CheckCircle size={14} />核准
                  </button>
                  <button onClick={() => reject(m.email)}
                    className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 flex items-center gap-1">
                    <XCircle size={14} />拒絕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 共用影片表單（新增 & 編輯）
// ============================================================
function VideoForm({ apiUrl, token, user, editVideo, onSaved, onCancel }:
  { apiUrl: string; token: string; user?: any; editVideo?: any; onSaved?: () => void; onCancel?: () => void }) {
  const isEdit = !!editVideo;
  const blank = { 影片標題:'', 影片連結:'', 'Drive備份連結':'', 主題分類:'', 次要標籤:'', '時長(分鐘)':'', 適用階段:'', 內容摘要:'', 教學重點:'', 討論問題:'', 推薦老師:'', 評分:'', 備註:'' };

  const [form, setForm]           = useState<any>(isEdit ? { id: editVideo['編號'], 影片標題: editVideo['影片標題']||'', 影片連結: editVideo['影片連結']||editVideo['YouTube連結']||'', 'Drive備份連結': editVideo['Drive備份連結']||'', 主題分類: editVideo['主題分類']||'', 次要標籤: editVideo['次要標籤']||'', '時長(分鐘)': editVideo['時長(分鐘)']||'', 適用階段: editVideo['適用階段']||'', 內容摘要: editVideo['內容摘要']||'', 教學重點: editVideo['教學重點']||'', 討論問題: editVideo['討論問題']||'', 推薦老師: editVideo['推薦老師']||'', 評分: editVideo['評分']||'', 備註: editVideo['備註']||'' } : blank);
  const [grades, setGrades]       = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags]           = useState<string[]>([]);
  const [message, setMessage]     = useState('');
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}?action=getCategories`).then(r => r.json()).then(r => {
      if (r.statusCode === 200) { setGrades(r.data.grades||[]); setCategories(r.data.categories||[]); setTags(r.data.tags||[]); }
    }).catch(() => {});
  }, [apiUrl]);

  // 多選勾選工具
  const toggle = (key: string, val: string, sep = '、') => {
    const arr = (form[key]||'').split(sep).map((s:string)=>s.trim()).filter(Boolean);
    const next = arr.includes(val) ? arr.filter((s:string)=>s!==val) : [...arr, val];
    setForm({ ...form, [key]: next.join(sep) });
  };
  const isChecked = (key: string, val: string, sep = '、') =>
    (form[key]||'').split(sep).map((s:string)=>s.trim()).includes(val);

  const CheckGroup = ({ fieldKey, options, color = 'blue' }: { fieldKey: string; options: string[]; color?: string }) => (
    <div className="flex flex-wrap gap-2 p-3 border rounded bg-white min-h-[48px]">
      {options.length === 0
        ? <span className="text-xs text-gray-400">載入中…</span>
        : options.map((opt, i) => {
            const checked = isChecked(fieldKey, opt);
            return (
              <label key={i} className="flex items-center gap-1.5 cursor-pointer select-none">
                <input type="checkbox" checked={checked} onChange={() => toggle(fieldKey, opt)}
                  className={`w-4 h-4 rounded border-gray-300 text-${color}-600 focus:ring-${color}-500 cursor-pointer`} />
                <span className={`text-sm px-2 py-0.5 rounded transition ${checked ? `bg-${color}-100 text-${color}-800 font-medium` : 'text-gray-700'}`}>{opt}</span>
              </label>
            );
          })
      }
    </div>
  );

  const inp = (label: string, key: string, req=false, placeholder='', type='text') => (
    <div>
      <label className="block text-gray-700 mb-1 font-medium text-sm">{label}{req && <span className="text-red-500 ml-0.5">*</span>}</label>
      <input type={type} value={form[key]} placeholder={placeholder} onChange={e => setForm({...form, [key]: e.target.value})}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
    </div>
  );
  const ta = (label: string, key: string, req=false, rows=4) => (
    <div>
      <label className="block text-gray-700 mb-1 font-medium text-sm">{label}{req && <span className="text-red-500 ml-0.5">*</span>}</label>
      <textarea value={form[key]} rows={rows} onChange={e => setForm({...form, [key]: e.target.value})}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
    </div>
  );

  const handleSubmit = async () => {
    setLoading(true); setMessage('');
    const required = ['影片標題','影片連結','主題分類','時長(分鐘)','適用階段','內容摘要','教學重點','討論問題'];
    for (const f of required) { if (!form[f]) { setMessage(`⚠️ ${f} 為必填欄位`); setLoading(false); return; } }
    const body: any = { ...form, '時長(分鐘)': Number(form['時長(分鐘)']), token };
    if (!isEdit && user) { body['推薦老師'] = form['推薦老師']||user.name; body['上傳者Email'] = user.email; body['審核狀態'] = '待審'; }
    try {
      const r = await (await fetch(`${apiUrl}?action=${isEdit?'updateVideo':'addVideo'}`, { method:'POST', body:JSON.stringify(body) })).json();
      if (r.statusCode === 200) {
        setMessage(isEdit ? '✓ 更新成功！' : '✓ 新增成功！待核心成員審核後公開。');
        if (!isEdit) setForm(blank);
        if (onSaved) setTimeout(onSaved, 1500);
      } else { setMessage(`✗ ${r.data.error}`); }
    } catch { setMessage('✗ 網路錯誤，請稍後再試'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4 max-w-4xl">
      {isEdit && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">✏️ 編輯影片</h3>
          {onCancel && <button onClick={onCancel} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm">取消</button>}
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h4 className="font-bold">📹 影片基本資訊</h4>
        {inp('影片標題', '影片標題', true, '請輸入影片標題')}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            {inp('影片連結', '影片連結', true, 'https://www.youtube.com/watch?v=...', 'url')}
            <p className="text-xs text-gray-400 mt-1">支援 YouTube、Vimeo 等各平台</p>
          </div>
          {inp('Drive 備份連結（選填）', 'Drive備份連結', false, 'https://drive.google.com/...', 'url')}
        </div>
        {inp('時長（分鐘）', '時長(分鐘)', true, '例如：8', 'number')}

        <div>
          <label className="block text-gray-700 mb-1 font-medium text-sm">
            主題分類<span className="text-red-500 ml-0.5">*</span>
            {form['主題分類'] && <span className="ml-2 text-blue-600 font-normal text-xs">已選：{form['主題分類']}</span>}
          </label>
          <CheckGroup fieldKey="主題分類" options={categories} color="blue" />
        </div>

        <div>
          <label className="block text-gray-700 mb-1 font-medium text-sm">
            次要標籤（選填）
            {form['次要標籤'] && <span className="ml-2 text-purple-600 font-normal text-xs">已選：{form['次要標籤']}</span>}
          </label>
          <CheckGroup fieldKey="次要標籤" options={tags} color="purple" />
        </div>

        <div>
          <label className="block text-gray-700 mb-1 font-medium text-sm">
            適用階段<span className="text-red-500 ml-0.5">*</span>
            {form['適用階段'] && <span className="ml-2 text-green-600 font-normal text-xs">已選：{form['適用階段']}</span>}
          </label>
          <CheckGroup fieldKey="適用階段" options={grades.length > 0 ? grades : ['國小','國中','高中']} color="green" />
          {grades.length === 0 && <p className="text-xs text-gray-400 mt-1">※ 從分類設定 F 欄載入，目前顯示預設值</p>}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h4 className="font-bold">📚 教學內容</h4>
        {ta('內容摘要', '內容摘要', true, 4)}
        {ta('教學重點', '教學重點', true, 4)}
        {ta('討論問題', '討論問題', true, 4)}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h4 className="font-bold">📝 其他資訊</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {inp('推薦老師（選填）', '推薦老師', false, '例如：沈老師')}
          {inp('評分（選填 1-5）', '評分', false, '1 ~ 5', 'number')}
        </div>
        {ta('備註（選填）', '備註', false, 2)}
      </div>

      {message && (
        <div className={`p-3 rounded text-sm font-medium ${message.startsWith('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      <div className="flex gap-3">
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition">
          {loading ? '處理中...' : isEdit ? '✓ 儲存修改' : '✓ 新增影片'}
        </button>
        {onCancel && <button onClick={onCancel} className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600">取消</button>}
      </div>
      <p className="text-xs text-gray-400"><span className="text-red-500">*</span> 為必填欄位</p>
    </div>
  );
}

// ============================================================
// 影片管理列表
// ============================================================
function VideoManagement({ apiUrl, token, status, isCoreUser, userEmail }:
  { apiUrl: string; token: string; status: string; isCoreUser: boolean; userEmail: string }) {
  const [videos, setVideos]         = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [message, setMessage]       = useState('');
  const [editingVideo, setEditingVideo] = useState<any>(null);

  useEffect(() => { load(); }, [status]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await (await fetch(`${apiUrl}?action=getVideos&includeAll=true`)).json();
      if (r.statusCode === 200) {
        let list = r.data.videos;
        if (status === 'myVideos') list = list.filter((v:any) => v['上傳者Email'] === userEmail);
        else if (status !== 'all') list = list.filter((v:any) => v['審核狀態'] === status);
        setVideos(list);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const changeStatus = async (video: any, newStatus: string) => {
    try {
      const r = await (await fetch(`${apiUrl}?action=updateStatus`, { method:'POST', body:JSON.stringify({ id: video['編號'], status: newStatus, token }) })).json();
      if (r.statusCode === 200) { flash(`✓ 已將「${video['影片標題']}」設為 ${newStatus}`); load(); }
      else flash(`✗ ${r.data.error}`);
    } catch { flash('✗ 網路錯誤'); }
  };

  const deleteVideo = async (video: any) => {
    if (!confirm(`確定要刪除「${video['影片標題']}」嗎？`)) return;
    try {
      const r = await (await fetch(`${apiUrl}?action=deleteVideo`, { method:'POST', body:JSON.stringify({ id: video['編號'], token }) })).json();
      if (r.statusCode === 200) { flash(`✓ 已刪除`); load(); }
      else flash(`✗ ${r.data.error}`);
    } catch { flash('✗ 網路錯誤'); }
  };

  const flash = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  if (loading) return <div className="text-center py-8 text-gray-500">載入中...</div>;
  if (editingVideo) return <VideoForm apiUrl={apiUrl} token={token} editVideo={editingVideo} onSaved={() => { setEditingVideo(null); load(); }} onCancel={() => setEditingVideo(null)} />;

  return (
    <div className="space-y-4">
      {message && <div className={`p-3 rounded text-sm ${message.startsWith('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message}</div>}
      {videos.length === 0
        ? <div className="text-center text-gray-500 py-12">{status === 'myVideos' ? '您還沒有上傳任何影片' : `目前沒有${status === 'all' ? '' : status}影片`}</div>
        : videos.map((v, i) => (
          <AdminVideoCard key={i} video={v} isCoreUser={isCoreUser} userEmail={userEmail}
            onStatusChange={changeStatus} onEdit={() => setEditingVideo(v)} onDelete={deleteVideo} />
        ))
      }
    </div>
  );
}

// ============================================================
// 管理後台影片卡片
// ============================================================
function AdminVideoCard({ video, isCoreUser, userEmail, onStatusChange, onEdit, onDelete }:
  { video: any; isCoreUser: boolean; userEmail: string; onStatusChange: any; onEdit: any; onDelete: any }) {
  const [busy, setBusy] = useState(false);
  const canEdit   = isCoreUser || video['上傳者Email'] === userEmail;
  const canDelete = isCoreUser || video['上傳者Email'] === userEmail;
  const link      = video['影片連結'] || video['YouTube連結'];
  const cs = async (s: string) => { setBusy(true); await onStatusChange(video, s); setBusy(false); };
  const statusColor = video['審核狀態']==='精選' ? 'bg-yellow-100 text-yellow-800' : video['審核狀態']==='通過' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700';

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold mb-1 truncate">{video['影片標題']}</h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{video['內容摘要']}</p>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{video['主題分類']}</span>
            <span className="text-gray-500 text-xs">{video['時長(分鐘)']} 分鐘</span>
            <span className="text-gray-500 text-xs">{video['適用階段']}</span>
            {video['推薦老師'] && <span className="text-gray-400 text-xs">上傳：{video['推薦老師']}</span>}
          </div>
          <div className="flex gap-3 text-xs">
            {link && <a href={link} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:underline">影片連結</a>}
            {video['Drive備份連結'] && <a href={video['Drive備份連結']} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline">Drive 備份</a>}
          </div>
        </div>
        <div className="flex flex-col gap-2 flex-shrink-0 items-end">
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>{video['審核狀態']}</span>
          {isCoreUser && (
            <div className="flex flex-col gap-1">
              {video['審核狀態'] === '待審' && <button onClick={() => cs('通過')} disabled={busy} className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50">通過</button>}
              {video['審核狀態'] === '通過' && <button onClick={() => cs('精選')} disabled={busy} className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 disabled:opacity-50">設為精選</button>}
              {(video['審核狀態'] === '通過' || video['審核狀態'] === '精選') && <button onClick={() => cs('待審')} disabled={busy} className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 disabled:opacity-50">退回待審</button>}
            </div>
          )}
          <div className="flex flex-col gap-1">
            {canEdit   && <button onClick={onEdit}           className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1"><Edit size={12}/>編輯</button>}
            {canDelete && <button onClick={() => onDelete(video)} className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 flex items-center gap-1"><Trash2 size={12}/>刪除</button>}
          </div>
        </div>
      </div>
    </div>
  );
}
