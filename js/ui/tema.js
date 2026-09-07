// =====================================================
// TEMA - Claro/Escuro
// =====================================================

import { carregarTemaStorage, salvarTemaStorage } from '../utils/storage.js';

let temaEscuro = carregarTemaStorage();

export function initTema() {
    console.log('🌓 Inicializando tema:', temaEscuro ? 'Escuro' : 'Claro');
    aplicarTema();
}

export function aplicarTema() {
    const statusTema = document.getElementById('statusTema');
    
    console.log('🎨 Aplicando tema:', temaEscuro ? 'Escuro' : 'Claro');
    
    if (temaEscuro) {
        // 🔥 ADICIONAR CLASSE E ATRIBUTO
        document.body.classList.add('modo-escuro');
        document.documentElement.setAttribute('data-theme', 'dark');
        if (statusTema) statusTema.textContent = '🌙';
    } else {
        // 🔥 REMOVER CLASSE E ATRIBUTO
        document.body.classList.remove('modo-escuro');
        document.documentElement.removeAttribute('data-theme');
        if (statusTema) statusTema.textContent = '🌞';
    }
    
    // 🔥 FORÇAR O NAVEGADOR A RECONHECER A MUDANÇA
    // Isso força um reflow para aplicar as mudanças
    void document.body.offsetHeight;
    
    salvarTemaStorage(temaEscuro);
    
    console.log('✅ Tema aplicado. Classe modo-escuro:', document.body.classList.contains('modo-escuro'));
}

export function toggleTema() {
    console.log('🔄 Alternando tema...');
    temaEscuro = !temaEscuro;
    aplicarTema();
    
    // Fechar menu após alternar
    try {
        import('./menu.js').then(module => {
            if (module.fecharMenu) module.fecharMenu();
        });
    } catch (e) {
        console.warn('⚠️ Menu não disponível para fechar');
    }
}