import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ==================== Community ====================
export const getPosts = (params?: { category?: string; sort?: string; page?: number; pageSize?: number }) =>
  api.get('/community/posts', { params });

export const getPostDetail = (id: string) => api.get(`/community/posts/${id}`);

export const createPost = (data: { title: string; content: string; category: string }) =>
  api.post('/community/posts', data);

export const deletePost = (id: string) => api.delete(`/community/posts/${id}`);

export const createComment = (postId: string, content: string) =>
  api.post(`/community/posts/${postId}/comments`, { content });

export const toggleLike = (postId: string) => api.post(`/community/posts/${postId}/like`);

export const toggleFavorite = (postId: string) => api.post(`/community/posts/${postId}/favorite`);

export const getFavorites = () => api.get('/community/favorites');

export const getRankings = (period?: string) => api.get('/community/rankings', { params: { period } });

export const getMyPosts = () => api.get('/community/my-posts');

// ==================== Joint Activity ====================
export const getJointActivity = () => api.get('/knowledge/joint-activity');

export default api;
