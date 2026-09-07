// =====================================================
// POPUPS - Exibição de Listagens e Filtros Flutuantes
// =====================================================

import { getPessoas } from '../core/pessoas.js';
import { mostrarToast } from '../utils/helpers.js';
import { CORES_TURNOS, PALETA } from '../constants/cores.js';

let equipeSelecionada = null;

export function initPopups(equipe) {
    equipeSelecionada = equipe;
}

export function atualizarEquipePopup(equipe) {
    equipeSelecionada = equipe;
}

// =====================================================
// CONFIGURAÇÃO DE CORES DOS POPUPS
// =====================================================

const CONFIG_POPUP = {
    total: {
        titulo: 'Todos os Funcionários',
        cor: PALETA.primary,
        icone: 'icon-users',
        label: 'Total'
    },
    M: {
        titulo: 'Manhã',
        cor: PALETA.warning,
        icone: 'icon-sun',
        label: 'Manhã'
    },
    T: {
        titulo: 'Tarde',
        cor: '#EA580C',
        icone: 'icon-sun',
        label: 'Tarde'
    },
    N: {
        titulo: 'Noite',
        cor: '#3B82F6',
        icone: 'icon-moon',
        label: 'Noite'
    },
    ADM: {
        titulo: 'Administrativos',
        cor: PALETA.success,
        icone: 'icon-contacts',
        label: 'ADM'
    }
};

// =====================================================
// FUNÇÃO PRINCIPAL - ABRIR POPUP
// =====================================================

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

    // 🔥 CONFIGURAÇÃO DO POPUP
    const config = CONFIG_POPUP[tipo];
    if (!config) {
        mostrarToast('❌ Tipo de filtro inválido!', 'erro');
        return;
    }

    const todasPessoas = getPessoas();
    const escalaAtual = equipeSelecionada.id;

    // 🔥 FILTRAR PESSOAS
    let pessoasFiltradas = todasPessoas.filter(p => Number(p.escalaId) === Number(escalaAtual));

    if (tipo === 'M') {
        pessoasFiltradas = pessoasFiltradas.filter(p => p.turno === 'M');
    } else if (tipo === 'T') {
        pessoasFiltradas = pessoasFiltradas.filter(p => p.turno === 'T');
    } else if (tipo === 'N') {
        pessoasFiltradas = pessoasFiltradas.filter(p => p.turno === 'N');
    } else if (tipo === 'ADM') {
        pessoasFiltradas = pessoasFiltradas.filter(p => p.tipo === 'ADM');
    }

    // 🔥 ORDENAR POR NOME
    pessoasFiltradas.sort((a, b) => a.nome.localeCompare(b.nome));

    // 🔥 TÍTULO DO POPUP
    const tituloTexto = tipo === 'total' 
        ? `${config.titulo} - Escala ${escalaAtual}`
        : `${config.titulo} - Escala ${escalaAtual}`;

    if (titulo) {
        titulo.innerHTML = `
            <svg class="icon" width="20" height="20" style="color:${config.cor};">
                <use href="assets/icons/sprite.svg#${config.icone}"></use>
            </svg>
            ${tituloTexto}
        `;
    }

    // 🔥 CONTEÚDO DO POPUP
    if (conteudo) {
        if (pessoasFiltradas.length === 0) {
            conteudo.innerHTML = `
                <div style="
                    text-align: center; 
                    padding: 60px 20px; 
                    color: var(--color-text-muted, #64748b);
                ">
                    <svg class="icon" width="64" height="64" style="
                        opacity: 0.2; 
                        color: ${config.cor};
                        margin-bottom: 16px;
                    ">
                        <use href="assets/icons/sprite.svg#${config.icone}"></use>
                    </svg>
                    <p style="font-size: 1.1rem; font-weight: 500;">
                        Nenhum funcionário encontrado
                    </p>
                    <p style="font-size: 0.85rem; margin-top: 8px;">
                        ${tipo === 'total' 
                            ? 'Clique em "Cadastrar Funcionário" no menu para adicionar.'
                            : `Nenhum funcionário no turno ${config.label}.`}
                    </p>
                </div>
            `;
        } else {
            // 🔥 CABEÇALHO DO POPUP
            let html = `
                <div style="
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                ">
                <div style="
                    padding: 12px 16px;
                    background: ${config.cor};
                    border-radius: 10px;
                    color: white;
                    text-align: center;
                    font-weight: 600;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                ">
                    <svg class="icon" width="20" height="20" style="color:white;">
                        <use href="assets/icons/sprite.svg#${config.icone}"></use>
                    </svg>
                    ${tituloTexto} 
                    <span style="
                        background: rgba(255,255,255,0.2);
                        padding: 2px 12px;
                        border-radius: 20px;
                        font-size: 0.8rem;
                    ">${pessoasFiltradas.length}</span>
                </div>
            `;

            // 🔥 LISTA DE FUNCIONÁRIOS
            pessoasFiltradas.forEach(p => {
                const turnoCor = CORES_TURNOS[p.turno] || CORES_TURNOS['M'];
                const isADM = p.tipo === 'ADM';

                html += `
                    <div style="
                        display: flex;
                        flex-direction: column;
                        padding: 16px 18px;
                        background: var(--color-surface, #ffffff);
                        border-radius: 12px;
                        border: 1px solid var(--color-border, #e2e8f0);
                        border-left: 5px solid ${isADM ? PALETA.success : turnoCor.badge};
                        transition: all 0.2s ease;
                        gap: 6px;
                        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
                    ">
                        <!-- Nome -->
                        <div style="
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            gap: 12px;
                        ">
                            <span style="
                                font-weight: 600;
                                font-size: 1rem;
                                color: var(--color-text, #1e293b);
                            ">${p.nome}</span>
                            
                            <!-- Badge ADM -->
                            ${isADM ? `
                                <span style="
                                    font-size: 0.55rem;
                                    font-weight: 700;
                                    background: ${PALETA.success};
                                    color: white;
                                    padding: 2px 10px;
                                    border-radius: 12px;
                                    display: flex;
                                    align-items: center;
                                    gap: 4px;
                                    flex-shrink: 0;
                                ">
                                    <svg class="icon" width="12" height="12" style="color:white;">
                                        <use href="assets/icons/sprite.svg#icon-verified"></use>
                                    </svg>
                                    ADM
                                </span>
                            ` : ''}
                        </div>

                        <!-- Cargo -->
                        ${p.cargo ? `
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 6px;
                                font-size: 0.8rem;
                                color: var(--color-text-muted, #64748b);
                            ">
                                <svg class="icon" width="14" height="14">
                                    <use href="assets/icons/sprite.svg#icon-work"></use>
                                </svg>
                                ${p.cargo}
                            </div>
                        ` : ''}

                        <!-- Empresa -->
                        ${p.empresa ? `
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 6px;
                                font-size: 0.8rem;
                                color: var(--color-text-muted, #64748b);
                            ">
                                <svg class="icon" width="14" height="14">
                                    <use href="assets/icons/sprite.svg#icon-business"></use>
                                </svg>
                                ${p.empresa}
                            </div>
                        ` : ''}

                        <!-- Contato -->
                        ${p.contato ? `
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 6px;
                                font-size: 0.8rem;
                                color: var(--color-text-muted, #64748b);
                            ">
                                <svg class="icon" width="14" height="14">
                                    <use href="assets/icons/sprite.svg#icon-phone"></use>
                                </svg>
                                ${p.contato}
                            </div>
                        ` : ''}

                        <!-- Badges de Escala e Turno -->
                        <div style="
                            display: flex;
                            gap: 6px;
                            align-items: center;
                            margin-top: 4px;
                            flex-wrap: wrap;
                        ">
                            <span style="
                                font-size: 0.6rem;
                                font-weight: 700;
                                padding: 2px 12px;
                                border-radius: 12px;
                                background: ${turnoCor.bg};
                                color: ${turnoCor.text};
                            ">
                                E${p.escalaId} • ${turnoCor.icone} ${turnoCor.nome}
                            </span>
                            
                            ${isADM ? `
                                <span style="
                                    font-size: 0.6rem;
                                    font-weight: 600;
                                    padding: 2px 10px;
                                    border-radius: 12px;
                                    background: ${PALETA.success}15;
                                    color: ${PALETA.success};
                                    border: 1px solid ${PALETA.success}30;
                                ">
                                    🏢 Administrativo
                                </span>
                            ` : `
                                <span style="
                                    font-size: 0.6rem;
                                    font-weight: 600;
                                    padding: 2px 10px;
                                    border-radius: 12px;
                                    background: var(--color-bg, #f1f5f9);
                                    color: var(--color-text-muted, #64748b);
                                    border: 1px solid var(--color-border, #e2e8f0);
                                ">
                                    🔧 Operacional
                                </span>
                            `}
                        </div>

                        <!-- Ações -->
                        <div style="
                            display: flex;
                            justify-content: flex-end;
                            gap: 8px;
                            margin-top: 8px;
                            padding-top: 10px;
                            border-top: 1px solid var(--color-border, #e2e8f0);
                        ">
                            <button onclick="window.editarFuncionario('${p.id}')" 
                                style="
                                    background: none;
                                    border: none;
                                    cursor: pointer;
                                    padding: 6px 14px;
                                    border-radius: 8px;
                                    color: ${PALETA.primary};
                                    transition: all 0.2s;
                                    display: flex;
                                    align-items: center;
                                    gap: 6px;
                                    font-size: 0.8rem;
                                    font-weight: 500;
                                    background: ${PALETA.primary}08;
                                "
                                onmouseenter="this.style.background='${PALETA.primary}20'"
                                onmouseleave="this.style.background='${PALETA.primary}08'"
                                title="Editar funcionário">
                                <svg class="icon" width="16" height="16">
                                    <use href="assets/icons/sprite.svg#icon-edit"></use>
                                </svg>
                                Editar
                            </button>
                            <button onclick="window.removerPessoa('${p.id}')" 
                                style="
                                    background: none;
                                    border: none;
                                    cursor: pointer;
                                    padding: 6px 14px;
                                    border-radius: 8px;
                                    color: ${PALETA.danger};
                                    transition: all 0.2s;
                                    display: flex;
                                    align-items: center;
                                    gap: 6px;
                                    font-size: 0.8rem;
                                    font-weight: 500;
                                    background: ${PALETA.danger}08;
                                "
                                onmouseenter="this.style.background='${PALETA.danger}20'"
                                onmouseleave="this.style.background='${PALETA.danger}08'"
                                title="Excluir funcionário">
                                <svg class="icon" width="16" height="16">
                                    <use href="assets/icons/sprite.svg#icon-delete"></use>
                                </svg>
                                Excluir
                            </button>
                        </div>
                    </div>
                `;
            });

            // 🔥 RODAPÉ DO POPUP
            html += `
                <div style="
                    margin-top: 8px;
                    padding: 14px 18px;
                    background: ${config.cor};
                    border-radius: 12px;
                    color: white;
                    text-align: center;
                    font-weight: 600;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                ">
                    <svg class="icon" width="20" height="20" style="color:white;">
                        <use href="assets/icons/sprite.svg#${config.icone}"></use>
                    </svg>
                    Total: ${pessoasFiltradas.length} funcionário${pessoasFiltradas.length > 1 ? 's' : ''}
                </div>
            `;

            conteudo.innerHTML = html;
        }
    }

    // 🔥 TOTAL
    if (total) {
        total.textContent = `Total: ${pessoasFiltradas.length}`;
    }

    overlay.classList.add('ativo');
}

// =====================================================
// FECHAR POPUP
// =====================================================

export function fecharPopup() {
    const overlay = document.getElementById('popupOverlay');
    if (overlay) {
        overlay.classList.remove('ativo');
    }
}

// =====================================================
// POPUP ADMINISTRATIVO (ESPECÍFICO)
// =====================================================

export function abrirPopupADM() {
    // Usa o mesmo sistema, mas com filtro ADM
    const overlay = document.getElementById('popupOverlay');
    const titulo = document.getElementById('popupTitulo');
    const conteudo = document.getElementById('popupConteudo');
    const total = document.getElementById('popupTotal');

    if (!overlay) {
        console.error('❌ Elemento overlay do popup não encontrado!');
        return;
    }

    const config = CONFIG_POPUP.ADM;
    const todasPessoas = getPessoas();
    const pessoasFiltradas = todasPessoas.filter(p => p.tipo === 'ADM');

    pessoasFiltradas.sort((a, b) => a.nome.localeCompare(b.nome));

    if (titulo) {
        titulo.innerHTML = `
            <svg class="icon" width="20" height="20" style="color:${config.cor};">
                <use href="assets/icons/sprite.svg#${config.icone}"></use>
            </svg>
            ${config.titulo}
        `;
    }

    if (conteudo) {
        if (pessoasFiltradas.length === 0) {
            conteudo.innerHTML = `
                <div style="
                    text-align: center; 
                    padding: 60px 20px; 
                    color: var(--color-text-muted, #64748b);
                ">
                    <svg class="icon" width="64" height="64" style="
                        opacity: 0.2; 
                        color: ${config.cor};
                        margin-bottom: 16px;
                    ">
                        <use href="assets/icons/sprite.svg#${config.icone}"></use>
                    </svg>
                    <p style="font-size: 1.1rem; font-weight: 500;">
                        Nenhum funcionário administrativo
                    </p>
                    <p style="font-size: 0.85rem; margin-top: 8px;">
                        Selecione "ADM" no campo "Tipo" ao cadastrar um funcionário.
                    </p>
                </div>
            `;
        } else {
            let html = `
                <div style="display:flex; flex-direction:column; gap:12px;">
                <div style="
                    padding: 12px 16px;
                    background: ${config.cor};
                    border-radius: 10px;
                    color: white;
                    text-align: center;
                    font-weight: 600;
                    font-size: 0.9rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                ">
                    <svg class="icon" width="20" height="20" style="color:white;">
                        <use href="assets/icons/sprite.svg#${config.icone}"></use>
                    </svg>
                    Administrativos (${pessoasFiltradas.length})
                </div>
            `;

            pessoasFiltradas.forEach(p => {
                const turnoCor = CORES_TURNOS[p.turno] || CORES_TURNOS['M'];

                html += `
                    <div style="
                        display: flex;
                        flex-direction: column;
                        padding: 16px 18px;
                        background: var(--color-surface, #ffffff);
                        border-radius: 12px;
                        border: 1px solid var(--color-border, #e2e8f0);
                        border-left: 5px solid ${PALETA.success};
                        transition: all 0.2s ease;
                        gap: 6px;
                    ">
                        <div style="
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                        ">
                            <span style="
                                font-weight: 600;
                                font-size: 1rem;
                                color: var(--color-text, #1e293b);
                            ">${p.nome}</span>
                            <span style="
                                font-size: 0.55rem;
                                font-weight: 700;
                                background: ${PALETA.success};
                                color: white;
                                padding: 2px 10px;
                                border-radius: 12px;
                            ">
                                🏢 ADM
                            </span>
                        </div>

                        ${p.cargo ? `
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 6px;
                                font-size: 0.8rem;
                                color: var(--color-text-muted, #64748b);
                            ">
                                <svg class="icon" width="14" height="14">
                                    <use href="assets/icons/sprite.svg#icon-work"></use>
                                </svg>
                                ${p.cargo}
                            </div>
                        ` : ''}

                        ${p.empresa ? `
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 6px;
                                font-size: 0.8rem;
                                color: var(--color-text-muted, #64748b);
                            ">
                                <svg class="icon" width="14" height="14">
                                    <use href="assets/icons/sprite.svg#icon-business"></use>
                                </svg>
                                ${p.empresa}
                            </div>
                        ` : ''}

                        ${p.contato ? `
                            <div style="
                                display: flex;
                                align-items: center;
                                gap: 6px;
                                font-size: 0.8rem;
                                color: var(--color-text-muted, #64748b);
                            ">
                                <svg class="icon" width="14" height="14">
                                    <use href="assets/icons/sprite.svg#icon-phone"></use>
                                </svg>
                                ${p.contato}
                            </div>
                        ` : ''}

                        <div style="display:flex; gap:6px; align-items:center; margin-top:4px; flex-wrap:wrap;">
                            <span style="
                                font-size:0.6rem;
                                font-weight:700;
                                padding:2px 12px;
                                border-radius:12px;
                                background: ${turnoCor.bg};
                                color: ${turnoCor.text};
                            ">
                                E${p.escalaId} • ${turnoCor.icone} ${turnoCor.nome}
                            </span>
                            <span style="
                                font-size:0.6rem;
                                font-weight:600;
                                padding:2px 10px;
                                border-radius:12px;
                                background: ${PALETA.success}15;
                                color: ${PALETA.success};
                                border: 1px solid ${PALETA.success}30;
                            ">
                                ✅ Administrativo
                            </span>
                        </div>

                        <div style="
                            display: flex;
                            justify-content: flex-end;
                            gap: 8px;
                            margin-top: 8px;
                            padding-top: 10px;
                            border-top: 1px solid var(--color-border, #e2e8f0);
                        ">
                            <button onclick="window.editarFuncionario('${p.id}')" 
                                style="
                                    background: none;
                                    border: none;
                                    cursor: pointer;
                                    padding: 6px 14px;
                                    border-radius: 8px;
                                    color: ${PALETA.primary};
                                    transition: all 0.2s;
                                    display: flex;
                                    align-items: center;
                                    gap: 6px;
                                    font-size: 0.8rem;
                                    font-weight: 500;
                                    background: ${PALETA.primary}08;
                                "
                                onmouseenter="this.style.background='${PALETA.primary}20'"
                                onmouseleave="this.style.background='${PALETA.primary}08'"
                                title="Editar funcionário">
                                <svg class="icon" width="16" height="16">
                                    <use href="assets/icons/sprite.svg#icon-edit"></use>
                                </svg>
                                Editar
                            </button>
                            <button onclick="window.removerPessoa('${p.id}')" 
                                style="
                                    background: none;
                                    border: none;
                                    cursor: pointer;
                                    padding: 6px 14px;
                                    border-radius: 8px;
                                    color: ${PALETA.danger};
                                    transition: all 0.2s;
                                    display: flex;
                                    align-items: center;
                                    gap: 6px;
                                    font-size: 0.8rem;
                                    font-weight: 500;
                                    background: ${PALETA.danger}08;
                                "
                                onmouseenter="this.style.background='${PALETA.danger}20'"
                                onmouseleave="this.style.background='${PALETA.danger}08'"
                                title="Excluir funcionário">
                                <svg class="icon" width="16" height="16">
                                    <use href="assets/icons/sprite.svg#icon-delete"></use>
                                </svg>
                                Excluir
                            </button>
                        </div>
                    </div>
                `;
            });

            html += `
                <div style="
                    margin-top: 8px;
                    padding: 14px 18px;
                    background: ${config.cor};
                    border-radius: 12px;
                    color: white;
                    text-align: center;
                    font-weight: 600;
                    font-size: 0.95rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                ">
                    <svg class="icon" width="20" height="20" style="color:white;">
                        <use href="assets/icons/sprite.svg#${config.icone}"></use>
                    </svg>
                    Total: ${pessoasFiltradas.length} funcionário${pessoasFiltradas.length > 1 ? 's' : ''}
                </div>
            `;

            conteudo.innerHTML = html;
        }
    }

    if (total) {
        total.textContent = `ADM: ${pessoasFiltradas.length}`;
    }

    overlay.classList.add('ativo');
}