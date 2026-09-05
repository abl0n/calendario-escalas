// =====================================================
// STORAGE - Gerenciamento Centralizado de LocalStorage
// =====================================================

const KEYS = {
    ESCALAS: 'escalas',
    EXTRAS: 'horasExtras',
    PESSOAS: 'pessoas',
    PERIODO: 'periodoIndex',
    TEMA: 'temaEscuro'
};

// ===== ESCALAS =====
export function carregarEscalasStorage() {
    const dados = localStorage.getItem(KEYS.ESCALAS);
    if (dados) {
        try {
            const parsed = JSON.parse(dados);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
            console.error("Erro ao carregar escalas do storage:", e);
        }
    }
    return null;
}

export function salvarEscalasStorage(escalas) {
    localStorage.setItem(KEYS.ESCALAS, JSON.stringify(escalas));
}

// ===== HORAS EXTRAS =====
export function carregarExtrasStorage() {
    const dados = localStorage.getItem(KEYS.EXTRAS);
    if (dados) {
        try { return JSON.parse(dados); } catch (e) {
            console.error("Erro ao carregar extras do storage:", e);
        }
    }
    return [];
}

export function salvarExtrasStorage(horasExtras) {
    localStorage.setItem(KEYS.EXTRAS, JSON.stringify(horasExtras));
}

// ===== PESSOAS =====
export function carregarPessoasStorage() {
    const dados = localStorage.getItem(KEYS.PESSOAS);
    if (dados) {
        try { return JSON.parse(dados); } catch (e) {
            console.error("Erro ao carregar pessoas do storage:", e);
        }
    }
    return [];
}

export function salvarPessoasStorage(pessoas) {
    localStorage.setItem(KEYS.PESSOAS, JSON.stringify(pessoas));
}

// ===== PERÍODO =====
export function carregarPeriodoStorage() {
    const index = localStorage.getItem(KEYS.PERIODO);
    return index !== null ? parseInt(index, 10) : 0;
}

export function salvarPeriodoStorage(index) {
    localStorage.setItem(KEYS.PERIODO, index);
}

// ===== TEMA =====
export function carregarTemaStorage() {
    return localStorage.getItem(KEYS.TEMA) === 'true';
}

export function salvarTemaStorage(escuro) {
    localStorage.setItem(KEYS.TEMA, escuro);
}