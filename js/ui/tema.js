// =====================================================
// TEMA - Chaveamento Claro/Escuro (Design System PRO)
// =====================================================

import { carregarTemaStorage, salvarTemaStorage } from '../utils/storage.js';
import { fecharMenu } from './menu.js';

let temaEscuro = carregarTemaStorage();

export function initTema() {
    aplicarTema();
}

export function aplicarTema() {
    const statusTema = document.getElementById('statusTema');
    
    // Atualiza o atributo data-theme na raiz do documento HTML
    if (temaEscuro) {
        document.documentElement.setAttribute('data-theme', 'dark');
        if (statusTema) statusTema.textContent = '🌙';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        if (statusTema) statusTema.textContent = '🌞';
    }
    
    salvarTemaStorage(temaEscuro);
}

export function toggleTema() {
    temaEscuro = !temaEscuro;
    aplicarTema();
    if (typeof fecharMenu === 'function') {
        fecharMenu();
    }
}