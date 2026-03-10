import axios from 'axios';

const API_URL = 'http://127.0.0.1:5002/api';

// Create Axios Instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add Token to requests
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const authAPI = {
    login: (username, password) => api.post('/auth/login', { username, password }),
    register: (userData) => api.post('/auth/register', userData),
    verifyMfa: (userId, code) => api.post('/auth/login-mfa', { userId, code }),
    getProfile: () => api.get('/auth/profile')
};

export const courseAPI = {
    getAll: (params) => api.get('/courses', { params }),
    create: (data) => api.post('/courses', data),
    update: (id, data) => api.put(`/courses/${id}`, data),
    delete: (id) => api.delete(`/courses/${id}`)
};

export const userAPI = {
    getAll: () => api.get('/users'),
    updateProgress: (courseId, percent) => api.put('/users/progress', { courseId, percent }),
    deleteUser: (id) => api.delete(`/users/${id}`),
    getChildProgress: (childId) => api.get(`/users/child/${childId}`),
    toggleChildLock: (childId, courseId) => api.put('/users/child/lock', { childId, courseId })
};

export const adminAPI = {
    getAllUsers: userAPI.getAll,
    deleteUser: userAPI.deleteUser
};

export const mfaAPI = {
    generatePublicSecret: (username) => api.post('/auth/mfa/generate-public', { username }),
    generateSecret: () => api.post('/auth/mfa/generate'),
    verify: (code, secret) => api.post('/auth/mfa/verify', { code, secret }),
    enable: (secret, code) => api.post('/auth/mfa/enable', { secret, code }),
    disable: () => api.post('/auth/mfa/disable')
};

export const forumAPI = {
    getPosts: () => api.get('/forum'),
    createPost: (data) => api.post('/forum', data),
    addReply: (postId, data) => api.post(`/forum/${postId}/reply`, data)
};

export default api;
