// =====================================================
// POPUPS - Exibição de Listagens e Filtros Flutuantes
// =====================================================

import { getPessoas } from '../core/pessoas.js';
import { mostrarToast } from '../utils/helpers.js';

let equipeSelecionada = null;

export function initPopups(equipe) {
    equipeSelecionada = equipe;
}

export function atualizarEquipePopup(equipe) {
    equipeSelecionada = equipe;
}

export function abrirPopup(tipo) {
    const overlay = document.getElementById('popupOverlay');
    const titulo = document.getElementById('popupTitulo');
    const conteudo = document.getElementById('popupConteudo');
    const total = document.getElementById('popupTotal');

    if (!overlay) {
        console.error('❌ Elemento overlay do popup não encontrado!');
        return;
    }

    if (!equipeSelecionada) {
        mostrarToast('❌ Nenhuma escala selecionada!', 'erro');
        return;
    }

    const todasPessoas = getPessoas();
    const escalaAtual = equipeSelecionada.id;

    let pessoasFiltradas = todasPessoas.filter(p => Number(p.escalaId) === Number(escalaAtual));
    let tituloTexto = '';
    let turnoLabel = '';
    let corDestaque = '';
    let icone = '';

    if (tipo === 'total') {
        tituloTexto = `Todos os Funcionários - Escala ${escalaAtual}`;
        turnoLabel = 'Todos';
        corDestaque = '#3B82F6';
        icone = 'icon-users';
    } else if (tipo === 'M') {
        pessoasFiltradas = pessoasFiltradas.filter(p => p.turno === 'M');
        tituloTexto = `Manhã - Escala ${escalaAtual}`;
        turnoLabel = 'Manhã';
        corDestaque = '#F59E0B';
        icone = 'icon-sun';
    } else if (tipo === 'T') {
        pessoasFiltradas = pessoasFiltradas.filter(p => p.turno === 'T');
        tituloTexto = `Tarde - Escala ${escalaAtual}`;
        turnoLabel = 'Tarde';
        corDestaque = '#EA580C';
        icone = 'icon-sun';
    } else if (tipo === 'N') {
        pessoasFiltradas = pessoasFiltradas.filter(p => p.turno === 'N');
        tituloTexto = `Noite - Escala ${escalaAtual}`;
        turnoLabel = 'Noite';
        corDestaque = '#4F46E5';
        icone = 'icon-moon';
    } else {
        mostrarToast('❌ Tipo de filtro inválido!', 'erro');
        return;
    }

    if (titulo) {
        titulo.innerHTML = `
            <svg class="icon" width="20" height="20" style="color:${corDestaque};">
                <use href="assets/icons/sprite.svg#${icone}"></use>
            </svg>
            ${tituloTexto}
        `;
    }

    pessoasFiltradas.sort((a, b) => a.nome.localeCompare(b.nome));

    if (conteudo) {
        if (pessoasFiltradas.length === 0) {
            conteudo.innerHTML = `
                <div style="text-align:center; padding: 40px 20px; color: var(--color-text-muted, #64748b);">
                    <svg class="icon" width="48" height="48" style="opacity:0.3; color:${corDestaque};">
                        <use href="assets/icons/sprite.svg#${icone}"></use>
                    </svg>
                    <p style="margin-top:12px; font-size:0.95rem;">
                        ${tipo === 'total' ? 'Nenhum funcionário cadastrado nesta escala.' : `Nenhum funcionário no turno ${turnoLabel}.`}
                    </p>
                    <small style="font-size:0.75rem;">Clique em "Cadastrar Funcionário" no menu para adicionar.</small>
                </div>
            `;
        } else {
            // 🔥 NOVO LAYOUT - CARD COMPLETO
            let html = `
                <div style="display:flex; flex-direction:column; gap:8px;">
                <div style="
                    padding: 8px 16px;
                    background: ${corDestaque};
                    border-radius: 8px;
                    color: white;
                    text-align: center;
                    font-weight: 600;
                    font-size: 0.85rem;
                    margin-bottom: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                ">
                    <svg class="icon" width="18" height="18" style="color:white;">
                        <use href="assets/icons/sprite.svg#${icone}"></use>
                    </svg>
                    ${tituloTexto} (${pessoasFiltradas.length})
                </div>
            `;
            
            pessoasFiltradas.forEach(p => {
                // Cores do turno
                const coresTurnos = {
                    'M': { bg: '#FEF3C7', text: '#92400E', badge: '#F59E0B', nome: 'Manhã' },
                    'T': { bg: '#FFEDD5', text: '#7C2D12', badge: '#EA580C', nome: 'Tarde' },
                    'N': { bg: '#E0E7FF', text: '#1E1B4B', badge: '#4F46E5', nome: 'Noite' }
                };
                const cores = coresTurnos[p.turno] || coresTurnos['M'];
                
                // 🔥 CARD DO FUNCIONÁRIO - LAYOUT SOLICITADO
                html += `
                    <div style="
                        display: flex;
                        flex-direction: column;
                        padding: 14px 16px;
                        background: var(--color-surface, #ffffff);
                        border-radius: 10px;
                        border: 1px solid var(--color-border, #e2e8f0);
                        border-left: 4px solid ${cores.badge};
                        transition: all 0.2s ease;
                        gap: 4px;
                    ">
                        <!-- Nome -->
                        <div style="font-weight:600; font-size:1rem; color: var(--color-text, #1e293b);">
                            ${p.nome}
                        </div>
                        
                        <!-- Cargo -->
                        ${p.cargo ? `
                            <div style="display:flex; align-items:center; gap:6px; font-size:0.8rem; color: var(--color-text-muted, #64748b);">
                                <svg class="icon" width="16" height="16">
                                    <use href="assets/icons/sprite.svg#icon-work"></use>
                                </svg>
                                ${p.cargo}
                            </div>
                        ` : ''}
                        
                        <!-- Empresa -->
                        ${p.empresa ? `
                            <div style="display:flex; align-items:center; gap:6px; font-size:0.8rem; color: var(--color-text-muted, #64748b);">
                                <svg class="icon" width="16" height="16">
                                    <use href="assets/icons/sprite.svg#icon-business"></use>
                                </svg>
                                ${p.empresa}
                            </div>
                        ` : ''}
                        
                        <!-- Contato -->
                        ${p.contato ? `
                            <div style="display:flex; align-items:center; gap:6px; font-size:0.8rem; color: var(--color-text-muted, #64748b);">
                                <svg class="icon" width="16" height="16">
                                    <use href="assets/icons/sprite.svg#icon-phone"></use>
                                </svg>
                                ${p.contato}
                            </div>
                        ` : ''}
                        
                        <!-- Badges: ADM + Turno -->
                        <div style="display:flex; gap:6px; align-items:center; margin-top:2px; flex-wrap:wrap;">
                            ${p.tipo === 'ADM' ? `
                                <span style="font-size:0.6rem; background: #10B981; color: white; padding:2px 10px; border-radius:12px; font-weight:600; display:flex; align-items:center; gap:4px;">
                                    <svg class="icon" width="12" height="12" style="color:white;">
                                        <use href="assets/icons/sprite.svg#icon-verified"></use>
                                    </svg>
                                    ADM
                                </span>
                            ` : ''}
                            <span style="
                                font-size:0.6rem;
                                font-weight:700;
                                padding:2px 10px;
                                border-radius:12px;
                                background: ${cores.bg};
                                color: ${cores.text};
                            ">E${p.escalaId}-${p.turno}</span>
                        </div>
                        
                        <!-- Botões de ação (Editar e Excluir) -->
                        <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:6px; padding-top:8px; border-top:1px solid var(--color-border, #e2e8f0);">
                            <button onclick="window.editarFuncionario('${p.id}')" 
                                style="
                                    background: none;
                                    border: none;
                                    cursor: pointer;
                                    padding: 4px 10px;
                                    border-radius: 6px;
                                    color: var(--color-primary, #3B82F6);
                                    transition: background 0.2s;
                                    display:flex;
                                    align-items:center;
                                    gap:4px;
                                    font-size:0.8rem;
                                "
                                onmouseenter="this.style.background='var(--color-bg, #f1f5f9)'"
                                onmouseleave="this.style.background='transparent'"
                                title="Editar">
                                <svg class="icon" width="16" height="16">
                                    <use href="assets/icons/sprite.svg#icon-edit"></use>
                                </svg>
                            </button>
                            <button onclick="window.removerPessoa('${p.id}')" 
                                style="
                                    background: none;
                                    border: none;
                                    cursor: pointer;
                                    padding: 4px 10px;
                                    border-radius: 6px;
                                    color: #EF4444;
                                    transition: background 0.2s;
                                    display:flex;
                                    align-items:center;
                                    gap:4px;
                                    font-size:0.8rem;
                                "
                                onmouseenter="this.style.background='#FEE2E2'"
                                onmouseleave="this.style.background='transparent'"
                                title="Excluir">
                                <svg class="icon" width="16" height="16">
                                    <use href="assets/icons/sprite.svg#icon-delete"></use>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += `
                </div>
                <div style="
                    margin-top: 16px;
                    padding: 12px 16px;
                    background: ${corDestaque};
                    border-radius: 10px;
                    color: white;
                    text-align: center;
                    font-weight: 600;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                ">
                    <svg class="icon" width="18" height="18" style="color:white;">
                        <use href="assets/icons/sprite.svg#${icone}"></use>
                    </svg>
                    Total: ${pessoasFiltradas.length} funcionário${pessoasFiltradas.length > 1 ? 's' : ''}
                </div>
            `;
            conteudo.innerHTML = html;
        }
    }

    if (total) total.textContent = `Total: ${pessoasFiltradas.length}`;
    overlay.classList.add('ativo');
}

export function fecharPopup() {
    const overlay = document.getElementById('popupOverlay');
    if (overlay) {
        overlay.classList.remove('ativo');
    }
}