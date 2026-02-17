import React, { useState, useEffect } from 'react';
import { Search, LogIn, LogOut, Plus, Edit, Trash2, Eye, Star } from 'lucide-react';

const API_URL = 'https://script.google.com/macros/s/AKfycbxjBTHeBoUXUvJVExM-xcU3v3zVdsAN6k6RUDsw-s6QI1HPMSMX6tN5hdm6pczUZTo/exec';

// ============================================================
// 主應用程式
// ============================================================
export default function MediaLibraryApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState('public');

  useEffect(() => {
    const savedToken = localStorage.getItem('mlToken');
    const savedUser  = localStorage.getItem('mlUser');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (userData: any, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    setIsLoggedIn(true);
    localStorage.setItem('mlToken', userToken);
    localStorage.setItem('mlUser', JSON.stringify(userData));
    setCurrentView(userData.role === '核心成員' ? 'admin' : 'public');
  };

  const handleLogout = () => {
    setUser(null); setToken(null); setIsLoggedIn(false);
    localStorage.removeItem('mlToken');
    localStorage.removeItem('mlUser');
    setCurrentView('public');
  };

  const isCoreUser = user?.role === '核心成員';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── 導覽列 ── */}
      <nav className="bg-blue-600 shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">媒體素養教學影片資源庫</h1>
          <div className="flex gap-3 items-center">
            <button onClick={() => setCurrentView('public')}
              className="px-4 py-2 rounded text-white hover:bg-blue-700">
              <Eye className="inline mr-1" size={16} />瀏覽影片
            </button>
            {isLoggedIn ? (
              <>
                <button onClick={() => setCurrentView('admin')}
                  className="px-4 py-2 rounded text-white hover:bg-blue-700">
                  {isCoreUser ? '管理後台' : '我的影片'}
                </button>
                <div className="text-sm">
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-white/70 text-xs">{user.role}</div>
                </div>
                <button onClick={handleLogout}
                  className="px-4 py-2 rounded text-white bg-red-500 hover:bg-red-600">
                  <LogOut className="inline mr-1" size={16} />登出
                </button>
              </>
            ) : (
              <button onClick={() => setCurrentView('login')}
                className="px-4 py-2 rounded text-white bg-green-500 hover:bg-green-600">
                <LogIn className="inline mr-1" size={16} />成員登入
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ── 主內容 ── */}
      <div className="flex-1 container mx-auto px-4 py-8">
        {currentView === 'login' && !isLoggedIn && (
          <LoginPage onLogin={handleLogin} apiUrl={API_URL} />
        )}
        {currentView === 'public' && (
          <PublicView apiUrl={API_URL} isLoggedIn={isLoggedIn} />
        )}
        {currentView === 'admin' && isLoggedIn && (
          <AdminView apiUrl={API_URL} token={token!} user={user} isCoreUser={isCoreUser} />
        )}
      </div>

      {/* ── 頁尾 ── */}
      <footer className="bg-gray-800 text-white py-6 mt-auto">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-lg font-semibold">南崁國中媒體素養教師社群</p>
            <p className="text-sm text-gray-400">Nankan Junior High School Media Literacy Community</p>
          </div>
          <div className="text-center md:text-right text-sm text-gray-400">
            <p>© {new Date().getFullYear()} 版權所有</p>
            <p className="mt-1">致力於推動媒體素養教育</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================================
// 登入頁面
// ============================================================
function LoginPage({ onLogin, apiUrl }: { onLogin: any; apiUrl: string }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) { setError('請填寫 Email 和密碼'); return; }
    setLoading(true); setError('');
    try {
      const res    = await fetch(`${apiUrl}?action=login`, { method: 'POST', body: JSON.stringify({ email, password }) });
      const result = await res.json();
      if (result.statusCode === 200 && result.data.success) {
        onLogin(result.data.user, result.data.token);
      } else {
        setError(result.data.error || '登入失敗');
      }
    } catch { setError('網路錯誤，請稍後再試'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-1 text-center">成員登入</h2>
      <p className="text-center text-gray-500 text-sm mb-6">核心成員可管理影片 · 協作教師可上傳及下載資源</p>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-1 font-medium">Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div>
          <label className="block text-gray-700 mb-1 font-medium">密碼</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && handleSubmit()}
            placeholder="••••••••"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}
        <button onClick={handleSubmit} disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition">
          {loading ? '登入中...' : '登入'}
        </button>
        <div className="p-4 bg-gray-50 rounded text-sm text-gray-600">
          <p className="font-medium mb-1">👥 成員類型說明：</p>
          <p>• <strong>核心成員</strong>：可上傳、審核、編輯、下載</p>
          <p>• <strong>協作教師</strong>：可上傳、下載（需核心成員審核後公開）</p>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 公開瀏覽頁面
// ============================================================
function PublicView({ apiUrl, isLoggedIn }: { apiUrl: string; isLoggedIn: boolean }) {
  const [allVideos, setAllVideos]           = useState<any[]>([]);
  const [videos, setVideos]                 = useState<any[]>([]);
  const [categories, setCategories]         = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword]   = useState('');
  const [loading, setLoading]               = useState(true);
  const [viewMode, setViewMode]             = useState('card');

  useEffect(() => { loadCategories(); loadVideos(); }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch(`${apiUrl}?action=getCategories`);
      const r   = await res.json();
      if (r.statusCode === 200) setCategories(r.data.categories || []);
    } catch {}
  };

  const loadVideos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}?action=getVideos`);
      const r   = await res.json();
      if (r.statusCode === 200) { setAllVideos(r.data.videos); setVideos(r.data.videos); }
    } catch {}
    finally { setLoading(false); }
  };

  const filterByCategory = (cat: string) => {
    setSelectedCategory(cat);
    setVideos(!cat ? allVideos : allVideos.filter(v => {
      const cats = String(v['主題分類'] || '').split(/[,、;]/).map(c => c.trim());
      return cats.includes(cat);
    }));
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) { filterByCategory(selectedCategory); return; }
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}?action=searchVideos&keyword=${encodeURIComponent(searchKeyword)}`);
      const r   = await res.json();
      if (r.statusCode === 200) {
        let results = r.data.videos;
        if (selectedCategory) {
          results = results.filter((v: any) => {
            const cats = String(v['主題分類'] || '').split(/[,、;]/).map((c: string) => c.trim());
            return cats.includes(selectedCategory);
          });
        }
        setVideos(results);
      }
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div>
      {/* 搜尋 + 分類 + 檢視切換 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1 relative">
            <input type="text" placeholder="搜尋影片標題、內容..." value={searchKeyword}
              onChange={e => setSearchKeyword(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
          </div>
          <button onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">搜尋</button>
        </div>

        <div className="flex gap-2 flex-wrap mb-4">
          <button onClick={() => filterByCategory('')}
            className={`px-4 py-2 rounded ${selectedCategory === '' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
            全部
          </button>
          {categories.map((cat, i) => (
            <button key={i} onClick={() => filterByCategory(cat)}
              className={`px-4 py-2 rounded ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pt-4 border-t">
          <span className="text-sm text-gray-600 mr-1">檢視模式：</span>
          {(['card', 'list', 'table'] as const).map((m, i) => (
            <button key={m} onClick={() => setViewMode(m)}
              className={`px-3 py-1.5 rounded text-sm ${viewMode === m ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {['📱 卡片式', '📋 列表式', '📊 表格式'][i]}
            </button>
          ))}
          <span className="ml-auto text-sm text-gray-500">共 {videos.length} 部影片</span>
        </div>
      </div>

      {/* 影片內容 */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">載入中...</div>
      ) : videos.length === 0 ? (
        <div className="text-center py-12 text-gray-500">沒有找到符合條件的影片</div>
      ) : (
        <>
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v, i) => <VideoCard key={i} video={v} isLoggedIn={isLoggedIn} />)}
            </div>
          )}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {videos.map((v, i) => <VideoListItem key={i} video={v} isLoggedIn={isLoggedIn} />)}
            </div>
          )}
          {viewMode === 'table' && (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {['影片標題', '主題分類', '時長', '適用階段', '操作'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-sm font-medium text-gray-700">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {videos.map((v, i) => <VideoTableRow key={i} video={v} isLoggedIn={isLoggedIn} />)}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function VideoCard({ video, isLoggedIn }: { video: any; isLoggedIn: boolean }) {
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
        {isLoggedIn && video['Drive備份連結'] && (
          <a href={video['Drive備份連結']} target="_blank" rel="noopener noreferrer"
            className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700">下載</a>
        )}
      </div>
    </div>
  );
}

function VideoListItem({ video, isLoggedIn }: { video: any; isLoggedIn: boolean }) {
  const link = video['影片連結'] || video['YouTube連結'];
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4 flex items-start gap-4">
      <div className="flex-1">
        <div className="flex items-start gap-2 mb-1">
          <h3 className="font-bold text-base leading-snug">{video['影片標題']}</h3>
          {video['審核狀態'] === '精選' && <Star className="text-yellow-500 fill-yellow-500 flex-shrink-0 mt-0.5" size={16} />}
        </div>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{video['內容摘要']}</p>
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{video['主題分類']}</span>
          <span className="text-gray-500 text-xs">{video['時長(分鐘)']} 分鐘</span>
          <span className="text-gray-500 text-xs">{video['適用階段']}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2 flex-shrink-0">
        <a href={link} target="_blank" rel="noopener noreferrer"
          className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 whitespace-nowrap">觀看影片</a>
        {isLoggedIn && video['Drive備份連結'] && (
          <a href={video['Drive備份連結']} target="_blank" rel="noopener noreferrer"
            className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 whitespace-nowrap">下載備份</a>
        )}
      </div>
    </div>
  );
}

function VideoTableRow({ video, isLoggedIn }: { video: any; isLoggedIn: boolean }) {
  const link = video['影片連結'] || video['YouTube連結'];
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 max-w-xs">
        <div className="flex items-center gap-1">
          <span className="font-medium text-gray-900 text-sm">{video['影片標題']}</span>
          {video['審核狀態'] === '精選' && <Star className="text-yellow-500 fill-yellow-500" size={14} />}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">{video['主題分類']}</span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{video['時長(分鐘)']} 分鐘</td>
      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{video['適用階段']}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <a href={link} target="_blank" rel="noopener noreferrer"
            className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">觀看</a>
          {isLoggedIn && video['Drive備份連結'] && (
            <a href={video['Drive備份連結']} target="_blank" rel="noopener noreferrer"
              className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">下載</a>
          )}
        </div>
      </td>
    </tr>
  );
}

// ============================================================
// 管理後台
// ============================================================
function AdminView({ apiUrl, token, user, isCoreUser }:
  { apiUrl: string; token: string; user: any; isCoreUser: boolean }) {
  const [activeTab, setActiveTab] = useState(isCoreUser ? 'pending' : 'myVideos');

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
        <h2 className="text-xl font-bold">{isCoreUser ? '管理後台' : '我的影片管理'}</h2>
        <span className="text-gray-500 text-sm">歡迎，{user.name}（{user.role}）</span>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b flex overflow-x-auto">
          {isCoreUser && (
            <button onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 whitespace-nowrap text-sm ${activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600'}`}>
              待審核影片
            </button>
          )}
          {isCoreUser && (
            <button onClick={() => setActiveTab('all')}
              className={`px-6 py-3 whitespace-nowrap text-sm ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600'}`}>
              所有影片
            </button>
          )}
          {!isCoreUser && (
            <button onClick={() => setActiveTab('myVideos')}
              className={`px-6 py-3 whitespace-nowrap text-sm ${activeTab === 'myVideos' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600'}`}>
              我上傳的影片
            </button>
          )}
          <button onClick={() => setActiveTab('add')}
            className={`px-6 py-3 whitespace-nowrap text-sm ${activeTab === 'add' ? 'border-b-2 border-blue-600 text-blue-600 font-medium' : 'text-gray-600'}`}>
            <Plus className="inline mr-1" size={16} />新增影片
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'add' && <VideoForm apiUrl={apiUrl} token={token} user={user} />}
          {activeTab === 'pending' && isCoreUser && (
            <VideoManagement apiUrl={apiUrl} token={token} status="待審" isCoreUser={isCoreUser} userEmail={user.email} />
          )}
          {activeTab === 'all' && isCoreUser && (
            <VideoManagement apiUrl={apiUrl} token={token} status="all" isCoreUser={isCoreUser} userEmail={user.email} />
          )}
          {activeTab === 'myVideos' && !isCoreUser && (
            <VideoManagement apiUrl={apiUrl} token={token} status="myVideos" isCoreUser={isCoreUser} userEmail={user.email} />
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 共用影片表單（新增 & 編輯 都用這個）
// ============================================================
function VideoForm({ apiUrl, token, user, editVideo, onSaved, onCancel }:
  { apiUrl: string; token: string; user?: any; editVideo?: any; onSaved?: () => void; onCancel?: () => void }) {

  const isEdit = !!editVideo;

  const blank = {
    影片標題: '', 影片連結: '', 'Drive備份連結': '',
    主題分類: '', 次要標籤: '', '時長(分鐘)': '',
    適用階段: '', 內容摘要: '', 教學重點: '',
    討論問題: '', 推薦老師: '', 評分: '', 備註: ''
  };

  const [form, setForm] = useState<any>(isEdit ? {
    id: editVideo['編號'],
    影片標題: editVideo['影片標題'] || '',
    影片連結: editVideo['影片連結'] || editVideo['YouTube連結'] || '',
    'Drive備份連結': editVideo['Drive備份連結'] || '',
    主題分類: editVideo['主題分類'] || '',
    次要標籤: editVideo['次要標籤'] || '',
    '時長(分鐘)': editVideo['時長(分鐘)'] || '',
    適用階段: editVideo['適用階段'] || '',
    內容摘要: editVideo['內容摘要'] || '',
    教學重點: editVideo['教學重點'] || '',
    討論問題: editVideo['討論問題'] || '',
    推薦老師: editVideo['推薦老師'] || '',
    評分: editVideo['評分'] || '',
    備註: editVideo['備註'] || ''
  } : blank);

  const [grades, setGrades]   = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${apiUrl}?action=getCategories`)
      .then(r => r.json())
      .then(r => { if (r.statusCode === 200) setGrades(r.data.grades || []); })
      .catch(() => {});
  }, [apiUrl]);

  const set = (key: string) => (e: any) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async () => {
    setLoading(true); setMessage('');
    const required = ['影片標題', '影片連結', '主題分類', '時長(分鐘)', '適用階段', '內容摘要', '教學重點', '討論問題'];
    for (const f of required) {
      if (!form[f]) { setMessage(`⚠️ ${f} 為必填欄位`); setLoading(false); return; }
    }

    const action = isEdit ? 'updateVideo' : 'addVideo';
    const body: any = {
      ...form,
      '時長(分鐘)': Number(form['時長(分鐘)']),
      token
    };
    if (!isEdit && user) {
      body['推薦老師'] = form['推薦老師'] || user.name;
      body['上傳者Email'] = user.email;
      body['審核狀態'] = '待審';
    }

    try {
      const res    = await fetch(`${apiUrl}?action=${action}`, { method: 'POST', body: JSON.stringify(body) });
      const result = await res.json();
      if (result.statusCode === 200) {
        setMessage(isEdit ? '✓ 影片更新成功！' : '✓ 影片新增成功！送出後需等待核心成員審核。');
        if (!isEdit) setForm(blank);
        if (onSaved) setTimeout(onSaved, 1500);
      } else {
        setMessage(`✗ ${result.data.error}`);
      }
    } catch { setMessage('✗ 網路錯誤，請稍後再試'); }
    finally { setLoading(false); }
  };

  const inp = (label: string, key: string, req = false, placeholder = '', type = 'text') => (
    <div>
      <label className="block text-gray-700 mb-1 font-medium text-sm">
        {label}{req && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input type={type} value={form[key]} placeholder={placeholder} onChange={set(key)}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
    </div>
  );

  const ta = (label: string, key: string, req = false, rows = 4) => (
    <div>
      <label className="block text-gray-700 mb-1 font-medium text-sm">
        {label}{req && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <textarea value={form[key]} rows={rows} onChange={set(key)}
        className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
    </div>
  );

  return (
    <div className="space-y-4 max-w-4xl">
      {isEdit && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">✏️ 編輯影片</h3>
          {onCancel && (
            <button onClick={onCancel} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 text-sm">
              取消編輯
            </button>
          )}
        </div>
      )}

      {/* 基本資訊 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-bold mb-3">📹 影片基本資訊</h4>
        <div className="space-y-3">
          {inp('影片標題', '影片標題', true, '請輸入影片標題')}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              {inp('影片連結', '影片連結', true, 'https://www.youtube.com/watch?v=...', 'url')}
              <p className="text-xs text-gray-400 mt-1">支援 YouTube、Vimeo 等各平台</p>
            </div>
            {inp('Drive 備份連結（選填）', 'Drive備份連結', false, 'https://drive.google.com/...', 'url')}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {inp('時長（分鐘）', '時長(分鐘)', true, '例如：8', 'number')}
            {inp('主題分類', '主題分類', true, '例如：網路交友')}
            {inp('次要標籤（選填）', '次要標籤', false, '例如：街頭訪問')}
          </div>
          <div>
            <label className="block text-gray-700 mb-2 font-medium text-sm">
              適用階段<span className="text-red-500 ml-0.5">*</span>
              {form['適用階段'] && (
                <span className="ml-2 text-blue-600 font-normal text-xs">已選：{form['適用階段']}</span>
              )}
            </label>
            <div className="flex flex-wrap gap-3 p-3 border rounded bg-white">
              {(grades.length > 0 ? grades : ['國小', '國中', '高中']).map((g, i) => {
                const selected = (form['適用階段'] || '').split('、').map((s: string) => s.trim()).filter(Boolean);
                const isChecked = selected.includes(g);
                const toggle = () => {
                  const next = isChecked
                    ? selected.filter((s: string) => s !== g)
                    : [...selected, g];
                  setForm({ ...form, '適用階段': next.join('、') });
                };
                return (
                  <label key={i} className="flex items-center gap-2 cursor-pointer select-none">
                    <input type="checkbox" checked={isChecked} onChange={toggle}
                      className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer" />
                    <span className={`text-sm px-2 py-0.5 rounded transition ${isChecked ? 'bg-blue-100 text-blue-800 font-medium' : 'text-gray-700'}`}>
                      {g}
                    </span>
                  </label>
                );
              })}
            </div>
            {grades.length === 0 && (
              <p className="text-xs text-gray-400 mt-1">※ 選項從分類設定 F 欄載入，目前顯示預設值</p>
            )}
          </div>
        </div>
      </div>

      {/* 教學內容 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-bold mb-3">📚 教學內容</h4>
        <div className="space-y-3">
          {ta('內容摘要', '內容摘要', true, 4)}
          {ta('教學重點', '教學重點', true, 4)}
          {ta('討論問題', '討論問題', true, 4)}
        </div>
      </div>

      {/* 其他 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-bold mb-3">📝 其他資訊</h4>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {inp('推薦老師（選填）', '推薦老師', false, '例如：沈老師')}
            {inp('評分（選填 1-5）', '評分', false, '1 ~ 5', 'number')}
          </div>
          {ta('備註（選填）', '備註', false, 2)}
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded font-medium text-sm ${message.startsWith('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition">
          {loading ? '處理中...' : isEdit ? '✓ 儲存修改' : '✓ 新增影片'}
        </button>
        {onCancel && (
          <button onClick={onCancel}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition">
            取消
          </button>
        )}
      </div>
      <p className="text-xs text-gray-400"><span className="text-red-500">*</span> 為必填欄位</p>
    </div>
  );
}

// ============================================================
// 影片管理列表（核心成員 / 協作教師 共用）
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
      const res = await fetch(`${apiUrl}?action=getVideos&includeAll=true`);
      const r   = await res.json();
      if (r.statusCode === 200) {
        let list: any[] = r.data.videos;
        if (status === 'myVideos') {
          list = list.filter(v => v['上傳者Email'] === userEmail);
        } else if (status !== 'all') {
          list = list.filter(v => v['審核狀態'] === status);
        }
        setVideos(list);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const changeStatus = async (video: any, newStatus: string) => {
    try {
      const res = await fetch(`${apiUrl}?action=updateStatus`, {
        method: 'POST', body: JSON.stringify({ id: video['編號'], status: newStatus, token })
      });
      const r = await res.json();
      if (r.statusCode === 200) { flash(`✓ 已將「${video['影片標題']}」設為${newStatus}`); load(); }
      else flash(`✗ ${r.data.error}`);
    } catch { flash('✗ 網路錯誤'); }
  };

  const deleteVideo = async (video: any) => {
    if (!confirm(`確定要刪除「${video['影片標題']}」嗎？`)) return;
    try {
      const res = await fetch(`${apiUrl}?action=deleteVideo`, {
        method: 'POST', body: JSON.stringify({ id: video['編號'], token })
      });
      const r = await res.json();
      if (r.statusCode === 200) { flash(`✓ 已刪除「${video['影片標題']}」`); load(); }
      else flash(`✗ ${r.data.error}`);
    } catch { flash('✗ 網路錯誤'); }
  };

  const flash = (msg: string) => { setMessage(msg); setTimeout(() => setMessage(''), 3000); };

  if (loading) return <div className="text-center py-8 text-gray-500">載入中...</div>;

  if (editingVideo) return (
    <VideoForm
      apiUrl={apiUrl} token={token}
      editVideo={editingVideo}
      onSaved={() => { setEditingVideo(null); load(); }}
      onCancel={() => setEditingVideo(null)}
    />
  );

  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded text-sm ${message.startsWith('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      {videos.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          {status === 'myVideos' ? '您還沒有上傳任何影片' : `目前沒有${status === 'all' ? '' : status}影片`}
        </div>
      ) : (
        videos.map((v, i) => (
          <AdminVideoCard key={i} video={v}
            isCoreUser={isCoreUser} userEmail={userEmail}
            onStatusChange={changeStatus}
            onEdit={() => setEditingVideo(v)}
            onDelete={deleteVideo} />
        ))
      )}
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

  const statusColor = video['審核狀態'] === '精選'
    ? 'bg-yellow-100 text-yellow-800'
    : video['審核狀態'] === '通過'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-700';

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

          {/* 審核按鈕（核心成員專屬） */}
          {isCoreUser && (
            <div className="flex flex-col gap-1">
              {video['審核狀態'] === '待審' && (
                <button onClick={() => cs('通過')} disabled={busy}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 disabled:opacity-50">通過</button>
              )}
              {video['審核狀態'] === '通過' && (
                <button onClick={() => cs('精選')} disabled={busy}
                  className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 disabled:opacity-50">設為精選</button>
              )}
              {(video['審核狀態'] === '通過' || video['審核狀態'] === '精選') && (
                <button onClick={() => cs('待審')} disabled={busy}
                  className="px-3 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 disabled:opacity-50">退回待審</button>
              )}
            </div>
          )}

          {/* 編輯 / 刪除 */}
          <div className="flex flex-col gap-1">
            {canEdit && (
              <button onClick={onEdit}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 flex items-center gap-1">
                <Edit size={12} />編輯
              </button>
            )}
            {canDelete && (
              <button onClick={() => onDelete(video)}
                className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 flex items-center gap-1">
                <Trash2 size={12} />刪除
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
