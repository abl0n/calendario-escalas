// =====================================================
// CONSTANTES DE CORES - SISTEMA UNIFICADO
// =====================================================

// ===== PALETA PRINCIPAL =====
export const PALETA = {
    primary: '#2563EB',
    primaryLight: '#60A5FA',
    primaryDark: '#1D4ED8',
    success: '#10B981',
    danger: '#DC2626',
    warning: '#F59E0B',
    white: '#FFFFFF',
    black: '#1E293B',
    gray: '#94A3B8',
    grayLight: '#F1F5F9',
    grayDark: '#475569'
};

// ===== CORES DAS ESCALAS =====
export const CORES_ESCALAS = {
    1: { 
        bg: PALETA.primary,
        hover: PALETA.primaryDark,
        text: PALETA.white,
        nome: 'Escala 1',
        emoji: '📅'
    },
    2: { 
        bg: PALETA.danger,
        hover: '#B91C1C',
        text: PALETA.white,
        nome: 'Escala 2',
        emoji: '📆'
    },
    3: { 
        bg: '#8B5CF6',
        hover: '#6D28D9',
        text: PALETA.white,
        nome: 'Escala 3',
        emoji: '🗓️'
    },
    4: { 
        bg: PALETA.warning,
        hover: '#D97706',
        text: PALETA.black,
        nome: 'Escala 4',
        emoji: '📋'
    }
};

// ===== CORES DOS TURNOS =====
export const CORES_TURNOS = {
    'M': { 
        bg: '#FEF9C3',
        text: '#78350F',
        badge: PALETA.warning,
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
        bg: '#DBEAFE',
        text: '#1E3A8A',
        badge: '#3B82F6',
        nome: 'Noite',
        icone: '🌙'
    }
};

// ===== CORES DO CALENDÁRIO =====
export const CORES_CALENDARIO = {
    header: {
        background: PALETA.primary,
        text: PALETA.white,
        border: PALETA.primaryDark
    },
    status: {
        trabalho: {
            background: PALETA.primary,
            text: PALETA.white,
            border: PALETA.primaryDark,
            shadow: 'rgba(37, 99, 235, 0.3)'
        },
        folga: {
            background: PALETA.success,
            text: PALETA.white,
            border: '#059669',
            shadow: 'rgba(16, 185, 129, 0.3)'
        }
    },
    especial: {
        feriado: PALETA.danger,
        feriadoTrabalhado: '#B91C1C',
        comemorativo: '#8B5CF6',
        extra: PALETA.warning,
        hoje: PALETA.primary
    }
};

// ===== CORES DOS COMPONENTES =====
export const CORES_COMPONENTES = {
    contadores: {
        total: {
            bg: PALETA.grayLight,
            border: PALETA.gray,
            text: PALETA.black
        },
        manha: {
            bg: '#FEF9C3',
            border: PALETA.warning,
            text: '#78350F'
        },
        tarde: {
            bg: '#FFEDD5',
            border: '#EA580C',
            text: '#7C2D12'
        },
        noite: {
            bg: '#DBEAFE',
            border: '#3B82F6',
            text: '#1E3A8A'
        }
    },
    badges: {
        adm: {
            bg: PALETA.success,
            text: PALETA.white
        },
        turno: {
            M: { bg: PALETA.warning, text: PALETA.white },
            T: { bg: '#EA580C', text: PALETA.white },
            N: { bg: '#3B82F6', text: PALETA.white }
        }
    },
    botoes: {
        primary: {
            bg: PALETA.primary,
            hover: PALETA.primaryDark,
            text: PALETA.white
        },
        danger: {
            bg: PALETA.danger,
            hover: '#B91C1C',
            text: PALETA.white
        },
        success: {
            bg: PALETA.success,
            hover: '#059669',
            text: PALETA.white
        }
    }
};

// ===== TEMAS =====
export const TEMAS = {
    claro: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        surfaceAlt: '#F1F5F9',
        text: '#1E293B',
        textMuted: '#64748B',
        border: '#E2E8F0',
        shadow: 'rgba(0,0,0,0.08)'
    },
    escuro: {
        background: '#000000',
        surface: '#0D0D0D',
        surfaceAlt: '#1A1A1A',
        text: '#FFFFFF',
        textMuted: '#888888',
        border: '#2A2A2A',
        shadow: 'rgba(0,0,0,0.3)'
    }
};

// ===== FUNÇÕES AUXILIARES =====
export function getCorEscala(id, tipo = 'bg') {
    const cores = CORES_ESCALAS[id];
    return cores ? cores[tipo] : PALETA.primary;
}

export function getCorTurno(turno, tipo = 'bg') {
    const cores = CORES_TURNOS[turno];
    return cores ? cores[tipo] : PALETA.gray;
}

export function getTema(tipo = 'claro') {
    return TEMAS[tipo] || TEMAS.claro;
}