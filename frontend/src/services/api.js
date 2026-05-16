import axios from 'axios';

// Адреса твого FastAPI сервера
const API_URL = 'http://127.0.0.1:8000/api/v1';

export const api = {
    checkGrammar: async (text) => {
        const response = await axios.post(`${API_URL}/check`, { text });
        return response.data;
    },
    fastCheck: async (text) => {
        const response = await axios.post(`${API_URL}/check/fast`, { text });
        return response.data;
    },
    translate: async (text, targetLanguage = 'en') => {
        const response = await axios.post(`${API_URL}/translate`, { text, target_language: targetLanguage });
        return response.data;
    },
    summarize: async (text) => {
        const response = await axios.post(`${API_URL}/summarize`, { text });
        return response.data;
    },
    expand: async (text) => {
        const response = await axios.post(`${API_URL}/expand`, { text });
        return response.data;
    },
    rewrite: async (text) => {
        const response = await axios.post(`${API_URL}/rewrite`, { text });
        return response.data;
    },
    getReportPdf: async (text) => {
        const response = await axios.post(`${API_URL}/report/pdf`, { text }, { responseType: 'blob' });
        return response.data;
    },
    getReportWord: async (text) => {
        const response = await axios.post(`${API_URL}/report/word`, { text }, { responseType: 'blob' });
        return response.data;
    },
    describeText: async (text) => {
        const response = await axios.post(`${API_URL}/describe`, { text });
        return response.data;
    },
    getKeywords: async (text) => {
        const response = await axios.post(`${API_URL}/keywords`, { text });
        return response.data;
    },
    analyzeFile: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await axios.post(`${API_URL}/analyze/file`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    }
};