import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api'
});

export function setAuthCredentials(email, senha) {
    API.defaults.auth = { username: email, password: senha };
}

export function clearAuthCredentials() {
    delete API.defaults.auth;
}

API.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        return Promise.reject(error);
    }
);

export default API;
