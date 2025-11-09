import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = Cookies.get('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });
          const { access } = response.data;
          Cookies.set('access_token', access);
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        } catch (refreshError) {
          Cookies.remove('access_token');
          Cookies.remove('refresh_token');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);

export interface User {
  id: number;
  email: string;
  username: string;
  role: 'student' | 'instructor';
}

export interface Course {
  id: number;
  title: string;
  description: string;
  instructor: User;
  created_at: string;
  updated_at: string;
}

export interface Chapter {
  id: number;
  course: number;
  course_title?: string;
  title: string;
  content: any;
  visibility: 'public' | 'private';
  order: number;
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: number;
  student: User;
  course: Course;
  enrolled_at: string;
}

export const authAPI = {
  register: async (data: { email: string; username: string; password: string; password2: string; role: string }) => {
    const response = await api.post('/register/', data);
    if (response.data.access) {
      Cookies.set('access_token', response.data.access);
      Cookies.set('refresh_token', response.data.refresh);
    }
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post('/login/', { email, password });
    if (response.data.access) {
      Cookies.set('access_token', response.data.access);
      Cookies.set('refresh_token', response.data.refresh);
    }
    return response.data;
  },
  logout: () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
  },
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const token = Cookies.get('access_token');
      if (!token) return null;
      return null;
    } catch {
      return null;
    }
  },
};

export const coursesAPI = {
  list: async (): Promise<Course[]> => {
    const response = await api.get('/courses/');
    return response.data.results || response.data;
  },
  get: async (id: number): Promise<Course> => {
    const response = await api.get(`/courses/${id}/`);
    return response.data;
  },
  create: async (data: { title: string; description: string }): Promise<Course> => {
    const response = await api.post('/courses/', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Course>): Promise<Course> => {
    const response = await api.put(`/courses/${id}/`, data);
    return response.data;
  },
  join: async (id: number): Promise<void> => {
    await api.post(`/courses/${id}/join/`);
  },
  getChapters: async (id: number): Promise<Chapter[]> => {
    const response = await api.get(`/courses/${id}/chapters/`);
    return response.data;
  },
};

export const chaptersAPI = {
  list: async (): Promise<Chapter[]> => {
    const response = await api.get('/chapters/');
    return response.data.results || response.data;
  },
  get: async (id: number): Promise<Chapter> => {
    const response = await api.get(`/chapters/${id}/`);
    return response.data;
  },
  create: async (data: { course: number; title: string; content: any; visibility: string; order?: number }): Promise<Chapter> => {
    const response = await api.post('/chapters/', data);
    return response.data;
  },
  update: async (id: number, data: Partial<Chapter>): Promise<Chapter> => {
    const response = await api.put(`/chapters/${id}/`, data);
    return response.data;
  },
  delete: async (id: number): Promise<void> => {
    await api.delete(`/chapters/${id}/`);
  },
};

export const enrollmentsAPI = {
  list: async (): Promise<Enrollment[]> => {
    const response = await api.get('/enrollments/');
    return response.data.results || response.data;
  },
};

export default api;

