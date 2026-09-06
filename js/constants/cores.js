// =====================================================
// CONSTANTES COMPARTILHADAS
// =====================================================

export const CORES_TURNOS = {
    'M': { 
        bg: '#FEF3C7', 
        text: '#92400E', 
        badge: '#F59E0B',
        nome: 'Manhã',
        icone: '☀️'
    },
    'T': { 
        bg: '#FFEDD5', 
        text: '#7C2D12', 
        badge: '#EA580C',
        nome: 'Tarde',
        icone: '🌆'
    },
    'N': { 
        bg: '#E0E7FF', 
        text: '#1E1B4B', 
        badge: '#4F46E5',
        nome: 'Noite',
        icone: '🌙'
    }
};

export const CORES_ESCALAS = {
    1: { bg: '#3B82F6', hover: '#1D4ED8', text: '#FFFFFF', nome: 'Escala 1', emoji: '📅' },
    2: { bg: '#EF4444', hover: '#B91C1C', text: '#FFFFFF', nome: 'Escala 2', emoji: '📆' },
    3: { bg: '#8B5CF6', hover: '#6D28D9', text: '#FFFFFF', nome: 'Escala 3', emoji: '🗓️' },
    4: { bg: '#F59E0B', hover: '#B45309', text: '#FFFFFF', nome: 'Escala 4', emoji: '📋' }
};

export const TURNOS_LABELS = {
    'M': 'E{escalaId}-M',
    'T': 'E{escalaId}-T',
    'N': 'E{escalaId}-N'
};