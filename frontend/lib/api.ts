import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth API
export const authAPI = {
  signup: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/signup', data),
  
  verify: (token: string) =>
    api.get(`/auth/verify?token=${token}`),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: () =>
    api.post('/auth/logout'),

  me: () =>
    api.get('/auth/me'),
};

// Posts API
export const postsAPI = {
  list: (category?: string, search?: string, sort?: string) =>
    api.get('/posts', { params: { category, search, sort } }),
  
  get: (id: number) =>
    api.get(`/posts/${id}`),
  
  create: (data: { title: string; content_md: string; category: string }) =>
    api.post('/posts', data),
  
  update: (id: number, data: { title?: string; content_md?: string; category?: string }) =>
    api.patch(`/posts/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/posts/${id}`),
};

// Comments API
export const commentsAPI = {
  list: (postId: number) =>
    api.get(`/comments/post/${postId}`),
  
  create: (postId: number, data: { content: string; parent_id?: number }) =>
    api.post(`/comments/post/${postId}`, data),
  
  update: (id: number, data: { content: string }) =>
    api.patch(`/comments/${id}`, data),
  
  delete: (id: number) =>
    api.delete(`/comments/${id}`),
};

// Reactions API
export const reactionsAPI = {
  add: (data: { post_id?: number; comment_id?: number; type: string }) =>
    api.post('/reactions', data),
  
  remove: (data: { post_id?: number; comment_id?: number; type: string }) =>
    api.delete('/reactions', { data }),
  
  getForPost: (postId: number) =>
    api.get(`/reactions/post/${postId}`),
  
  getForComment: (commentId: number) =>
    api.get(`/reactions/comment/${commentId}`),
};

// Media API
export const mediaAPI = {
  upload: (file: File, postId: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('post_id', postId.toString());
    return api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Users API
export const usersAPI = {
  get: (id: number) =>
    api.get(`/users/${id}`),
  
  getPosts: (id: number) =>
    api.get(`/users/${id}/posts`),
  
  getComments: (id: number) =>
    api.get(`/users/${id}/comments`),
};

// Notifications API
export const notificationsAPI = {
  list: () =>
    api.get('/notifications'),
  
  markAsRead: (id: number) =>
    api.post(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.post('/notifications/read-all'),
  
  getUnreadCount: () =>
    api.get('/notifications/unread-count'),
};
