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
            const coresTurnos = {
                'M': { bg: '#FEF3C7', text: '#92400E', badge: '#F59E0B' },
                'T': { bg: '#FFEDD5', text: '#7C2D12', badge: '#EA580C' },
                'N': { bg: '#E0E7FF', text: '#1E1B4B', badge: '#4F46E5' }
            };

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
                const cores = coresTurnos[p.turno] || coresTurnos['M'];
                
                html += `
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 12px 16px;
                        background: var(--color-bg, #f8fafc);
                        border-radius: 10px;
                        border-left: 4px solid ${cores.badge};
                        transition: all 0.2s ease;
                    ">
                        <div style="display:flex; flex-direction:column; gap:2px; flex:1; min-width:0;">
                            <span style="font-weight:600; font-size:0.95rem; color: var(--color-text, #1e293b);">
                                ${p.nome}
                            </span>
                            ${p.cargo ? `<span style="font-size:0.75rem; color: var(--color-text-muted, #64748b);">
                                <svg class="icon" width="14" height="14" style="vertical-align:middle;">
                                    <use href="assets/icons/sprite.svg#icon-work"></use>
                                </svg>
                                ${p.cargo}
                            </span>` : ''}
                            ${p.empresa ? `<span style="font-size:0.75rem; color: var(--color-text-muted, #64748b);">
                                <svg class="icon" width="14" height="14" style="vertical-align:middle;">
                                    <use href="assets/icons/sprite.svg#icon-business"></use>
                                </svg>
                                ${p.empresa}
                            </span>` : ''}
                            ${p.contato ? `<span style="font-size:0.75rem; color: var(--color-text-muted, #64748b);">
                                <svg class="icon" width="14" height="14" style="vertical-align:middle;">
                                    <use href="assets/icons/sprite.svg#icon-phone"></use>
                                </svg>
                                ${p.contato}
                            </span>` : ''}
                            ${p.tipo === 'ADM' ? `<span style="font-size:0.65rem; color: #10B981; font-weight:600;">
                                <svg class="icon" width="12" height="12" style="vertical-align:middle;">
                                    <use href="assets/icons/sprite.svg#icon-verified"></use>
                                </svg>
                                ADM
                            </span>` : ''}
                        </div>
                        <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
                            <span style="
                                font-size:0.65rem;
                                font-weight:700;
                                padding:2px 12px;
                                border-radius:20px;
                                background: ${cores.bg};
                                color: ${cores.text};
                            ">E${p.escalaId}-${p.turno}</span>
                            <div style="display:flex; gap:4px;">
                                <button onclick="window.editarFuncionario('${p.id}')" 
                                    style="
                                        background: none;
                                        border: none;
                                        cursor: pointer;
                                        padding: 4px 8px;
                                        border-radius: 6px;
                                        color: var(--color-primary, #3B82F6);
                                        transition: background 0.2s;
                                    "
                                    onmouseenter="this.style.background='var(--color-bg, #f1f5f9)'"
                                    onmouseleave="this.style.background='transparent'"
                                    title="Editar">
                                    <svg class="icon" width="18" height="18">
                                        <use href="assets/icons/sprite.svg#icon-edit"></use>
                                    </svg>
                                </button>
                                <button onclick="window.removerPessoa('${p.id}')" 
                                    style="
                                        background: none;
                                        border: none;
                                        cursor: pointer;
                                        padding: 4px 8px;
                                        border-radius: 6px;
                                        color: #EF4444;
                                        transition: background 0.2s;
                                    "
                                    onmouseenter="this.style.background='#FEE2E2'"
                                    onmouseleave="this.style.background='transparent'"
                                    title="Excluir">
                                    <svg class="icon" width="18" height="18">
                                        <use href="assets/icons/sprite.svg#icon-delete"></use>
                                    </svg>
                                </button>
                            </div>
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