import React, { useState, useEffect } from 'react';
import { Search, Filter, LogIn, LogOut, Plus, Edit, Trash2, Eye, Star } from 'lucide-react';

// ============================================
// 設定 API 網址（部署後要改成你的網址）
// ============================================
const API_URL = 'https://script.google.com/macros/s/AKfycbxjBTHeBoUXUvJVExM-xcU3v3zVdsAN6k6RUDsw-s6QI1HPMSMX6tN5hdm6pczUZTo/exec';

// ============================================
// 主應用程式
// ============================================
export default function MediaLibraryApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [currentView, setCurrentView] = useState('public'); // public, admin, login
  
  // 檢查是否已登入（從 localStorage 讀取）
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);
  
  const handleLogin = (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    setIsLoggedIn(true);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // 根據角色決定導向
    if (userData.role === '核心成員') {
      setCurrentView('admin');
    } else {
      setCurrentView('public');
    }
  };
  
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('public');
  };
  
  // 判斷是否為核心成員
  const isCoreUser = user?.role === '核心成員';
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 導覽列 */}
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">媒體素養教學影片資源庫</h1>
            <div className="flex gap-4 items-center">
              <button
                onClick={() => setCurrentView('public')}
                className="px-4 py-2 rounded hover:bg-blue-700"
              >
                <Eye className="inline mr-2" size={18} />
                瀏覽影片
              </button>
              {isLoggedIn ? (
                <>
                  {isCoreUser && (
                    <button
                      onClick={() => setCurrentView('admin')}
                      className="px-4 py-2 rounded hover:bg-blue-700"
                    >
                      管理後台
                    </button>
                  )}
                  <div className="text-sm">
                    <div className="text-white/80">{user.name}</div>
                    <div className="text-white/60 text-xs">{user.role}</div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded bg-red-500 hover:bg-red-600"
                  >
                    <LogOut className="inline mr-2" size={18} />
                    登出
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setCurrentView('login')}
                  className="px-4 py-2 rounded bg-green-500 hover:bg-green-600"
                >
                  <LogIn className="inline mr-2" size={18} />
                  成員登入
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      {/* 主要內容 */}
      <div className="container mx-auto px-4 py-8">
        {currentView === 'login' && !isLoggedIn && (
          <LoginPage onLogin={handleLogin} apiUrl={API_URL} />
        )}
        {currentView === 'public' && (
          <PublicView apiUrl={API_URL} isLoggedIn={isLoggedIn} />
        )}
        {currentView === 'admin' && isLoggedIn && isCoreUser && (
          <AdminView apiUrl={API_URL} token={token} user={user} />
        )}
        {currentView === 'admin' && isLoggedIn && !isCoreUser && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded">
            <p className="font-medium">⚠️ 權限不足</p>
            <p className="text-sm">您的帳號為「{user.role}」，僅能瀏覽和下載影片，無法進入管理後台。</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// 登入頁面
// ============================================
function LoginPage({ onLogin, apiUrl }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`${apiUrl}?action=login`, {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      const result = await response.json();
      
      if (result.statusCode === 200 && result.data.success) {
        onLogin(result.data.user, result.data.token);
      } else {
        setError(result.data.error || '登入失敗');
      }
    } catch (err) {
      setError('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-2 text-center">成員登入</h2>
      <p className="text-center text-gray-600 mb-6 text-sm">
        核心成員可管理影片 · 協作教師可下載資源
      </p>
      
      <div className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">密碼</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
        </div>
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
            {error}
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? '登入中...' : '登入'}
        </button>
        
        <div className="mt-4 p-4 bg-gray-50 rounded text-sm">
          <p className="font-medium text-gray-700 mb-2">👥 成員類型說明：</p>
          <ul className="space-y-1 text-gray-600">
            <li>• <strong>核心成員</strong>：可上傳、審核、下載影片</li>
            <li>• <strong>協作教師</strong>：可瀏覽、下載影片資源</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ============================================
// 公開瀏覽頁面
// ============================================
function PublicView({ apiUrl, isLoggedIn = false }) {
  const [videos, setVideos] = useState([]);
  const [allVideos, setAllVideos] = useState([]); // 儲存所有影片
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('card'); // card, list, table
  
  useEffect(() => {
    loadCategories();
    loadVideos();
  }, []);
  
  const loadCategories = async () => {
    try {
      const response = await fetch(`${apiUrl}?action=getCategories`);
      const result = await response.json();
      if (result.statusCode === 200) {
        setCategories(result.data.categories);
      }
    } catch (err) {
      console.error('載入分類失敗', err);
    }
  };
  
  const loadVideos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}?action=getVideos`);
      const result = await response.json();
      if (result.statusCode === 200) {
        setAllVideos(result.data.videos);
        setVideos(result.data.videos);
      }
    } catch (err) {
      console.error('載入影片失敗', err);
    } finally {
      setLoading(false);
    }
  };
  
  // 修改分類篩選邏輯，支援多分類（用逗號或頓號分隔）
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    if (!category) {
      setVideos(allVideos);
    } else {
      const filtered = allVideos.filter(video => {
        const videoCategories = video['主題分類'] || '';
        // 支援逗號、頓號、分號分隔
        const categories = videoCategories.split(/[,、;]/).map(c => c.trim());
        return categories.includes(category);
      });
      setVideos(filtered);
    }
  };
  
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      handleCategoryChange(selectedCategory);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}?action=searchVideos&keyword=${encodeURIComponent(searchKeyword)}`
      );
      const result = await response.json();
      if (result.statusCode === 200) {
        let searchResults = result.data.videos;
        
        // 如果有選擇分類，再進行分類篩選（支援多分類）
        if (selectedCategory) {
          searchResults = searchResults.filter(video => {
            const videoCategories = video['主題分類'] || '';
            const categories = videoCategories.split(/[,、;]/).map(c => c.trim());
            return categories.includes(selectedCategory);
          });
        }
        
        setVideos(searchResults);
      }
    } catch (err) {
      console.error('搜尋失敗', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {/* 搜尋和篩選 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="搜尋影片標題、內容..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            搜尋
          </button>
        </div>
        
        {/* 分類篩選 */}
        <div className="flex gap-2 flex-wrap mb-4">
          <button
            onClick={() => handleCategoryChange('')}
            className={`px-4 py-2 rounded ${
              selectedCategory === '' ? 'bg-blue-600 text-white' : 'bg-gray-200'
            }`}
          >
            全部
          </button>
          {categories.map((cat, index) => (
            <button
              key={index}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded ${
                selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        
        {/* 檢視模式切換 */}
        <div className="flex items-center gap-2 pt-4 border-t">
          <span className="text-sm text-gray-600 mr-2">檢視模式：</span>
          <button
            onClick={() => setViewMode('card')}
            className={`px-3 py-1.5 rounded text-sm ${
              viewMode === 'card' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            📱 卡片式
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded text-sm ${
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            📋 列表式
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1.5 rounded text-sm ${
              viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            📊 表格式
          </button>
          <span className="text-sm text-gray-500 ml-auto">
            共 {videos.length} 部影片
          </span>
        </div>
      </div>
      
      {/* 影片列表 */}
      {loading ? (
        <div className="text-center py-12">載入中...</div>
      ) : (
        <>
          {/* 卡片式檢視 */}
          {viewMode === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video, index) => (
                <VideoCard key={index} video={video} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          )}
          
          {/* 列表式檢視 */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {videos.map((video, index) => (
                <VideoListItem key={index} video={video} isLoggedIn={isLoggedIn} />
              ))}
            </div>
          )}
          
          {/* 表格式檢視 */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">影片標題</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">分類</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">時長</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">年級</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {videos.map((video, index) => (
                      <VideoTableRow key={index} video={video} isLoggedIn={isLoggedIn} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
      
      {!loading && videos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          沒有找到符合條件的影片
        </div>
      )}
    </div>
  );
}

// 列表式檢視項目
function VideoListItem({ video, isLoggedIn = false }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition p-4">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-lg">{video['影片標題']}</h3>
            {video['審核狀態'] === '精選' && (
              <Star className="text-yellow-500 fill-yellow-500 flex-shrink-0 ml-2" size={20} />
            )}
          </div>
          <p className="text-gray-700 text-sm mb-2 line-clamp-2">{video['內容摘要']}</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {video['主題分類']}
            </span>
            <span className="text-gray-500">{video['時長(分鐘)']} 分鐘</span>
            <span className="text-gray-500">{video['適用年級']}</span>
          </div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <a
            href={video['影片連結'] || video['YouTube連結']}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 whitespace-nowrap"
          >
            觀看影片
          </a>
          {isLoggedIn && video['Drive備份連結'] && (
            <a
              href={video['Drive備份連結']}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 whitespace-nowrap"
            >
              下載
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// 表格式檢視行
function VideoTableRow({ video, isLoggedIn = false }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{video['影片標題']}</span>
          {video['審核狀態'] === '精選' && (
            <Star className="text-yellow-500 fill-yellow-500" size={16} />
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{video['內容摘要']}</p>
      </td>
      <td className="px-4 py-3">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
          {video['主題分類']}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
        {video['時長(分鐘)']} 分鐘
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">
        {video['適用年級']}
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <a
            href={video['影片連結'] || video['YouTube連結']}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 whitespace-nowrap"
          >
            觀看
          </a>
          {isLoggedIn && video['Drive備份連結'] && (
            <a
              href={video['Drive備份連結']}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 whitespace-nowrap"
            >
              下載
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}

// 影片卡片 - 管理後台專用（包含審核功能）
function AdminVideoCard({ video, onStatusChange, onEdit, onDelete }) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    await onStatusChange(video, newStatus);
    setIsUpdating(false);
  };
  
  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">{video['影片標題']}</h3>
          <p className="text-sm text-gray-600 mb-2">{video['內容摘要']}</p>
          <div className="flex gap-2 mb-2">
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {video['主題分類']}
            </span>
            <span className="text-gray-500 text-sm">{video['時長(分鐘)']} 分鐘</span>
            <span className="text-gray-500 text-sm">{video['適用年級']}</span>
          </div>
          <div className="flex gap-2 text-sm">
            <a
              href={video['影片連結'] || video['YouTube連結']}
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-600 hover:underline"
            >
              影片連結
            </a>
            {video['Drive備份連結'] && (
              <>
                <span className="text-gray-400">|</span>
                <a
                  href={video['Drive備份連結']}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  Drive 備份
                </a>
              </>
            )}
          </div>
        </div>
        
        <div className="ml-4 flex flex-col gap-2">
          <span className={`px-3 py-1 rounded text-sm text-center ${
            video['審核狀態'] === '精選' ? 'bg-yellow-100 text-yellow-800' :
            video['審核狀態'] === '通過' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {video['審核狀態']}
          </span>
          
          {/* 審核按鈕 */}
          <div className="flex flex-col gap-1">
            {video['審核狀態'] !== '通過' && (
              <button
                onClick={() => handleStatusChange('通過')}
                disabled={isUpdating}
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:bg-gray-400"
              >
                通過
              </button>
            )}
            {video['審核狀態'] !== '精選' && video['審核狀態'] === '通過' && (
              <button
                onClick={() => handleStatusChange('精選')}
                disabled={isUpdating}
                className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 disabled:bg-gray-400"
              >
                設為精選
              </button>
            )}
            {video['審核狀態'] !== '待審' && (
              <button
                onClick={() => handleStatusChange('待審')}
                disabled={isUpdating}
                className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 disabled:bg-gray-400"
              >
                退回待審
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 影片卡片
function VideoCard({ video, isLoggedIn = false }) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition p-4">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-bold text-lg flex-1">{video['影片標題']}</h3>
        {video['審核狀態'] === '精選' && (
          <Star className="text-yellow-500 fill-yellow-500" size={20} />
        )}
      </div>
      <div className="text-sm text-gray-600 mb-2">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
          {video['主題分類']}
        </span>
        <span className="text-gray-500">{video['時長(分鐘)']} 分鐘</span>
      </div>
      <p className="text-gray-700 text-sm mb-3">{video['內容摘要']}</p>
      <div className="flex justify-between items-center flex-wrap gap-2">
        <span className="text-xs text-gray-500">{video['適用年級']}</span>
        <div className="flex gap-2">
          <a
            href={video['影片連結'] || video['YouTube連結']}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            觀看影片
          </a>
          {isLoggedIn && video['Drive備份連結'] && (
            <a
              href={video['Drive備份連結']}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
            >
              下載備份
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// 管理後台
// ============================================
function AdminView({ apiUrl, token, user }) {
  const [activeTab, setActiveTab] = useState('pending');
  
  return (
    <div>
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">管理後台</h2>
          <span className="text-gray-600">歡迎，{user.name}</span>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="border-b flex">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 ${activeTab === 'pending' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            待審核影片
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            所有影片
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`px-6 py-3 ${activeTab === 'add' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            <Plus className="inline mr-2" size={18} />
            新增影片
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'add' && <AddVideoView apiUrl={apiUrl} token={token} />}
          {activeTab === 'pending' && <VideoManagement apiUrl={apiUrl} token={token} status="待審" />}
          {activeTab === 'all' && <VideoManagement apiUrl={apiUrl} token={token} status="all" />}
        </div>
      </div>
    </div>
  );
}

interface AddVideoViewProps {
  apiUrl: string;
  token: string;
}

// 新增影片介面（完整版，對應所有 Google Sheets 欄位）
function AddVideoView({ apiUrl, token }: AddVideoViewProps) {
  const [formData, setFormData] = useState({
    影片標題: '',
    影片連結: '',
    'Drive備份連結': '',
    主題分類: '',
    次要標籤: '',
    '時長(分鐘)': '',
    適用年級: '',
    內容摘要: '',
    教學重點: '',
    討論問題: '',
    推薦老師: '',
    評分: '',
    備註: '',
    審核狀態: '待審'
  });
  
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    
    // 驗證必填欄位
    const required = ['影片標題', '影片連結', '主題分類', '時長(分鐘)', '適用年級', '內容摘要', '教學重點', '討論問題'];
    for (let field of required) {
      if (!formData[field]) {
        setMessage(`${field} 為必填欄位`);
        setLoading(false);
        return;
      }
    }
    
    try {
      const response = await fetch(`${apiUrl}?action=addVideo`, {
        method: 'POST',
        body: JSON.stringify({ 
          ...formData, 
          '時長(分鐘)': Number(formData['時長(分鐘)']),
          token 
        })
      });
      
      const result = await response.json();
      if (result.statusCode === 200) {
        setMessage('✓ 影片新增成功！');
        // 重置表單
        setFormData({
          '影片標題': '',
          '影片連結': '',
          'Drive備份連結': '',
          '主題分類': '',
          '次要標籤': '',
          '時長(分鐘)': '',
          '適用年級': '',
          '內容摘要': '',
          '教學重點': '',
          '討論問題': '',
          '推薦老師': '',
          '評分': '',
          '備註': '',
          '審核狀態': '待審'
        });
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`✗ 錯誤：${result.data.error}`);
      }
    } catch (err) {
      setMessage('✗ 網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4 max-w-4xl">
      {/* 基本資訊 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-4">📹 影片基本資訊</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              影片標題 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData['影片標題']}
              onChange={(e) => setFormData({ ...formData, '影片標題': e.target.value })}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="請輸入影片標題"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                影片連結 <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData['影片連結']}
                onChange={(e) => setFormData({ ...formData, '影片連結': e.target.value })}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：https://www.youtube.com/watch?v=..."
              />
              <p className="text-xs text-gray-500 mt-1">支援 YouTube、Vimeo 等平台</p>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Drive 備份連結（選填）
              </label>
              <input
                type="url"
                value={formData['Drive備份連結']}
                onChange={(e) => setFormData({ ...formData, 'Drive備份連結': e.target.value })}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://drive.google.com/file/d/..."
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                時長(分鐘) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={formData['時長(分鐘)']}
                onChange={(e) => setFormData({ ...formData, '時長(分鐘)': e.target.value })}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：8"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                主題分類 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData['主題分類']}
                onChange={(e) => setFormData({ ...formData, '主題分類': e.target.value })}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：網路交友"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                次要標籤（選填）
              </label>
              <input
                type="text"
                value={formData['次要標籤']}
                onChange={(e) => setFormData({ ...formData, '次要標籤': e.target.value })}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：街頭訪問"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              適用年級 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData['適用年級']}
              onChange={(e) => setFormData({ ...formData, '適用年級': e.target.value })}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="例如：國中、高中"
            />
          </div>
        </div>
      </div>
      
      {/* 教學內容 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-4">📚 教學內容</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              內容摘要 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData['內容摘要']}
              onChange={(e) => setFormData({ ...formData, '內容摘要': e.target.value })}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="請簡述影片內容..."
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              教學重點 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData['教學重點']}
              onChange={(e) => setFormData({ ...formData, '教學重點': e.target.value })}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="請列出主要教學重點..."
            />
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              討論問題 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData['討論問題']}
              onChange={(e) => setFormData({ ...formData, '討論問題': e.target.value })}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="請提供討論問題..."
            />
          </div>
        </div>
      </div>
      
      {/* 其他資訊 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-bold text-lg mb-4">📝 其他資訊</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                推薦老師（選填）
              </label>
              <input
                type="text"
                value={formData['推薦老師']}
                onChange={(e) => setFormData({ ...formData, '推薦老師': e.target.value })}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="例如：沈老師"
              />
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                評分（選填，1-5分）
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={formData['評分']}
                onChange={(e) => setFormData({ ...formData, '評分': e.target.value })}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1-5"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              備註（選填）
            </label>
            <textarea
              value={formData['備註']}
              onChange={(e) => setFormData({ ...formData, '備註': e.target.value })}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={2}
              placeholder="其他補充說明..."
            />
          </div>
        </div>
      </div>
      
      {/* 訊息顯示 */}
      {message && (
        <div className={`p-4 rounded-lg font-medium ${message.includes('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      
      {/* 提交按鈕 */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition"
      >
        {loading ? '新增中...' : '✓ 新增影片'}
      </button>
      
      <p className="text-sm text-gray-500 text-center">
        <span className="text-red-500">*</span> 為必填欄位
      </p>
    </div>
  );
}

// 影片管理列表
function VideoManagement({ apiUrl, token, status }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  useEffect(() => {
    loadVideos();
  }, [status]);
  
  const loadVideos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}?action=getVideos&includeAll=true`);
      const result = await response.json();
      if (result.statusCode === 200) {
        let filtered = result.data.videos;
        if (status !== 'all') {
          filtered = filtered.filter(v => v['審核狀態'] === status);
        }
        setVideos(filtered);
      }
    } catch (err) {
      console.error('載入失敗', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (video, newStatus) => {
    try {
      const response = await fetch(`${apiUrl}?action=updateStatus`, {
        method: 'POST',
        body: JSON.stringify({
          id: video['編號'],
          status: newStatus,
          token: token
        })
      });
      
      const result = await response.json();
      if (result.statusCode === 200) {
        setMessage(`✓ 已將「${video['影片標題']}」設為${newStatus}`);
        setTimeout(() => setMessage(''), 3000);
        loadVideos(); // 重新載入
      } else {
        setMessage(`✗ 更新失敗：${result.data.error}`);
      }
    } catch (err) {
      setMessage('✗ 網路錯誤，請稍後再試');
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">載入中...</div>;
  }
  
  return (
    <div className="space-y-4">
      {message && (
        <div className={`p-3 rounded ${message.includes('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      
      {videos.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          目前沒有{status === 'all' ? '' : status}影片
        </div>
      ) : (
        videos.map((video, index) => (
          <AdminVideoCard
            key={index}
            video={video}
            onStatusChange={handleStatusChange}
            onEdit={() => {}}
            onDelete={() => {}}
          />
        ))
      )}
    </div>
  );
}
