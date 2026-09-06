// =====================================================
// APP - Inicialização principal (Design System PRO)
// =====================================================

import { 
    escalasPadrao, 
    coresMeses, 
    coresDestaque, 
    coresHeaderFundo,
    coresHeaderTexto,
    coresHeaderBorda,
    feriados, 
    DATA_REFERENCIA, 
    DIAS_SEMANA, 
    MESES 
} from './config.js';

import { 
    mostrarToast, 
    horasParaMinutos, 
    formatarMinutos, 
    parseSemana, 
    getCicloCompleto, 
    formatarData, 
    obterNomeDiaSemana,
    mostrarLoading,
    esconderLoading
} from './utils/helpers.js';

import { 
    getPeriodoData, 
    getPeriodoAtual, 
    getPeriodoPorIndex, 
    getNomePeriodo, 
    dataEstaNoPeriodo, 
    formatarDataPeriodo, 
    getDiasNoPeriodo,
    setConfigPeriodo,
    getConfigPeriodo,
    validarPeriodo
} from './utils/periodos.js';

import { toggleMenu, fecharMenu } from './ui/menu.js';
import { initTema, toggleTema, aplicarTema } from './ui/tema.js';
import { abrirModalPessoa, fecharModalPessoa, abrirModalExtra, fecharModalExtra, initModais } from './ui/modais.js';
import { abrirPopup, fecharPopup, initPopups, atualizarEquipePopup } from './ui/popups.js';

import {
    carregarEscalasStorage, salvarEscalasStorage,
    carregarExtrasStorage, salvarExtrasStorage,
    carregarPeriodoStorage, salvarPeriodoStorage,
    carregarTemaStorage, salvarTemaStorage,
    carregarPessoasStorage, salvarPessoasStorage
} from './utils/storage.js';

//import { recarregarPessoas } from './core/pessoas.js';
import { getPessoas, recarregarPessoas } from './core/pessoas.js';
// =====================================================
// VARIÁVEIS GLOBAIS
// =====================================================

let equipes = carregarEscalasStorage() || JSON.parse(JSON.stringify(escalasPadrao));
let horasExtras = carregarExtrasStorage() || [];
let pessoas = carregarPessoasStorage() || [];
let equipeSelecionada = equipes[0] || null;
let periodoIndex = carregarPeriodoStorage() || 0;
let temaEscuro = carregarTemaStorage() || false;

// =====================================================
// DOM REFS
// =====================================================

const DOM = {
    botoesEquipe: document.getElementById('botoesEquipe'),
    numPessoasEscala: document.getElementById('numPessoasEscala'),
    numManha: document.getElementById('numManha'),
    numTarde: document.getElementById('numTarde'),
    numNoite: document.getElementById('numNoite'),
    calendarioContainer: document.getElementById('calendarioContainer'),
    legendaFeriados: document.getElementById('legendaFeriados'),
    listaExtrasContainer: document.getElementById('listaExtrasContainer'),
    totalExtraModal: document.getElementById('totalExtraModal'),
    popupEstatisticas: document.getElementById('popupEstatisticas'),
    popupEstatisticasConteudo: document.getElementById('popupEstatisticasConteudo'),
    popupConteudo: document.getElementById('popupConteudo'),
    popupTotal: document.getElementById('popupTotal'),
    popupTitulo: document.getElementById('popupTitulo'),
    loadingOverlay: document.getElementById('loadingOverlay'),
};

// =====================================================
// FUNÇÕES DE RENDERIZAÇÃO
// =====================================================

function obterStatusDia(equipe, data) {
    if (!equipe) return 0;
    const ciclo = getCicloCompleto(equipe);
    if (!ciclo || ciclo.length === 0) return 0;
    const diffDias = Math.floor((data - DATA_REFERENCIA) / (1000 * 60 * 60 * 24));
    const totalDias = ciclo.length;
    const posicao = ((diffDias % totalDias) + totalDias) % totalDias;
    return ciclo[posicao] || 0;
}

function getDataComemorativa(dia, mes) {
    const chave = `${String(dia).padStart(2, '0')}-${String(mes).padStart(2, '0')}`;
    return feriados[chave] || null;
}

function getExtrasPorData(dataStr) {
    return horasExtras.filter(item => item.data === dataStr);
}

function renderizarCalendario() {
    const container = DOM.calendarioContainer;
    if (!container) return;
    
    const periodo = getPeriodoPorIndex(periodoIndex);
    const mesIndex = periodo.inicio.getMonth();

    const corHeaderFundo = coresHeaderFundo[mesIndex] || '#f1f5f9';
    const corHeaderTexto = coresHeaderTexto[mesIndex] || '#1e293b';
    const corHeaderBorda = coresHeaderBorda[mesIndex] || '#3B82F6';

    const mesesClasses = ['mes-jan', 'mes-fev', 'mes-mar', 'mes-abr', 'mes-mai', 'mes-jun',
                          'mes-jul', 'mes-ago', 'mes-set', 'mes-out', 'mes-nov', 'mes-dez'];
    
    container.className = '';
    container.classList.add('calendario', mesesClasses[mesIndex]);

    const mesInicio = periodo.inicio.getMonth();
    const mesFim = periodo.fim.getMonth();
    const anoInicio = periodo.inicio.getFullYear();
    const anoFim = periodo.fim.getFullYear();

    let primeiroDia;
    if (mesInicio !== mesFim || anoInicio !== anoFim) {
        primeiroDia = new Date(periodo.inicio);
        const diaSemanaRef = primeiroDia.getDay();
        primeiroDia.setDate(primeiroDia.getDate() - diaSemanaRef);
    } else {
        primeiroDia = new Date(periodo.inicio.getFullYear(), periodo.inicio.getMonth(), 1);
        const diaSemana = primeiroDia.getDay();
        primeiroDia.setDate(primeiroDia.getDate() - diaSemana);
    }

    const hoje = new Date();
    const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

    let html = `<table>
        <thead>
            <tr>`;
    
    DIAS_SEMANA.forEach(dia => {
        html += `<th style="background: ${corHeaderFundo}; color: ${corHeaderTexto}; border-bottom: 3px solid ${corHeaderBorda};">${dia}</th>`;
    });
    html += '</tr></thead><tbody>';

    let dataAtual = new Date(primeiroDia);
    let rowOpen = false;

    for (let i = 0; i < 42; i++) {
        if (i % 7 === 0) {
            if (rowOpen) html += '</tr>';
            html += `<tr>`;
            rowOpen = true;
        }

        const dia = dataAtual.getDate();
        const mes = dataAtual.getMonth() + 1;
        const ano = dataAtual.getFullYear();
        const dataStr = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

        const status = obterStatusDia(equipeSelecionada, dataAtual);
        const isHoje = dataStr === hojeStr;
        const noPeriodo = dataEstaNoPeriodo(dataAtual, periodo);
        const dataComemorativa = getDataComemorativa(dia, mes);
        const extras = getExtrasPorData(dataStr);
        const temExtra = extras.length > 0;
        const totalExtraDia = extras.reduce((acc, item) => acc + item.horas, 0);

        const classePeriodo = noPeriodo ? '' : 'dia-outro-periodo';
        const classeHoje = isHoje ? 'dia-hoje' : '';
        const classeExtra = temExtra ? 'dia-com-extra' : '';
        const statusTexto = status === 1 ? 'T' : 'F';
        const statusClasse = status === 1 ? 'status-trabalho' : 'status-folga';

        let classeEspecial = '';
        let iconeEspecial = '';
        if (dataComemorativa) {
            if (dataComemorativa.tipo === 'feriado') {
                classeEspecial = status === 1 ? 'dia-feriado-trabalhado' : 'dia-feriado';
                iconeEspecial = `<span class="evento-icone">${dataComemorativa.icone}${status === 1 ? '⚠️' : ''}</span>`;
            } else {
                classeEspecial = 'dia-comemorativo';
                iconeEspecial = `<span class="evento-icone">${dataComemorativa.icone}</span>`;
            }
        }

        let labelExtra = '';
        if (temExtra) {
            const extraMin = Math.round(totalExtraDia * 60);
            const h = Math.floor(extraMin / 60);
            const m = extraMin % 60;
            labelExtra = `<span class="evento-extra">➕ ${h > 0 ? h + 'h' : ''}${m > 0 ? m + 'min' : ''}</span>`;
        }

        // 🔥 ADICIONAR ONCLICK PARA ABRIR DETALHES
        html += `<td class="${classeHoje} ${classeExtra} ${classeEspecial} ${classePeriodo}" 
                    data-data="${dataStr}"
                    onclick="window.abrirDetalhesDia('${dataStr}')"
                    style="cursor:pointer;">
            <span class="status-dia ${statusClasse}">${statusTexto}</span>
            <span class="dia-numero">${dia}</span>
            ${iconeEspecial}
            ${labelExtra}
        </td>`;

        dataAtual.setDate(dataAtual.getDate() + 1);
    }

    if (rowOpen) html += '</tr>';
    html += '</tbody></table>';
    container.innerHTML = html;
}

// --- BOTÕES EQUIPE ---
function renderizarBotoesEquipe() {
    const container = DOM.botoesEquipe;
    if (!container) return;
    container.innerHTML = '';
    
    // 🔥 CORES FORTES PARA CADA ESCALA
    const coresEscalas = {
        1: { bg: '#3B82F6', hover: '#1D4ED8', text: '#FFFFFF' },
        2: { bg: '#EF4444', hover: '#B91C1C', text: '#FFFFFF' },
        3: { bg: '#8B5CF6', hover: '#6D28D9', text: '#FFFFFF' },
        4: { bg: '#F59E0B', hover: '#B45309', text: '#FFFFFF' }
    };
    
    // 🔥 ÍCONES SVG PARA CADA ESCALA
    const iconesEscalas = {
        1: 'icon-calendar',
        2: 'icon-calendar-month',
        3: 'icon-calendar',
        4: 'icon-calendar'
    };
    
    equipes.forEach(equipe => {
        const btn = document.createElement('button');
        const isSelected = equipeSelecionada && equipe.id === equipeSelecionada.id;
        const cores = coresEscalas[equipe.id] || coresEscalas[1];
        const icone = iconesEscalas[equipe.id] || 'icon-calendar';
        
        // 🔥 VERIFICAR SE É ADM
        const isADM = equipe.tipo === 'ADM';
        const admBadge = isADM ? `<span class="adm-badge" style="font-size:0.5rem; background:#10B981; color:white; padding:1px 6px; border-radius:4px; margin-left:2px;">ADM</span>` : '';
        
        // 🔥 BOTÃO COM SVG + NÚMERO + BADGE ADM
        btn.innerHTML = `
            <svg class="icon" width="20" height="20" style="fill: ${isSelected ? '#FFFFFF' : cores.bg}; transition: fill 0.3s ease;">
                <use href="assets/icons/sprite.svg#${icone}"></use>
            </svg>
            <span>${equipe.id}</span>
            ${admBadge}
        `;
        
        btn.setAttribute('aria-label', `Selecionar escala ${equipe.id}${isADM ? ' - ADM' : ''}`);
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        
        // Estilos base
        btn.style.cssText = `
            padding: 10px 16px;
            border: 3px solid ${cores.bg};
            border-radius: 12px;
            background: ${isSelected ? cores.bg : 'transparent'};
            color: ${isSelected ? cores.text : cores.bg};
            font-weight: 800;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            min-width: 60px;
            flex: 1;
            max-width: ${isADM ? '120px' : '100px'};
            text-align: center;
            font-family: var(--font-family, system-ui, sans-serif);
            box-shadow: ${isSelected ? `0 4px 15px ${cores.bg}40` : 'none'};
            transform: ${isSelected ? 'scale(1.05)' : 'scale(1)'};
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            will-change: transform, box-shadow, background;
        `;
        
        // Hover
        btn.addEventListener('mouseenter', () => {
            if (!isSelected) {
                btn.style.background = cores.bg + '20';
                btn.style.transform = 'scale(1.05)';
                btn.style.boxShadow = `0 4px 12px ${cores.bg}30`;
                const svg = btn.querySelector('svg');
                if (svg) svg.style.fill = cores.bg;
            }
        });
        
        btn.addEventListener('mouseleave', () => {
            if (!isSelected) {
                btn.style.background = 'transparent';
                btn.style.transform = 'scale(1)';
                btn.style.boxShadow = 'none';
                const svg = btn.querySelector('svg');
                if (svg) svg.style.fill = cores.bg;
            }
        });
        
        // Clique
        btn.addEventListener('click', () => {
            selecionarEquipe(equipe);
        });
        
        container.appendChild(btn);
    });
}

function selecionarEquipe(equipe) {
    equipeSelecionada = equipe;
    if (typeof atualizarEquipePopup === 'function') {
        atualizarEquipePopup(equipe);
    }
    renderizarBotoesEquipe();
    renderizarCalendario();
    renderizarLegendaFeriados();
    atualizarPeriodoInfo();
    atualizarContadores();
}

// --- CONTADORES ---
function atualizarContadores() {
    const pessoasEscala = pessoas.filter(p => p.escalaId === equipeSelecionada?.id);
    if (DOM.numPessoasEscala) DOM.numPessoasEscala.textContent = pessoasEscala.length;
    if (DOM.numManha) DOM.numManha.textContent = pessoasEscala.filter(p => p.turno === 'M').length;
    if (DOM.numTarde) DOM.numTarde.textContent = pessoasEscala.filter(p => p.turno === 'T').length;
    if (DOM.numNoite) DOM.numNoite.textContent = pessoasEscala.filter(p => p.turno === 'N').length;
}

// --- LEGENDA ---
function renderizarLegendaFeriados() {
    const container = DOM.legendaFeriados;
    if (!container) return;
    const periodo = getPeriodoPorIndex(periodoIndex);
    const feriadosPeriodo = getFeriadosDoPeriodo(periodo);
    if (feriadosPeriodo.length === 0) { container.innerHTML = ''; return; }
    let html = '';
    feriadosPeriodo.forEach(item => {
        const classe = item.trabalhado ? 'trabalhado' : item.tipo;
        const sufixo = item.trabalhado ? ' ⚠️' : '';
        html += `<span class="feriado-item"><span class="bullet ${classe}"></span>${item.icone} ${item.nome}${sufixo}</span>`;
    });
    container.innerHTML = html;
}

function getFeriadosDoPeriodo(periodo) {
    const resultados = [];
    const dataAtual = new Date(periodo.inicio);
    while (dataAtual <= periodo.fim) {
        const dia = dataAtual.getDate();
        const mes = dataAtual.getMonth() + 1;
        const dataComemorativa = getDataComemorativa(dia, mes);
        if (dataComemorativa) {
            const status = obterStatusDia(equipeSelecionada, dataAtual);
            resultados.push({
                data: new Date(dataAtual),
                ...dataComemorativa,
                trabalhado: status === 1
            });
        }
        dataAtual.setDate(dataAtual.getDate() + 1);
    }
    return resultados;
}

function atualizarPeriodoInfo() {
    const periodo = getPeriodoPorIndex(periodoIndex);
    const periodoNome = document.getElementById('periodoNome');
    if (periodoNome) {
        // 🔥 Usar o novo formato com 3 letras
        periodoNome.textContent = getNomePeriodo(periodo);
    }
}

function mudarPeriodo(delta) {
    periodoIndex += delta;
    salvarPeriodoStorage(periodoIndex);
    renderizarCalendario();
    renderizarLegendaFeriados();
    atualizarPeriodoInfo();
}

// =====================================================
// POPUP FUNCIONÁRIOS ADM
// =====================================================

function abrirPopupADM() {
    const overlay = document.getElementById('popupOverlay');
    const titulo = document.getElementById('popupTitulo');
    const conteudo = document.getElementById('popupConteudo');
    const total = document.getElementById('popupTotal');

    if (!overlay) {
        console.error('❌ Elemento overlay do popup não encontrado!');
        return;
    }

    const todasPessoas = getPessoas();
    const pessoasADM = todasPessoas.filter(p => p.tipo === 'ADM');

    if (titulo) {
        titulo.innerHTML = `
            <svg class="icon" width="20" height="20" style="color:#10B981;">
                <use href="assets/icons/sprite.svg#icon-contacts"></use>
            </svg>
            Funcionários Administrativos
        `;
    }

    pessoasADM.sort((a, b) => a.nome.localeCompare(b.nome));

    if (conteudo) {
        if (pessoasADM.length === 0) {
            conteudo.innerHTML = `
                <div style="text-align:center; padding: 40px 20px; color: var(--color-text-muted, #64748b);">
                    <svg class="icon" width="48" height="48" style="opacity:0.3; color:#10B981;">
                        <use href="assets/icons/sprite.svg#icon-contacts"></use>
                    </svg>
                    <p style="margin-top:12px; font-size:0.95rem;">
                        Nenhum funcionário administrativo cadastrado.
                    </p>
                    <small style="font-size:0.75rem;">Para adicionar, selecione "ADM" no campo "Tipo" ao cadastrar.</small>
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
                    background: #10B981;
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
                        <use href="assets/icons/sprite.svg#icon-contacts"></use>
                    </svg>
                    Administrativos (${pessoasADM.length})
                </div>
            `;
            
            pessoasADM.forEach(p => {
                const cores = coresTurnos[p.turno] || coresTurnos['M'];
                
                html += `
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 12px 16px;
                        background: var(--color-bg, #f8fafc);
                        border-radius: 10px;
                        border-left: 4px solid #10B981;
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
                            <span style="font-size:0.65rem; color: #10B981; font-weight:600;">
                                <svg class="icon" width="12" height="12" style="vertical-align:middle;">
                                    <use href="assets/icons/sprite.svg#icon-verified"></use>
                                </svg>
                                ADM
                            </span>
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
                    background: #10B981;
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
                        <use href="assets/icons/sprite.svg#icon-contacts"></use>
                    </svg>
                    Total: ${pessoasADM.length} funcionário${pessoasADM.length > 1 ? 's' : ''} ADM
                </div>
            `;
            conteudo.innerHTML = html;
        }
    }

    if (total) total.textContent = `ADM: ${pessoasADM.length}`;
    overlay.classList.add('ativo');
}



// --- HORAS EXTRAS ---
function renderizarListaExtras() {
    const container = DOM.listaExtrasContainer;
    const totalModal = DOM.totalExtraModal;
    if (!container) return;
    
    if (horasExtras.length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-muted); font-size: 0.8rem; text-align: center; padding: 16px;">Nenhuma hora extra registrada</p>';
        if (totalModal) totalModal.textContent = 'Total: 0h';
        return;
    }
    const sorted = [...horasExtras].sort((a, b) => b.data.localeCompare(a.data));
    let html = '';
    sorted.forEach((item) => {
        const dataFormatada = item.data.split('-').reverse().join('/');
        const index = horasExtras.indexOf(item);
        const minutos = horasParaMinutos(item.horas);
        html += `<div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; margin-bottom: 6px; background: var(--color-bg); border-radius: var(--radius-sm, 6px); border: 1px solid var(--color-border);">
            <div style="font-size: 0.8rem; color: var(--color-text);">
                <strong>📅 ${dataFormatada}</strong> 
                <span style="color: var(--color-text-muted); font-size: 0.75rem;">(${item.inicio || '08:00'} às ${item.fim || '18:00'})</span>
                <span style="margin-left: 6px; font-weight: 600; color: var(--color-primary);">${formatarMinutos(minutos)}</span>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="window.removerExtra(${index})" aria-label="Remover hora extra" style="color: var(--color-danger, #ef4444); padding: 4px 8px;">✕</button>
        </div>`;
    });
    container.innerHTML = html;
    const totalMin = horasParaMinutos(getTotalExtras());
    if (totalModal) totalModal.textContent = `Total: ${formatarMinutos(totalMin)}`;
}

function getTotalExtras() {
    return horasExtras.reduce((acc, item) => acc + (item.horas || 0), 0);
}

function salvarExtra() {
    const data = document.getElementById('inputDataExtra')?.value;
    const inicio = document.getElementById('inputInicioExtra')?.value;
    const fim = document.getElementById('inputFimExtra')?.value;

    if (!data || !inicio || !fim) {
        mostrarToast('Preencha todos os campos!', 'erro');
        return;
    }

    const [hInicio, mInicio] = inicio.split(':').map(Number);
    const [hFim, mFim] = fim.split(':').map(Number);

    let totalMinutos = (hFim * 60 + mFim) - (hInicio * 60 + mInicio);
    if (totalMinutos < 0) totalMinutos += 1440;

    const horas = totalMinutos / 60;

    if (horas <= 0) {
        mostrarToast('Horário inválido!', 'erro');
        return;
    }

    horasExtras.push({ data, inicio, fim, horas });
    salvarExtrasStorage(horasExtras);
    renderizarListaExtras();
    renderizarCalendario();
    renderizarLegendaFeriados();
    mostrarToast('✅ Hora extra adicionada com sucesso!', 'sucesso');
    fecharModalExtra();
}

function removerExtra(index) {
    if (index >= 0 && index < horasExtras.length) {
        if (confirm('Remover esta hora extra?')) {
            horasExtras.splice(index, 1);
            salvarExtrasStorage(horasExtras);
            renderizarListaExtras();
            renderizarCalendario();
            renderizarLegendaFeriados();
            mostrarToast('🗑️ Hora extra removida', 'info');
        }
    }
}

// --- PESSOAS ---
function salvarPessoa() {
    const nome = document.getElementById('inputNomePessoa')?.value?.trim();
    const cargo = document.getElementById('inputCargoPessoa')?.value?.trim() || '';
    const empresa = document.getElementById('inputEmpresaPessoa')?.value?.trim() || '';
    const contato = document.getElementById('inputContatoPessoa')?.value?.trim() || '';
    const escalaId = parseInt(document.getElementById('inputEscalaPessoa')?.value || '1');
    const turno = document.getElementById('inputTurnoPessoa')?.value || 'M';
    const tipo = document.getElementById('inputTipoPessoa')?.value || 'OPERACIONAL';
    const editando = document.getElementById('modalPessoa')?.dataset?.editando;

    if (!nome) {
        mostrarToast('❌ Digite o nome do funcionário!', 'erro');
        return;
    }

    // Verificar duplicado
    const duplicado = pessoas.find(p => p.nome.toLowerCase() === nome.toLowerCase() && p.escalaId === escalaId);
    if (duplicado && !editando) {
        mostrarToast('⚠️ Funcionário já cadastrado nesta escala!', 'erro');
        return;
    }

    // 🔥 GARANTIR QUE O TIPO ESTÁ SENDO SALVO
    if (editando) {
        const index = pessoas.findIndex(p => p.id === parseInt(editando));
        if (index !== -1) {
            pessoas[index] = { 
                ...pessoas[index], 
                nome, 
                cargo,
                empresa,
                contato, 
                escalaId, 
                turno, 
                tipo: tipo || 'OPERACIONAL'  // ← Garantir tipo
            };
        }
        mostrarToast('✅ Funcionário atualizado com sucesso!', 'sucesso');
    } else {
        const novaPessoa = { 
            id: Date.now(), 
            nome, 
            cargo,
            empresa,
            contato, 
            escalaId, 
            turno, 
            tipo: tipo || 'OPERACIONAL'  // ← Garantir tipo
        };
        pessoas.push(novaPessoa);
        console.log('📝 Novo funcionário cadastrado:', novaPessoa); // ← Debug
        mostrarToast('✅ Funcionário cadastrado com sucesso!', 'sucesso');
    }

    salvarPessoasStorage(pessoas);
    atualizarContadores();
    fecharModalPessoa();
    
    // 🔥 FORÇAR RECARREGAR DADOS NO POPUP
    if (typeof recarregarPessoas === 'function') {
        recarregarPessoas();
    }
}

function removerPessoa(id) {
    if (confirm('Tem certeza que deseja remover este funcionário?')) {
        pessoas = pessoas.filter(p => p.id !== id);
        salvarPessoasStorage(pessoas);
        atualizarContadores();
        mostrarToast('🗑️ Funcionário removido', 'info');
        fecharPopup();
    }
}

function editarFuncionario(id) {
    console.log('✏️ Editando funcionário ID:', id);
    
    // 🔥 FECHAR POPUP ANTES DE ABRIR MODAL
    fecharPopup();
    
    // 🔥 BUSCAR O FUNCIONÁRIO PELO ID
    const pessoa = pessoas.find(p => p.id === parseInt(id) || p.id === String(id));
    
    if (!pessoa) {
        console.error('❌ Funcionário não encontrado! ID:', id);
        mostrarToast('❌ Funcionário não encontrado!', 'erro');
        return;
    }
    
    console.log('📝 Funcionário encontrado:', pessoa);
    
    // 🔥 ABRIR MODAL COM OS DADOS DO FUNCIONÁRIO
    abrirModalPessoa(id);
}

// --- ESTATÍSTICAS ---
function abrirEstatisticas() {
    const overlay = DOM.popupEstatisticas;
    const conteudo = DOM.popupEstatisticasConteudo;
    if (!overlay || !conteudo) return;
    
    const periodo = getPeriodoPorIndex(periodoIndex);
    const diasNoPeriodo = getDiasNoPeriodo(periodo);

    let trabalhos = 0, folgas = 0, feriadosCount = 0, feriadosTrabalhadosCount = 0, horasTrabalhadas = 0;
    const dataAtual = new Date(periodo.inicio);

    while (dataAtual <= periodo.fim) {
        const status = obterStatusDia(equipeSelecionada, dataAtual);
        const dia = dataAtual.getDate();
        const mes = dataAtual.getMonth() + 1;
        const dataComemorativa = getDataComemorativa(dia, mes);

        if (dataComemorativa && dataComemorativa.tipo === 'feriado') {
            feriadosCount++;
            if (status === 1) feriadosTrabalhadosCount++;
        }

        if (status === 1) {
            trabalhos++;
            horasTrabalhadas += 9;
        } else {
            folgas++;
        }
        dataAtual.setDate(dataAtual.getDate() + 1);
    }

    const minutosTrabalhados = horasParaMinutos(horasTrabalhadas);
    const totalExtrasPeriodo = horasExtras.filter(item => {
        const data = new Date(item.data + 'T00:00:00');
        return data >= periodo.inicio && data <= periodo.fim;
    }).reduce((acc, item) => acc + item.horas, 0);
    const totalExtrasMin = horasParaMinutos(totalExtrasPeriodo);
    const percentual = diasNoPeriodo > 0 ? Math.round((trabalhos / diasNoPeriodo) * 100) : 0;

    const pessoasEscala = pessoas.filter(p => p.escalaId === equipeSelecionada?.id);
    const turnos = {
        M: pessoasEscala.filter(p => p.turno === 'M').length,
        T: pessoasEscala.filter(p => p.turno === 'T').length,
        N: pessoasEscala.filter(p => p.turno === 'N').length
    };

    // 🔥 NOVO LAYOUT EM CARDS
    conteudo.innerHTML = `
        <div class="estatisticas-grid">
            
            <!-- Período -->
            <div class="estatistica-card periodo">
                <div class="estatistica-icon">📅</div>
                <div class="estatistica-info">
                    <span class="estatistica-label">Período</span>
                    <span class="estatistica-valor">${formatarDataPeriodo(periodo.inicio)} a ${formatarDataPeriodo(periodo.fim)}</span>
                </div>
            </div>
            
            <!-- Total de Dias -->
            <div class="estatistica-card total-dias">
                <div class="estatistica-icon">📊</div>
                <div class="estatistica-info">
                    <span class="estatistica-label">Total de Dias</span>
                    <span class="estatistica-valor">${diasNoPeriodo}</span>
                </div>
            </div>
            
            <!-- Dias Trabalhados -->
            <div class="estatistica-card trabalhados">
                <div class="estatistica-icon">💼</div>
                <div class="estatistica-info">
                    <span class="estatistica-label">Dias Trabalhados</span>
                    <span class="estatistica-valor" style="color:#3B82F6;">${trabalhos}</span>
                </div>
            </div>
            
            <!-- Dias de Folga -->
            <div class="estatistica-card folga">
                <div class="estatistica-icon">🏖️</div>
                <div class="estatistica-info">
                    <span class="estatistica-label">Dias de Folga</span>
                    <span class="estatistica-valor" style="color:#10B981;">${folgas}</span>
                </div>
            </div>
            
            <!-- Feriados -->
            <div class="estatistica-card feriados">
                <div class="estatistica-icon">📅</div>
                <div class="estatistica-info">
                    <span class="estatistica-label">Feriados</span>
                    <span class="estatistica-valor" style="color:#EF4444;">${feriadosCount}</span>
                </div>
            </div>
            
            <!-- Feriados Trabalhados -->
            <div class="estatistica-card feriados-trab">
                <div class="estatistica-icon">⚠️</div>
                <div class="estatistica-info">
                    <span class="estatistica-label">Feriados Trab.</span>
                    <span class="estatistica-valor" style="color:#DC2626;">${feriadosTrabalhadosCount}</span>
                </div>
            </div>
            
            <!-- Horas Efetivas -->
            <div class="estatistica-card horas">
                <div class="estatistica-icon">⏱️</div>
                <div class="estatistica-info">
                    <span class="estatistica-label">Horas Efetivas</span>
                    <span class="estatistica-valor" style="color:#059669;">${formatarMinutos(minutosTrabalhados)}</span>
                </div>
            </div>
            
            <!-- % Trabalhado -->
            <div class="estatistica-card percentual">
                <div class="estatistica-icon">📊</div>
                <div class="estatistica-info">
                    <span class="estatistica-label">% Trabalhado</span>
                    <span class="estatistica-valor" style="color:#8B5CF6;">${percentual}%</span>
                </div>
            </div>
            
            <!-- H.Extra Período -->
            <div class="estatistica-card extra">
                <div class="estatistica-icon">⏰</div>
                <div class="estatistica-info">
                    <span class="estatistica-label">H.Extra Período</span>
                    <span class="estatistica-valor" style="color:#F59E0B;">${formatarMinutos(totalExtrasMin)}</span>
                </div>
            </div>
            
            <!-- Funcionários -->
            <div class="estatistica-card funcionarios">
                <div class="estatistica-icon">👥</div>
                <div class="estatistica-info">
                    <span class="estatistica-label">Funcionários</span>
                    <span class="estatistica-valor">${pessoasEscala.length}</span>
                </div>
            </div>
            
            <!-- Manhã -->
            <div class="estatistica-card manha">
                <div class="estatistica-icon">☀️</div>
                <div class="estatistica-info">
                    <span class="estatistica-label">Manhã</span>
                    <span class="estatistica-valor" style="color:#F59E0B;">${turnos.M}</span>
                </div>
            </div>
            
            <!-- Tarde -->
            <div class="estatistica-card tarde">
                <div class="estatistica-icon">🌆</div>
                <div class="estatistica-info">
                    <span class="estatistica-label">Tarde</span>
                    <span class="estatistica-valor" style="color:#EA580C;">${turnos.T}</span>
                </div>
            </div>
            
            <!-- Noite -->
            <div class="estatistica-card noite">
                <div class="estatistica-icon">🌙</div>
                <div class="estatistica-info">
                    <span class="estatistica-label">Noite</span>
                    <span class="estatistica-valor" style="color:#4F46E5;">${turnos.N}</span>
                </div>
            </div>
            
        </div>
    `;

    overlay.classList.add('ativo');
}

function fecharEstatisticas() {
    if (DOM.popupEstatisticas) {
        DOM.popupEstatisticas.classList.remove('ativo');
    }
}

// =====================================================
// CONFIGURAÇÃO DO PERÍODO
// =====================================================

function carregarConfigPeriodoUI() {
    try {
        const config = getConfigPeriodo();
        const inputInicio = document.getElementById('periodoDiaInicio');
        const inputFim = document.getElementById('periodoDiaFim');
        
        if (inputInicio) inputInicio.value = config.diaInicio;
        if (inputFim) inputFim.value = config.diaFim;
    } catch (e) {
        console.warn('Não foi possível carregar a configuração do período:', e);
    }
}

function aplicarPeriodo() {
    const inputInicio = document.getElementById('periodoDiaInicio');
    const inputFim = document.getElementById('periodoDiaFim');
    
    if (!inputInicio || !inputFim) {
        mostrarToast('❌ Configuração de período não encontrada!', 'erro');
        return;
    }
    
    let diaInicio = parseInt(inputInicio.value);
    let diaFim = parseInt(inputFim.value);
    
    if (isNaN(diaInicio) || isNaN(diaFim) || diaInicio < 1 || diaInicio > 31 || diaFim < 1 || diaFim > 31) {
        mostrarToast('❌ Digite dias entre 1 e 31!', 'erro');
        return;
    }
    
    setConfigPeriodo(diaInicio, diaFim);
    
    periodoIndex = 0;
    salvarPeriodoStorage(periodoIndex);
    
    renderizarCalendario();
    renderizarLegendaFeriados();
    atualizarPeriodoInfo();
    atualizarContadores();
    
    mostrarToast(`✅ Período: Início ${diaInicio}, Fim ${diaFim}`, 'sucesso');
}

// =====================================================
// GUIA RÁPIDO
// =====================================================

function abrirGuia() {
    const guia = `
📖 GUIA RÁPIDO - Calendário de Escalas

✅ COMO USAR:

1. 📋 Selecione uma escala (1, 2, 3 ou 4)
2. 👤 Cadastre funcionários em "Cadastrar Funcionário"
3. 👥 Clique nos contadores para ver a lista
4. ⏱️ Adicione horas extras com "H.Extra"
5. 📊 Veja estatísticas com "Estatística"
6. 📅 Altere o período no menu lateral

💡 DICAS:

- Use ESC para fechar modais
- Clique em ☰ para abrir o menu
- Período máximo de 31 dias

📞 Dúvidas? Envie um e-mail para adri0mt@uni9.edu.br
`;
    alert(guia);
}

// =====================================================
// EXPORTAR/IMPORTAR DADOS
// =====================================================

function exportarDados() {
    try {
        const dados = {
            versao: "1.0.0",
            dataExportacao: new Date().toISOString(),
            temaEscuro: temaEscuro,
            escalas: equipes,
            horasExtras: horasExtras,
            pessoas: pessoas,
            periodoConfig: {
                diaInicio: getConfigPeriodo().diaInicio,
                diaFim: getConfigPeriodo().diaFim
            }
        };

        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        const dataStr = new Date().toISOString().slice(0, 10);
        a.download = `backup_escalas_${dataStr}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        mostrarToast(`✅ Dados exportados com sucesso! (${pessoas.length} funcionários)`, 'sucesso');
    } catch (error) {
        console.error('Erro ao exportar:', error);
        mostrarToast('❌ Erro ao exportar dados!', 'erro');
    }
}

function importarDados() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    document.body.appendChild(input);
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) {
            document.body.removeChild(input);
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const dados = JSON.parse(e.target.result);
                
                if (!dados.escalas || !Array.isArray(dados.escalas)) {
                    mostrarToast('❌ Arquivo inválido!', 'erro');
                    document.body.removeChild(input);
                    return;
                }
                
                const qtdPessoas = dados.pessoas ? dados.pessoas.length : 0;
                const qtdHorasExtras = dados.horasExtras ? dados.horasExtras.length : 0;
                const qtdEscalas = dados.escalas.length;
                
                const mensagem = `⚠️ Isso irá substituir todos os dados atuais!\n\n` +
                                 `📋 ${qtdEscalas} escalas\n` +
                                 `👥 ${qtdPessoas} funcionários\n` +
                                 `⏱️ ${qtdHorasExtras} horas extras\n\n` +
                                 `Deseja continuar?`;
                
                if (!confirm(mensagem)) {
                    document.body.removeChild(input);
                    return;
                }
                
                if (dados.escalas && Array.isArray(dados.escalas) && dados.escalas.length > 0) {
                    equipes = dados.escalas;
                    salvarEscalasStorage(equipes);
                }
                
                if (dados.pessoas && Array.isArray(dados.pessoas)) {
                    pessoas = dados.pessoas;
                    salvarPessoasStorage(pessoas);
                    if (typeof recarregarPessoas === 'function') {
                        recarregarPessoas();
                    }
                }
                
                if (dados.horasExtras && Array.isArray(dados.horasExtras)) {
                    horasExtras = dados.horasExtras;
                    salvarExtrasStorage(horasExtras);
                }
                
                if (dados.temaEscuro !== undefined) {
                    temaEscuro = dados.temaEscuro;
                    salvarTemaStorage(temaEscuro);
                    aplicarTema();
                }
                
                if (dados.periodoConfig) {
                    setConfigPeriodo(dados.periodoConfig.diaInicio, dados.periodoConfig.diaFim);
                }
                
                periodoIndex = 0;
                salvarPeriodoStorage(periodoIndex);
                
                if (equipes.length > 0) {
                    equipeSelecionada = equipes[0];
                }
                
                renderizarBotoesEquipe();
                renderizarCalendario();
                renderizarLegendaFeriados();
                atualizarPeriodoInfo();
                renderizarListaExtras();
                atualizarContadores();
                
                if (typeof carregarConfigPeriodoUI === 'function') {
                    carregarConfigPeriodoUI();
                }
                
                mostrarToast(`✅ Dados importados com sucesso!\n👥 ${pessoas.length} funcionários`, 'sucesso');
                
            } catch (error) {
                console.error('Erro ao importar:', error);
                mostrarToast('❌ Erro ao importar dados!', 'erro');
            }
            
            document.body.removeChild(input);
        };
        
        reader.onerror = function() {
            mostrarToast('❌ Erro ao ler o arquivo!', 'erro');
            document.body.removeChild(input);
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function limparDados() {
    if (confirm('Tem certeza que deseja remover TODAS as horas extras?')) {
        horasExtras = [];
        salvarExtrasStorage(horasExtras);
        renderizarListaExtras();
        renderizarCalendario();
        mostrarToast('🗑️ Todas as horas extras foram removidas', 'info');
        fecharMenu();
    }
}

function resetarTudo() {
    if (confirm('⚠️ Isso irá restaurar todas as configurações para o padrão.')) {
        if (confirm('Última confirmação: TODOS os dados serão perdidos!')) {
            equipes = JSON.parse(JSON.stringify(escalasPadrao));
            salvarEscalasStorage(equipes);
            horasExtras = [];
            salvarExtrasStorage(horasExtras);
            pessoas = [];
            salvarPessoasStorage(pessoas);
            periodoIndex = 0;
            salvarPeriodoStorage(0);
            equipeSelecionada = equipes[0] || null;
            temaEscuro = false;
            aplicarTema();
            renderizarBotoesEquipe();
            renderizarCalendario();
            renderizarLegendaFeriados();
            atualizarPeriodoInfo();
            renderizarListaExtras();
            atualizarContadores();
            mostrarToast('🔄 Tudo foi resetado para o padrão!', 'sucesso');
            fecharMenu();
        }
    }
}

function abrirMelhorias() {
    fecharMenu();
    window.open(`mailto:adri0mt@uni9.edu.br?subject=${encodeURIComponent('💡 Sugestão de Melhoria - Calendário de Escalas')}`, '_blank');
}

function abrirBug() {
    fecharMenu();
    window.open(`mailto:adri0mt@uni9.edu.br?subject=${encodeURIComponent('🐛 Reporte de Bug - Calendário de Escalas')}`, '_blank');
}


// =====================================================
// OTIMIZAÇÃO DE CARREGAMENTO
// =====================================================

// =====================================================
// INIT - VERSÃO OTIMIZADA COM requestIdleCallback
// =====================================================

function init() {
    console.log('🚀 Inicializando Explorer...');
    console.log('👥 Pessoas carregadas:', pessoas);
    console.log('📋 Equipe selecionada:', equipeSelecionada);
    
    // 🔥 1. Carregar crítico primeiro (renderização imediata)
    initTema();
    initModais();
    initPopups(equipeSelecionada);

    // 🔥 2. Renderizar elementos visíveis imediatamente
    renderizarBotoesEquipe();
    renderizarCalendario();
    atualizarContadores();
    atualizarPeriodoInfo();

    // 🔥 3. Carregar o resto com requestIdleCallback (não bloqueia)
    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            console.log('🔄 Carregando elementos não críticos...');
            carregarConfigPeriodoUI();
            renderizarLegendaFeriados();
            renderizarListaExtras();
        }, { timeout: 2000 });
    } else {
        // Fallback para navegadores que não suportam requestIdleCallback
        setTimeout(() => {
            carregarConfigPeriodoUI();
            renderizarLegendaFeriados();
            renderizarListaExtras();
        }, 100);
    }

    // 🔥 4. Event listeners para fechar modais
    const modalExtra = document.getElementById('modalExtra');
    const modalPessoa = document.getElementById('modalPessoa');
    
    if (modalExtra) {
        modalExtra.addEventListener('click', function(e) {
            if (e.target === this) fecharModalExtra();
        });
    }
    
    if (modalPessoa) {
        modalPessoa.addEventListener('click', function(e) {
            if (e.target === this) fecharModalPessoa();
        });
    }

    // 🔥 5. Service Worker (carregar depois do conteúdo)
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
        requestIdleCallback(() => {
            navigator.serviceWorker.register('sw.js')
                .then(registration => console.log('✅ Service Worker registrado com sucesso!'))
                .catch(error => console.log('⚠️ Falha ao registrar Service Worker:', error));
        });
    }

    console.log('✅ Calendário inicializado!');
    console.log('📅 Período atual:', getNomePeriodo(getPeriodoPorIndex(periodoIndex)));
    console.log('👥 Funcionários:', pessoas.length);
}
// =====================================================
// EXPORTA FUNÇÕES PARA O GLOBAL (window)
// =====================================================

// 🔥 FUNÇÕES DO MENU
window.toggleMenu = toggleMenu;
window.fecharMenu = fecharMenu;

// 🔥 FUNÇÕES DO TEMA
window.toggleTema = toggleTema;

// 🔥 FUNÇÕES DOS MODAIS
window.abrirModalPessoa = abrirModalPessoa;
window.fecharModalPessoa = fecharModalPessoa;
window.abrirModalExtra = abrirModalExtra;
window.fecharModalExtra = fecharModalExtra;

// 🔥 FUNÇÕES DOS POPUPS
window.abrirPopup = abrirPopup;
window.fecharPopup = fecharPopup;

// 🔥 FUNÇÕES DE ESTATÍSTICAS
window.abrirEstatisticas = abrirEstatisticas;
window.fecharEstatisticas = fecharEstatisticas;

// 🔥 FUNÇÕES DO CALENDÁRIO
window.mudarPeriodo = mudarPeriodo;
window.selecionarEquipe = selecionarEquipe;

// 🔥 FUNÇÕES DE HORAS EXTRAS
window.salvarExtra = salvarExtra;
window.removerExtra = removerExtra;
window.renderizarListaExtras = renderizarListaExtras;

// 🔥 FUNÇÕES DE PESSOAS
window.salvarPessoa = salvarPessoa;
window.removerPessoa = removerPessoa;
window.editarFuncionario = editarFuncionario;

// 🔥 FUNÇÕES DE CONFIGURAÇÃO
window.aplicarPeriodo = aplicarPeriodo;
window.carregarConfigPeriodoUI = carregarConfigPeriodoUI;

// 🔥 FUNÇÕES DE DADOS
window.exportarDados = exportarDados;
window.importarDados = importarDados;
window.limparDados = limparDados;
window.resetarTudo = resetarTudo;

// 🔥 FUNÇÕES DE SUPORTE
window.abrirMelhorias = abrirMelhorias;
window.abrirBug = abrirBug;
window.abrirGuia = abrirGuia;

// 🔥 FUNÇÕES DE RECARGA
window.recarregarPessoas = recarregarPessoas;

console.log('✅ Funções exportadas para o window!');

// =====================================================
// ATALHOS DE TECLADO
// =====================================================

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        fecharMenu();
        fecharModalExtra();
        fecharModalPessoa();
        fecharPopup();
        fecharEstatisticas();
    }
});
// =====================================================
// POPUP DETALHES DO DIA
// =====================================================

function abrirDetalhesDia(dataStr) {
    const overlay = document.getElementById('popupDetalhesDia');
    const titulo = document.getElementById('detalhesTitulo');
    const conteudo = document.getElementById('detalhesConteudo');
    
    if (!overlay || !conteudo) return;
    
    const data = new Date(dataStr + 'T00:00:00');
    const dia = data.getDate();
    const mes = data.getMonth() + 1;
    const ano = data.getFullYear();
    
    // Formatar data
    const dataFormatada = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const nomeDia = diasSemana[data.getDay()];
    
    // Status do dia
    const status = obterStatusDia(equipeSelecionada, data);
    const statusTexto = status === 1 ? 'Trabalho' : 'Folga';
    const statusIcone = status === 1 ? 'work' : 'beach_access';
    const statusCor = status === 1 ? '#3B82F6' : '#10B981';
    
    // Feriado/Comemorativo
    const dataComemorativa = getDataComemorativa(dia, mes);
    let feriadoHtml = '';
    if (dataComemorativa) {
        const tipo = dataComemorativa.tipo === 'feriado' ? 'Feriado' : 'Comemorativo';
        const cor = dataComemorativa.tipo === 'feriado' ? '#EF4444' : '#8B5CF6';
        feriadoHtml = `
            <div class="detalhe-item" style="border-left-color: ${cor};">
                <span class="detalhe-icone">${dataComemorativa.icone}</span>
                <div>
                    <div class="detalhe-label">${tipo}</div>
                    <div class="detalhe-valor">${dataComemorativa.nome}</div>
                </div>
            </div>
        `;
    }
    
    // Horas extras do dia
    const extras = getExtrasPorData(dataStr);
    let extrasHtml = '';
    if (extras.length > 0) {
        const totalHoras = extras.reduce((acc, item) => acc + item.horas, 0);
        const extraMin = Math.round(totalHoras * 60);
        const h = Math.floor(extraMin / 60);
        const m = extraMin % 60;
        const horasStr = `${h > 0 ? h + 'h' : ''}${m > 0 ? m + 'min' : ''}`;
        extrasHtml = `
            <div class="detalhe-item" style="border-left-color: #F59E0B;">
                <span class="detalhe-icone">⏱️</span>
                <div>
                    <div class="detalhe-label">Horas Extras</div>
                    <div class="detalhe-valor" style="color: #F59E0B; font-weight: 700;">${horasStr}</div>
                </div>
            </div>
        `;
        // Listar detalhes das extras
        extras.forEach((extra, index) => {
            const extraMin2 = Math.round(extra.horas * 60);
            const h2 = Math.floor(extraMin2 / 60);
            const m2 = extraMin2 % 60;
            const horasStr2 = `${h2 > 0 ? h2 + 'h' : ''}${m2 > 0 ? m2 + 'min' : ''}`;
            extrasHtml += `
                <div class="detalhe-item" style="border-left-color: #F59E0B; padding-left: 40px; font-size: 0.85rem;">
                    <span style="color: var(--color-text-muted);">${extra.inicio || '08:00'} - ${extra.fim || '18:00'} (${horasStr2})</span>
                </div>
            `;
        });
    }
    
    // Pessoas escaladas no dia
    let pessoasHtml = '';
    const pessoasDoDia = pessoas.filter(p => {
        // Verificar se a pessoa está escalada neste dia
        const escala = equipeSelecionada?.escalas?.find(e => e.data === dataStr && e.pessoaId === p.id);
        return escala !== undefined;
    });
    
    if (pessoasDoDia.length > 0) {
        pessoasHtml = `
            <div class="detalhe-item" style="border-left-color: #8B5CF6;">
                <span class="detalhe-icone">👥</span>
                <div>
                    <div class="detalhe-label">Pessoas Escaladas</div>
                    ${pessoasDoDia.map(p => `
                        <div style="display:flex; align-items:center; gap:8px; padding: 2px 0;">
                            <span>• ${p.nome}</span>
                            <span style="font-size:0.65rem; background: var(--color-bg); padding: 0 8px; border-radius: 4px; color: var(--color-text-muted);">
                                ${p.turno === 'M' ? '☀️ Manhã' : p.turno === 'T' ? '🌆 Tarde' : '🌙 Noite'}
                            </span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    
    // Equipe selecionada
    const equipeNome = equipeSelecionada?.nome || `Escala ${equipeSelecionada?.id}`;
    
    // Montar HTML do popup
    titulo.innerHTML = `
        <span class="material-icons" style="font-size:20px; vertical-align:middle;">calendar_today</span>
        ${dataFormatada} - ${nomeDia}
    `;
    
    conteudo.innerHTML = `
        <div style="display:flex; flex-direction:column; gap:12px;">
            <!-- Status -->
            <div class="detalhe-item" style="border-left-color: ${statusCor};">
                <span class="detalhe-icone">
                    <span class="material-icons" style="font-size:24px; color: ${statusCor};">${statusIcone}</span>
                </span>
                <div>
                    <div class="detalhe-label">Status</div>
                    <div class="detalhe-valor" style="color: ${statusCor}; font-weight: 700;">${statusTexto}</div>
                </div>
            </div>
            
            <!-- Equipe -->
            <div class="detalhe-item" style="border-left-color: #3B82F6;">
                <span class="detalhe-icone">📋</span>
                <div>
                    <div class="detalhe-label">Escala</div>
                    <div class="detalhe-valor">${equipeNome}</div>
                </div>
            </div>
            
            ${feriadoHtml}
            ${extrasHtml}
            ${pessoasHtml}
            
            ${!feriadoHtml && !extrasHtml && pessoasDoDia.length === 0 ? `
                <div style="text-align:center; padding: 20px 0; color: var(--color-text-muted);">
                    <span class="material-icons" style="font-size:32px;">info</span>
                    <p style="margin-top:8px;">Nenhuma informação adicional para este dia.</p>
                </div>
            ` : ''}
        </div>
    `;
    
    overlay.classList.add('ativo');
}

function fecharDetalhesDia() {
    const overlay = document.getElementById('popupDetalhesDia');
    if (overlay) {
        overlay.classList.remove('ativo');
    }
}

// =====================================================
// EXPORTAR FUNÇÃO DETALHES DIA
// =====================================================

window.abrirDetalhesDia = abrirDetalhesDia;
window.fecharDetalhesDia = fecharDetalhesDia;
window.abrirPopupADM = abrirPopupADM;
// =====================================================
// INICIALIZAÇÃO
// =====================================================

init();