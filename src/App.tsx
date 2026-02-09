import React, { useState, useEffect } from 'react';
import { Search, LogIn, LogOut, Plus, Eye, Star } from 'lucide-react';

const API_URL = 'https://script.google.com/macros/s/AKfycbxjBTHeBoUXUvJVExM-xcU3v3zVdsAN6k6RUDsw-s6QI1HPMSMX6tN5hdm6pczUZTo/exec';

interface User {
  name: string;
  email: string;
  role: string;
}

interface Video {
  編號: number;
  影片標題: string;
  'YouTube連結': string;
  'Drive備份連結': string;
  主題分類: string;
  次要標籤: string;
  '時長(分鐘)': number;
  適用年級: string;
  內容摘要: string;
  教學重點: string;
  討論問題: string;
  推薦老師: string;
  上傳日期: string;
  審核狀態: string;
  使用次數: number;
  評分: number;
  備註: string;
}

export default function MediaLibraryApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState('public');
  
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
  }, []);
  
  const handleLogin = (userData: User, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    setIsLoggedIn(true);
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setCurrentView('admin');
  };
  
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentView('public');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">媒體素養教學影片資源庫</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentView('public')}
                className="px-4 py-2 rounded hover:bg-blue-700"
              >
                <Eye className="inline mr-2" size={18} />
                瀏覽影片
              </button>
              {isLoggedIn ? (
                <>
                  <button
                    onClick={() => setCurrentView('admin')}
                    className="px-4 py-2 rounded hover:bg-blue-700"
                  >
                    管理後台
                  </button>
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
                  核心成員登入
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      
      <div className="container mx-auto px-4 py-8">
        {currentView === 'login' && !isLoggedIn && (
          <LoginPage onLogin={handleLogin} apiUrl={API_URL} />
        )}
        {currentView === 'public' && (
          <PublicView apiUrl={API_URL} />
        )}
        {currentView === 'admin' && isLoggedIn && user && token && (
          <AdminView apiUrl={API_URL} token={token} user={user} />
        )}
      </div>
    </div>
  );
}

interface LoginPageProps {
  onLogin: (userData: User, userToken: string) => void;
  apiUrl: string;
}

function LoginPage({ onLogin, apiUrl }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
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
      <h2 className="text-2xl font-bold mb-6 text-center">核心成員登入</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">密碼</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        {error && (
          <div className="p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? '登入中...' : '登入'}
        </button>
      </form>
    </div>
  );
}

interface PublicViewProps {
  apiUrl: string;
}

function PublicView({ apiUrl }: PublicViewProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  
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
  
  const loadVideos = async (category: string = '') => {
    setLoading(true);
    try {
      let url = `${apiUrl}?action=getVideos`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      
      const response = await fetch(url);
      const result = await response.json();
      if (result.statusCode === 200) {
        setVideos(result.data.videos);
      }
    } catch (err) {
      console.error('載入影片失敗', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    loadVideos(category);
  };
  
  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      loadVideos(selectedCategory);
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}?action=searchVideos&keyword=${encodeURIComponent(searchKeyword)}`
      );
      const result = await response.json();
      if (result.statusCode === 200) {
        setVideos(result.data.videos);
      }
    } catch (err) {
      console.error('搜尋失敗', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
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
        
        <div className="flex gap-2 flex-wrap">
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
      </div>
      
      {loading ? (
        <div className="text-center py-12">載入中...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => (
            <VideoCard key={index} video={video} />
          ))}
        </div>
      )}
      
      {!loading && videos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          沒有找到符合條件的影片
        </div>
      )}
    </div>
  );
}

interface VideoCardProps {
  video: Video;
}

function VideoCard({ video }: VideoCardProps) {
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
<div className="flex justify-between items-center">
  <span className="text-xs text-gray-500">{video['適用年級']}</span>
  
    href={video['YouTube連結']}
    target="_blank"
    rel="noopener noreferrer"
    className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
  >
    觀看影片
  </a>
</div>
    </div>
  );
}

interface AdminViewProps {
  apiUrl: string;
  token: string;
  user: User;
}

function AdminView({ apiUrl, token, user }: AdminViewProps) {
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
          {activeTab === 'pending' && <VideoManagement apiUrl={apiUrl} status="待審" />}
          {activeTab === 'all' && <VideoManagement apiUrl={apiUrl} status="all" />}
        </div>
      </div>
    </div>
  );
}

interface AddVideoViewProps {
  apiUrl: string;
  token: string;
}

function AddVideoView({ apiUrl, token }: AddVideoViewProps) {
  const [formData, setFormData] = useState({
    影片標題: '',
    YouTube連結: '',
    主題分類: '',
    '時長(分鐘)': '',
    適用年級: '',
    內容摘要: '',
    教學重點: '',
    討論問題: '',
    審核狀態: '待審'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');
    
    const required = ['影片標題', 'YouTube連結', '主題分類', '時長(分鐘)', '適用年級', '內容摘要'];
    for (let field of required) {
      if (!formData[field as keyof typeof formData]) {
        setMessage(`${field} 為必填欄位`);
        setLoading(false);
        return;
      }
    }
    
    try {
      const response = await fetch(`${apiUrl}?action=addVideo`, {
        method: 'POST',
        body: JSON.stringify({ ...formData, token })
      });
      
      const result = await response.json();
      if (result.statusCode === 200) {
        setMessage('影片新增成功！');
        setFormData({
          影片標題: '',
          YouTube連結: '',
          主題分類: '',
          '時長(分鐘)': '',
          適用年級: '',
          內容摘要: '',
          教學重點: '',
          討論問題: '',
          審核狀態: '待審'
        });
      } else {
        setMessage(`錯誤：${result.data.error}`);
      }
    } catch (err) {
      setMessage('網路錯誤，請稍後再試');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-gray-700 mb-2">影片標題 *</label>
        <input
          type="text"
          value={formData.影片標題}
          onChange={(e) => setFormData({ ...formData, 影片標題: e.target.value })}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-gray-700 mb-2">YouTube連結 *</label>
        <input
          type="url"
          value={formData.YouTube連結}
          onChange={(e) => setFormData({ ...formData, YouTube連結: e.target.value })}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-700 mb-2">時長(分鐘) *</label>
          <input
            type="number"
            min="1"
            max="120"
            value={formData['時長(分鐘)']}
            onChange={(e) => setFormData({ ...formData, '時長(分鐘)': e.target.value })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 mb-2">主題分類 *</label>
          <input
            type="text"
            value={formData.主題分類}
            onChange={(e) => setFormData({ ...formData, 主題分類: e.target.value })}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例如：網路霸凌"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-gray-700 mb-2">適用年級 *</label>
        <input
          type="text"
          value={formData.適用年級}
          onChange={(e) => setFormData({ ...formData, 適用年級: e.target.value })}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="例如：國中, 高中"
        />
      </div>
      
      <div>
        <label className="block text-gray-700 mb-2">內容摘要 *</label>
        <textarea
          value={formData.內容摘要}
          onChange={(e) => setFormData({ ...formData, 內容摘要: e.target.value })}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
      </div>
      
      <div>
        <label className="block text-gray-700 mb-2">教學重點</label>
        <textarea
          value={formData.教學重點}
          onChange={(e) => setFormData({ ...formData, 教學重點: e.target.value })}
          className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>
      
      {message && (
        <div className={`p-3 rounded ${message.includes('成功') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}
      
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? '新增中...' : '新增影片'}
      </button>
    </div>
  );
}

interface VideoManagementProps {
  apiUrl: string;
  status: string;
}

function VideoManagement({ apiUrl, status }: VideoManagementProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  
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
          filtered = filtered.filter((v: Video) => v['審核狀態'] === status);
        }
        setVideos(filtered);
      }
    } catch (err) {
      console.error('載入失敗', err);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">載入中...</div>;
  }
  
  return (
    <div className="space-y-4">
      {videos.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          目前沒有{status === 'all' ? '' : status}影片
        </div>
      ) : (
        videos.map((video, index) => (
          <div key={index} className="border rounded p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-bold text-lg">{video['影片標題']}</h3>
                <p className="text-sm text-gray-600 mt-1">{video['內容摘要']}</p>
                <div className="mt-2 text-sm">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                    {video['主題分類']}
                  </span>
                  <span className="text-gray-500">{video['時長(分鐘)']} 分鐘</span>
                </div>
              </div>
              <div className="ml-4">
                <span className={`px-3 py-1 rounded text-sm ${
                  video['審核狀態'] === '精選' ? 'bg-yellow-100 text-yellow-800' :
                  video['審核狀態'] === '通過' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {video['審核狀態']}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
