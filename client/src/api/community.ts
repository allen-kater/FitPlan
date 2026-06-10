import client from './client';

// ==================== Community ====================
export const getPosts = (params?: { category?: string; sort?: string; page?: number; pageSize?: number }) =>
  client.get('/community/posts', { params });

export const getPostDetail = (id: string) => client.get(`/community/posts/${id}`);

export const createPost = (data: { title: string; content: string; category: string }) =>
  client.post('/community/posts', data);

export const deletePost = (id: string) => client.delete(`/community/posts/${id}`);

export const createComment = (postId: string, content: string) =>
  client.post(`/community/posts/${postId}/comments`, { content });

export const toggleLike = (postId: string) => client.post(`/community/posts/${postId}/like`);

export const toggleFavorite = (postId: string) => client.post(`/community/posts/${postId}/favorite`);

export const getFavorites = () => client.get('/community/favorites');

export const getRankings = (period?: string) => client.get('/community/rankings', { params: { period } });

export const getMyPosts = () => client.get('/community/my-posts');

export default client;
