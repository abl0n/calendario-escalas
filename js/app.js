// =====================================================
// APP - Inicialização principal (OTIMIZADO v2)
// =====================================================

import { 
    escalasPadrao, 
    ESCALAS_VERSAO,
    coresMeses, 
    coresDestaque, 
    coresHeaderFundo,
    coresHeaderTexto,
    coresHeaderBorda,
    getFeriados,
    getFeriado,
    DATA_REFERENCIA, 
    DIAS_SEMANA
} from './config.js';

import { 
    mostrarToast, 
    horasParaMinutos, 
    formatarMinutos, 
    getCicloCompleto,
    formatarData
} from './utils/helpers.js';

import { 
    getPeriodoPorIndex, 
    getNomePeriodo, 
    dataEstaNoPeriodo, 
    formatarDataPeriodo, 
    getDiasNoPeriodo,
    setConfigPeriodo,
    getConfigPeriodo
} from './utils/periodos.js';

import { toggleMenu, fecharMenu } from './ui/menu.js';
import { initTema, toggleTema, aplicarTema } from './ui/tema.js';
import { 
    abrirModalPessoa, 
    fecharModalPessoa, 
    abrirModalExtra, 
    fecharModalExtra, 
    initModais 
} from './ui/modais.js';

import { 
    initPopups, 
    atualizarEquipePopup, 
    abrirPopup, 
    fecharPopup, 
    abrirPopupADM 
} from './ui/popups.js';

import {
    carregarEscalasStorage, salvarEscalasStorage,
    carregarExtrasStorage, salvarExtrasStorage,
    carregarPeriodoStorage, salvarPeriodoStorage,
    carregarTemaStorage, salvarTemaStorage,
    carregarPessoasStorage, salvarPessoasStorage
} from './utils/storage.js';

import { recarregarPessoas, getPessoas } from './core/pessoas.js';
import { CORES_ESCALAS } from './constants/cores.js';

// =====================================================
// MIGRAÇÃO AUTOMÁTICA DE ESCALAS
// =====================================================
// Se a versão do storage for menor que a do config.js,
// substitui as escalas automaticamente (útil quando
// escalasPadrao muda — ex: adicionar marcadores 'T').
// =====================================================

const versaoStorage = parseInt(localStorage.getItem('escalas_versao') || '0');
let equipes;

if (versaoStorage < ESCALAS_VERSAO) {
    console.log(`🔄 Migrando escalas v${versaoStorage} → v${ESCALAS_VERSAO}`);
    equipes = JSON.parse(JSON.stringify(escalasPadrao));
    localStorage.setItem('escalas', JSON.stringify(equipes));
    localStorage.setItem('escalas_versao', String(ESCALAS_VERSAO));
} else {
    equipes = carregarEscalasStorage() || JSON.parse(JSON.stringify(escalasPadrao));
}

// =====================================================
// VARIÁVEIS GLOBAIS
// =====================================================

let horasExtras = carregarExtrasStorage() || [];
let pessoas = carregarPessoasStorage() || [];
let equipeSelecionada = equipes[0] || null;
let periodoIndex = carregarPeriodoStorage() || 0;
let temaEscuro = carregarTemaStorage() || false;

// =====================================================
// DOM REFS (cache único)
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
    periodoNome: document.getElementById('periodoNome'),
    loadingOverlay: document.getElementById('loadingOverlay'),
};

// =====================================================
// FUNÇÕES AUXILIARES
// =====================================================

/**
 * Retorna o status de um dia:
 *   0 = folga
 *   1 = trabalho
 *   2 = trabalho + alerta de saída antecipada
 */
function obterStatusDia(equipe, data) {
    if (!equipe) return 0;
    const ciclo = getCicloCompleto(equipe);
    if (!ciclo || ciclo.length === 0) return 0;
    const diffDias = Math.floor((data - DATA_REFERENCIA) / (1000 * 60 * 60 * 24));
    const posicao = ((diffDias % ciclo.length) + ciclo.length) % ciclo.length;
    return ciclo[posicao] || 0;
}

/**
 * 🔥 Retorna objeto de status pronto para renderização.
 * Centraliza a lógica: evita duplicar "status === 2" em 3 lugares.
 */
function getStatusInfo(status) {
    switch (status) {
        case 2:
            return {
                isTrabalho: true,
                isAlerta: true,
                texto: 'Trabalho',
                textoBadge: 'T',
                icone: 'icon-work',
                cor: '#3B82F6',
                ariaLabel: 'trabalho com alerta de saída antecipada em 1 hora'
            };
        case 1:
            return {
                isTrabalho: true,
                isAlerta: false,
                texto: 'Trabalho',
                textoBadge: 'T',
                icone: 'icon-work',
                cor: '#3B82F6',
                ariaLabel: 'trabalho'
            };
        default:
            return {
                isTrabalho: false,
                isAlerta: false,
                texto: 'Folga',
                textoBadge: 'F',
                icone: 'icon-beach',
                cor: '#10B981',
                ariaLabel: 'folga'
            };
    }
}

function getDataComemorativa(dia, mes, ano) {
    const chave = `${String(dia).padStart(2, '0')}-${String(mes).padStart(2, '0')}`;
    return getFeriados(ano)[chave] || null;
}

function getExtrasPorData(dataStr) {
    return horasExtras.filter(item => item.data === dataStr);
}

function getTotalExtras() {
    return horasExtras.reduce((acc, item) => acc + (item.horas || 0), 0);
}

/**
 * 🔥 Filtra horas extras pelo período atual.
 * Reutilizada em várias funções.
 */
function getExtrasDoPeriodoAtual() {
    const periodo = getPeriodoPorIndex(periodoIndex);
    return horasExtras.filter(item => {
        const d = new Date(item.data + 'T00:00:00');
        return d >= periodo.inicio && d <= periodo.fim;
    });
}

// =====================================================
// RENDERIZAR CALENDÁRIO
// =====================================================

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

    // Calcular primeiro dia do calendário
    const mesInicio = periodo.inicio.getMonth();
    const mesFim = periodo.fim.getMonth();
    const anoInicio = periodo.inicio.getFullYear();
    const anoFim = periodo.fim.getFullYear();

    let primeiroDia;
    if (mesInicio !== mesFim || anoInicio !== anoFim) {
        primeiroDia = new Date(periodo.inicio);
        primeiroDia.setDate(primeiroDia.getDate() - primeiroDia.getDay());
    } else {
        primeiroDia = new Date(anoInicio, mesInicio, 1);
        primeiroDia.setDate(primeiroDia.getDate() - primeiroDia.getDay());
    }

    const hoje = new Date();
    const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

    // Cabeçalho
    let html = `<table role="grid" aria-label="Calendário de escalas"><thead><tr>`;
    
    DIAS_SEMANA.forEach(dia => {
        const isDomingo = dia === 'DOM';
        const styleDomingo = isDomingo 
            ? 'background:#DC2626;color:#FFFFFF;border-bottom:3px solid #B91C1C;' 
            : `background:${corHeaderFundo};color:${corHeaderTexto};border-bottom:3px solid ${corHeaderBorda};`;
        
        html += `<th role="columnheader" scope="col" style="${styleDomingo}">${dia}</th>`;
    });
    
    html += '</tr></thead><tbody>';

    // Loop de 42 dias
    let dataAtual = new Date(primeiroDia);
    let rowOpen = false;

    for (let i = 0; i < 42; i++) {
        if (i % 7 === 0) {
            if (rowOpen) html += '</tr>';
            html += `<tr role="row">`;
            rowOpen = true;
        }

        const dia = dataAtual.getDate();
        const mes = dataAtual.getMonth() + 1;
        const ano = dataAtual.getFullYear();
        const dataStr = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

        const status = obterStatusDia(equipeSelecionada, dataAtual);
        const info = getStatusInfo(status);   // 🔥 centralizado

        const isHoje = dataStr === hojeStr;
        const noPeriodo = dataEstaNoPeriodo(dataAtual, periodo);
        const dataComemorativa = getDataComemorativa(dia, mes, ano);
        const extras = getExtrasPorData(dataStr);
        const temExtra = extras.length > 0;
        const totalExtraDia = extras.reduce((acc, item) => acc + item.horas, 0);

        const classePeriodo = noPeriodo ? '' : 'dia-outro-periodo';
        const classeHoje = isHoje ? 'dia-hoje' : '';
        const classeExtra = temExtra ? 'dia-com-extra' : '';
        const classeAlerta = info.isAlerta ? 'dia-alerta-saida' : '';   // 🔥

        let classeEspecial = '';
        let iconeEvento = '';
        let nomeEvento = '';
        
        if (dataComemorativa) {
            nomeEvento = dataComemorativa.nome;
            if (dataComemorativa.tipo === 'feriado') {
                classeEspecial = info.isTrabalho ? 'dia-feriado-trabalhado' : 'dia-feriado';
                iconeEvento = dataComemorativa.icone;
            } else {
                classeEspecial = 'dia-comemorativo';
                iconeEvento = dataComemorativa.icone;
            }
        }

        let labelExtra = '';
        if (temExtra) {
            const extraMin = Math.round(totalExtraDia * 60);
            const h = Math.floor(extraMin / 60);
            const m = extraMin % 60;
            labelExtra = `➕${h > 0 ? h + 'h' : ''}${m > 0 ? m + 'min' : ''}`;
        }

        // ARIA-LABEL
        const meses = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
        let ariaLabel = `${dia} de ${meses[mes - 1]}, ${info.ariaLabel}`;
        if (nomeEvento) ariaLabel += `, ${nomeEvento}`;
        if (temExtra) ariaLabel += `, ${Math.round(totalExtraDia * 60)} minutos extras`;

        const isFeriadoTrabalhado = info.isTrabalho && dataComemorativa?.tipo === 'feriado';

        html += `<td class="dia-td ${classePeriodo}" data-data="${dataStr}">
    <button 
        class="dia-btn ${classeHoje} ${classeExtra} ${classeEspecial} ${classeAlerta}"
        type="button"
        tabindex="0"
        data-data="${dataStr}"
        aria-label="${ariaLabel}"
        onclick="window.abrirDetalhesDia('${dataStr}')"
    >
        <span class="dia-sup-esq" aria-hidden="true">${dia}</span>
        <span class="dia-sup-dir ${info.isTrabalho ? 'status-trabalho' : 'status-folga'}" aria-hidden="true">${info.textoBadge}</span>
        <span class="dia-inf-esq ${isFeriadoTrabalhado ? 'feriado-trabalhado' : ''}" aria-hidden="true">${iconeEvento}</span>
        <span class="dia-inf-dir ${temExtra ? 'tem-mensagem' : ''}" aria-hidden="true">${labelExtra}</span>
    </button>
</td>`;

        dataAtual.setDate(dataAtual.getDate() + 1);
    }

    if (rowOpen) html += '</tr>';
    html += '</tbody></table>';
    container.innerHTML = html;

    // Navegação por teclado
    container.querySelectorAll('.dia-btn').forEach(btn => {
        btn.addEventListener('keydown', function(e) {
            const todos = Array.from(container.querySelectorAll('.dia-btn'));
            const idx = todos.indexOf(this);
            const cols = 7;
            let novoIdx = -1;

            switch(e.key) {
                case 'ArrowRight': novoIdx = idx + 1; break;
                case 'ArrowLeft':  novoIdx = idx - 1; break;
                case 'ArrowDown':  novoIdx = idx + cols; break;
                case 'ArrowUp':    novoIdx = idx - cols; break;
                case 'Home':       novoIdx = 0; break;
                case 'End':        novoIdx = todos.length - 1; break;
                default: return;
            }

            e.preventDefault();

            if (novoIdx >= 0 && novoIdx < todos.length) {
                todos[novoIdx].focus();
                todos[novoIdx].scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        });
    });
}

// =====================================================
// BOTÕES EQUIPE
// =====================================================

function renderizarBotoesEquipe() {
    const container = DOM.botoesEquipe;
    if (!container) return;
    container.innerHTML = '';
    
    const iconesEscalas = ['icon-calendar', 'icon-calendar-month', 'icon-calendar', 'icon-calendar'];

    equipes.forEach(equipe => {
        const isSelected = equipeSelecionada?.id === equipe.id;
        const cores = CORES_ESCALAS[equipe.id] || CORES_ESCALAS[1];
        const icone = iconesEscalas[equipe.id - 1] || 'icon-calendar';
        const isADM = equipe.tipo === 'ADM';

        const btn = document.createElement('button');
        btn.innerHTML = `
            <svg class="icon" width="20" height="20" style="fill: ${isSelected ? '#FFFFFF' : cores.bg};">
                <use href="assets/icons/sprite.svg#${icone}"></use>
            </svg>
            <span>${equipe.id}</span>
            ${isADM ? `<span class="adm-badge">ADM</span>` : ''}
        `;

        btn.className = isSelected ? 'ativo' : '';
        btn.setAttribute('aria-label', `Selecionar escala ${equipe.id}${isADM ? ' - ADM' : ''}`);
        btn.setAttribute('role', 'tab');
        btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');

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
            font-family: inherit;
            box-shadow: ${isSelected ? `0 4px 15px ${cores.bg}40` : 'none'};
            transform: ${isSelected ? 'scale(1.05)' : 'scale(1)'};
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        `;

        btn.addEventListener('mouseenter', () => {
            if (!isSelected) {
                btn.style.background = cores.bg + '20';
                btn.style.transform = 'scale(1.05)';
                btn.style.boxShadow = `0 4px 12px ${cores.bg}30`;
            }
        });

        btn.addEventListener('mouseleave', () => {
            if (!isSelected) {
                btn.style.background = 'transparent';
                btn.style.transform = 'scale(1)';
                btn.style.boxShadow = 'none';
            }
        });

        btn.addEventListener('click', () => selecionarEquipe(equipe));
        container.appendChild(btn);
    });
}

function selecionarEquipe(equipe) {
    equipeSelecionada = equipe;
    
    import('./core/estatisticas.js').then(module => {
        if (module.initEstatisticas) module.initEstatisticas(equipe);
    });

    if (typeof atualizarEquipePopup === 'function') atualizarEquipePopup(equipe);
    renderizarBotoesEquipe();
    renderizarCalendario();
    renderizarLegendaFeriados();
    atualizarPeriodoInfo();
    atualizarContadores();
}

// =====================================================
// CONTADORES
// =====================================================

function atualizarContadores() {
    // 🔥 Usa getPessoas() para pegar sempre a versão atualizada
    const todasPessoas = getPessoas();
    const pessoasEscala = todasPessoas.filter(p => Number(p.escalaId) === Number(equipeSelecionada?.id));
    
    const turnos = { M: 0, T: 0, N: 0 };
    pessoasEscala.forEach(p => {
        if (turnos[p.turno] !== undefined) turnos[p.turno]++;
    });

    if (DOM.numPessoasEscala) DOM.numPessoasEscala.textContent = pessoasEscala.length;
    if (DOM.numManha) DOM.numManha.textContent = turnos.M;
    if (DOM.numTarde) DOM.numTarde.textContent = turnos.T;
    if (DOM.numNoite) DOM.numNoite.textContent = turnos.N;

    const escalaId = equipeSelecionada?.id || 1;
    document.querySelectorAll('.contador-item').forEach(contador => {
        contador.classList.remove('escala-1', 'escala-2', 'escala-3', 'escala-4', 'escala-5');
        contador.classList.add(`escala-${escalaId}`);
    });
}

// =====================================================
// LEGENDA FERIADOS
// =====================================================

function renderizarLegendaFeriados() {
    const container = DOM.legendaFeriados;
    if (!container) return;
    const periodo = getPeriodoPorIndex(periodoIndex);
    const feriadosPeriodo = getFeriadosDoPeriodo(periodo);
    
    if (feriadosPeriodo.length === 0) { 
        container.innerHTML = ''; 
        return; 
    }

    container.innerHTML = feriadosPeriodo.map(item =>
        `<span class="feriado-item">
            <span class="bullet ${item.trabalhado ? 'trabalhado' : item.tipo}"></span>
            ${item.icone} ${item.nome}${item.trabalhado ? ' ⚠️' : ''}
        </span>`
    ).join('');
}

function getFeriadosDoPeriodo(periodo) {
    const resultados = [];
    const dataAtual = new Date(periodo.inicio);
    while (dataAtual <= periodo.fim) {
        const dia = dataAtual.getDate();
        const mes = dataAtual.getMonth() + 1;
        const ano = dataAtual.getFullYear();
        const dataComemorativa = getDataComemorativa(dia, mes, ano);
        if (dataComemorativa) {
            const status = obterStatusDia(equipeSelecionada, dataAtual);
            resultados.push({
                data: new Date(dataAtual),
                ...dataComemorativa,
                // 🔥 FIX: status 2 também é trabalho
                trabalhado: status === 1 || status === 2
            });
        }
        dataAtual.setDate(dataAtual.getDate() + 1);
    }
    return resultados;
}

function atualizarPeriodoInfo() {
    const periodo = getPeriodoPorIndex(periodoIndex);
    if (DOM.periodoNome) DOM.periodoNome.textContent = getNomePeriodo(periodo);
}

function mudarPeriodo(delta) {
    periodoIndex += delta;
    salvarPeriodoStorage(periodoIndex);
    renderizarCalendario();
    renderizarLegendaFeriados();
    atualizarPeriodoInfo();
    renderizarListaExtras();   // 🔥 atualiza lista de extras do novo período
}

// =====================================================
// HORAS EXTRAS (🔥 filtradas pelo período)
// =====================================================

function renderizarListaExtras() {
    const container = DOM.listaExtrasContainer;
    const totalModal = DOM.totalExtraModal;
    if (!container) return;

    const extrasDoPeriodo = getExtrasDoPeriodoAtual();   // 🔥 FILTRO

    if (extrasDoPeriodo.length === 0) {
        container.innerHTML = '<p style="color:var(--color-text-muted);font-size:0.8rem;text-align:center;padding:16px;">Nenhuma hora extra neste período</p>';
        if (totalModal) totalModal.textContent = 'Total: 0h';
        return;
    }

    const sorted = [...extrasDoPeriodo].sort((a, b) => b.data.localeCompare(a.data));
    container.innerHTML = sorted.map(item => {
        const dataFormatada = item.data.split('-').reverse().join('/');
        const index = horasExtras.indexOf(item);
        const minutos = horasParaMinutos(item.horas);
        return `
            <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 12px; margin-bottom:6px; background:var(--color-bg); border-radius:6px; border:1px solid var(--color-border);">
                <div style="font-size:0.8rem; color:var(--color-text);">
                    <strong>📅 ${dataFormatada}</strong>
                    <span style="color:var(--color-text-muted);font-size:0.75rem;">(${item.inicio || '08:00'} às ${item.fim || '18:00'})</span>
                    <span style="margin-left:6px;font-weight:600;color:var(--color-primary);">${formatarMinutos(minutos)}</span>
                </div>
                <button class="btn btn-ghost btn-sm" onclick="window.removerExtra(${index})" style="color:var(--color-danger);padding:4px 8px;">✕</button>
            </div>
        `;
    }).join('');

    const totalMin = horasParaMinutos(extrasDoPeriodo.reduce((acc, i) => acc + i.horas, 0));
    if (totalModal) totalModal.textContent = `Total: ${formatarMinutos(totalMin)}`;
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
    if (index >= 0 && index < horasExtras.length && confirm('Remover esta hora extra?')) {
        horasExtras.splice(index, 1);
        salvarExtrasStorage(horasExtras);
        renderizarListaExtras();
        renderizarCalendario();
        renderizarLegendaFeriados();
        mostrarToast('🗑️ Hora extra removida', 'info');
    }
}

// =====================================================
// PESSOAS
// =====================================================

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

    const duplicado = pessoas.find(p => 
        p.nome.toLowerCase() === nome.toLowerCase() && 
        Number(p.escalaId) === escalaId &&
        p.id !== parseInt(editando || '0')
    );
    if (duplicado) {
        mostrarToast('⚠️ Funcionário já cadastrado nesta escala!', 'erro');
        return;
    }

    if (editando) {
        const index = pessoas.findIndex(p => p.id === parseInt(editando));
        if (index !== -1) {
            pessoas[index] = { ...pessoas[index], nome, cargo, empresa, contato, escalaId, turno, tipo };
        }
        mostrarToast('✅ Funcionário atualizado com sucesso!', 'sucesso');
    } else {
        pessoas.push({ id: Date.now(), nome, cargo, empresa, contato, escalaId, turno, tipo });
        mostrarToast('✅ Funcionário cadastrado com sucesso!', 'sucesso');
    }

    salvarPessoasStorage(pessoas);
    if (typeof recarregarPessoas === 'function') recarregarPessoas();
    atualizarContadores();
    fecharModalPessoa();
}

function removerPessoa(id) {
    const idNumero = Number(id);
    const pessoa = pessoas.find(p => Number(p.id) === idNumero);
    
    if (!pessoa) {
        mostrarToast('❌ Funcionário não encontrado!', 'erro');
        return;
    }

    if (confirm(`Tem certeza que deseja remover "${pessoa.nome}" da escala ${pessoa.escalaId}?`)) {
        pessoas = pessoas.filter(p => Number(p.id) !== idNumero);
        salvarPessoasStorage(pessoas);
        if (typeof recarregarPessoas === 'function') recarregarPessoas();
        atualizarContadores();
        fecharPopup();
        renderizarCalendario();
        mostrarToast(`🗑️ "${pessoa.nome}" removido com sucesso!`, 'sucesso');
    }
}

function editarFuncionario(id) {
    fecharPopup();
    const pessoa = pessoas.find(p => p.id === parseInt(id) || p.id === String(id));
    if (!pessoa) {
        mostrarToast('❌ Funcionário não encontrado!', 'erro');
        return;
    }
    abrirModalPessoa(id);
}

// =====================================================
// ESTATÍSTICAS
// =====================================================

function abrirEstatisticas() {
    const overlay = document.getElementById('popupEstatisticas');
    const conteudo = document.getElementById('popupEstatisticasConteudo');
    
    if (!overlay || !conteudo) return;

    conteudo.innerHTML = `
        <div style="text-align:center; padding:40px; color:var(--color-text-muted);">
            <svg class="icon mi-spin" width="32" height="32" style="color:var(--color-primary);">
                <use href="assets/icons/sprite.svg#icon-sync"></use>
            </svg>
            <p style="margin-top:12px;">Carregando estatísticas...</p>
        </div>
    `;
    overlay.classList.add('ativo');

    import('./core/estatisticas.js')
        .then(module => {
            if (typeof module.renderizarEstatisticas === 'function') {
                module.renderizarEstatisticas(conteudo, periodoIndex);
            } else {
                conteudo.innerHTML = `
                    <div style="text-align:center; padding:40px; color:var(--color-danger);">
                        <p>❌ Erro: Função não encontrada</p>
                    </div>
                `;
            }
        })
        .catch(err => {
            console.error('Erro ao carregar estatísticas:', err);
            conteudo.innerHTML = `
                <div style="text-align:center; padding:40px; color:var(--color-danger);">
                    <p>❌ Erro ao carregar estatísticas</p>
                    <small style="color:var(--color-text-muted);">${err.message}</small>
                </div>
            `;
        });
}

function fecharEstatisticas() {
    const overlay = document.getElementById('popupEstatisticas');
    if (overlay) overlay.classList.remove('ativo');
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

    const diaInicio = parseInt(inputInicio.value);
    const diaFim = parseInt(inputFim.value);

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
    renderizarListaExtras();
    mostrarToast(`✅ Período: Início ${diaInicio}, Fim ${diaFim}`, 'sucesso');
}

// =====================================================
// GUIA RÁPIDO
// =====================================================

function abrirGuia() {
    alert(`📖 GUIA RÁPIDO - Calendário de Escalas

✅ COMO USAR:
1. 📋 Selecione uma escala (1, 2, 3 ou 4)
2. 👤 Cadastre funcionários em "Cadastrar Funcionário"
3. 👥 Clique nos contadores para ver a lista
4. ⏱️ Adicione horas extras com "Extra"
5. 📊 Veja estatísticas com "Stats"
6. 📅 Altere o período no menu lateral

🔴 DIAS COM ALERTA:
Dias em vermelho indicam saída antecipada em 1 hora.

💡 DICAS:
- Use ESC para fechar modais
- Clique em ☰ para abrir o menu
- Período máximo de 31 dias
- Navegue no calendário com TAB e setas

📞 Dúvidas? adri0mt@uni9.edu.br`);
}

// =====================================================
// EXPORTAR/IMPORTAR
// =====================================================

function exportarDados() {
    try {
        const dados = {
            versao: "1.0.0",
            escalasVersao: ESCALAS_VERSAO,
            dataExportacao: new Date().toISOString(),
            temaEscuro,
            escalas: equipes,
            horasExtras,
            pessoas,
            periodoConfig: { 
                diaInicio: getConfigPeriodo().diaInicio, 
                diaFim: getConfigPeriodo().diaFim 
            }
        };

        const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_escalas_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        mostrarToast(`✅ Dados exportados! (${pessoas.length} funcionários)`, 'sucesso');
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
        if (!file) { document.body.removeChild(input); return; }

        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const dados = JSON.parse(e.target.result);
                if (!dados.escalas || !Array.isArray(dados.escalas)) {
                    mostrarToast('❌ Arquivo inválido!', 'erro');
                    document.body.removeChild(input);
                    return;
                }

                const qtdPessoas = dados.pessoas?.length || 0;
                const qtdHorasExtras = dados.horasExtras?.length || 0;
                const qtdEscalas = dados.escalas.length;

                if (!confirm(`⚠️ Isso irá substituir todos os dados!\n\n📋 ${qtdEscalas} escalas\n👥 ${qtdPessoas} funcionários\n⏱️ ${qtdHorasExtras} horas extras\n\nContinuar?`)) {
                    document.body.removeChild(input);
                    return;
                }

                if (dados.escalas?.length) {
                    equipes = dados.escalas;
                    salvarEscalasStorage(equipes);
                }
                if (dados.pessoas?.length) {
                    pessoas = dados.pessoas;
                    salvarPessoasStorage(pessoas);
                    if (typeof recarregarPessoas === 'function') recarregarPessoas();
                }
                if (dados.horasExtras?.length) {
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
                equipeSelecionada = equipes[0] || null;

                renderizarBotoesEquipe();
                renderizarCalendario();
                renderizarLegendaFeriados();
                atualizarPeriodoInfo();
                renderizarListaExtras();
                atualizarContadores();
                carregarConfigPeriodoUI();

                mostrarToast(`✅ Dados importados! 👥 ${pessoas.length} funcionários`, 'sucesso');

            } catch (error) {
                console.error('Erro ao importar:', error);
                mostrarToast('❌ Erro ao importar dados!', 'erro');
            }
            document.body.removeChild(input);
        };
        reader.onerror = () => {
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
        mostrarToast('🗑️ Horas extras removidas', 'info');
        fecharMenu();
    }
}

function resetarTudo() {
    if (confirm('⚠️ Restaurar todas as configurações padrão?') &&
        confirm('Última confirmação: TODOS os dados serão perdidos!')) {
        
        equipes = JSON.parse(JSON.stringify(escalasPadrao));
        salvarEscalasStorage(equipes);
        localStorage.setItem('escalas_versao', String(ESCALAS_VERSAO));
        horasExtras = [];
        salvarExtrasStorage(horasExtras);
        pessoas = [];
        salvarPessoasStorage(pessoas);
        periodoIndex = 0;
        salvarPeriodoStorage(0);
        equipeSelecionada = equipes[0] || null;
        temaEscuro = false;
        aplicarTema();
        
        if (typeof recarregarPessoas === 'function') recarregarPessoas();
        renderizarBotoesEquipe();
        renderizarCalendario();
        renderizarLegendaFeriados();
        atualizarPeriodoInfo();
        renderizarListaExtras();
        atualizarContadores();
        mostrarToast('🔄 Tudo foi resetado!', 'sucesso');
        fecharMenu();
    }
}

function abrirMelhorias() {
    fecharMenu();
    window.open(`mailto:adri0mt@uni9.edu.br?subject=${encodeURIComponent('💡 Sugestão de Melhoria')}`, '_blank');
}

function abrirBug() {
    fecharMenu();
    window.open(`mailto:adri0mt@uni9.edu.br?subject=${encodeURIComponent('🐛 Reporte de Bug')}`, '_blank');
}

// =====================================================
// 🔥 DETALHES DO DIA (CORRIGIDO — mostra alerta)
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
    const dataFormatada = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const nomeDia = diasSemana[data.getDay()];

    // 🔥 Status usando getStatusInfo (trata status 2 corretamente)
    const status = obterStatusDia(equipeSelecionada, data);
    const info = getStatusInfo(status);

    // 🔥 Card de alerta vermelho (só quando status === 2)
    const alertaHtml = info.isAlerta ? `
        <div class="detalhe-item" style="
            border-left-color: #EF4444;
            background: #FEE2E2;
            border-radius: 8px;
            padding: 12px 14px;
        ">
            <span class="detalhe-icone" style="font-size: 1.4rem;">⚠️</span>
            <div>
                <div class="detalhe-label" style="color:#991B1B; font-weight:700; font-size:0.75rem; text-transform:uppercase;">
                    Alerta do Dia
                </div>
                <div class="detalhe-valor" style="color:#7F1D1D; font-weight:700; font-size:1rem;">
                    Antecipar saída em 1 hora (Ambipar)
                </div>
            </div>
        </div>
    ` : '';

    // Feriado (móvel ou fixo)
    const dataComemorativa = getFeriado(dia, mes, ano);

    let feriadoHtml = '';
    if (dataComemorativa) {
        const corFeriado = dataComemorativa.tipo === 'feriado'
            ? '#EF4444'
            : dataComemorativa.tipo === 'facultativo'
                ? '#F59E0B'
                : '#8B5CF6';

        const labelTipo = dataComemorativa.tipo === 'feriado'
            ? 'Feriado'
            : dataComemorativa.tipo === 'facultativo'
                ? 'Ponto Facultativo'
                : 'Comemorativo';

        feriadoHtml = `
            <div class="detalhe-item" style="border-left-color: ${corFeriado};">
                <span class="detalhe-icone">${dataComemorativa.icone}</span>
                <div>
                    <div class="detalhe-label" style="color:${corFeriado};font-weight:700;">${labelTipo}</div>
                    <div class="detalhe-valor">${dataComemorativa.nome}</div>
                </div>
            </div>
        `;
    }

    // Extras do período
    const periodoAtual = getPeriodoPorIndex(periodoIndex);
    const extras = getExtrasPorData(dataStr).filter(extra => {
        const d = new Date(extra.data + 'T00:00:00');
        return d >= periodoAtual.inicio && d <= periodoAtual.fim;
    });

    let extrasHtml = '';
    if (extras.length) {
        const totalMinutos = extras.reduce((acc, item) => acc + Math.round(item.horas * 60), 0);
        const h = Math.floor(totalMinutos / 60);
        const m = totalMinutos % 60;

        extrasHtml = `
            <div class="detalhe-item" style="border-left-color: #F59E0B;">
                <span class="detalhe-icone">⏱️</span>
                <div>
                    <div class="detalhe-label">Horas Extras</div>
                    <div class="detalhe-valor" style="color:#F59E0B;font-weight:700;">
                        ${h > 0 ? h + 'h' : ''}${m > 0 ? m + 'min' : ''}
                    </div>
                </div>
            </div>
            ${extras.map(extra => {
                const min2 = Math.round(extra.horas * 60);
                const h2 = Math.floor(min2 / 60);
                const m2 = min2 % 60;
                return `<div class="detalhe-item" style="border-left-color:#F59E0B;padding-left:40px;font-size:0.85rem;">
                    <span style="color:var(--color-text-muted);">
                        ${extra.inicio || '08:00'} - ${extra.fim || '18:00'}
                        (${h2 > 0 ? h2 + 'h' : ''}${m2 > 0 ? m2 + 'min' : ''})
                    </span>
                </div>`;
            }).join('')}
        `;
    }

    const equipeNome = equipeSelecionada?.nome || `Escala ${equipeSelecionada?.id}`;

    titulo.innerHTML = `
        <svg class="icon" width="20" height="20" style="color:var(--color-primary,#3B82F6);">
            <use href="assets/icons/sprite.svg#icon-calendar"></use>
        </svg>
        ${dataFormatada} - ${nomeDia}
    `;

    conteudo.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px;">
            <div class="detalhe-item" style="border-left-color:${info.cor};">
                <span class="detalhe-icone">
                    <svg class="icon" width="24" height="24" style="color:${info.cor};">
                        <use href="assets/icons/sprite.svg#${info.icone}"></use>
                    </svg>
                </span>
                <div>
                    <div class="detalhe-label">Status</div>
                    <div class="detalhe-valor" style="color:${info.cor};font-weight:700;">${info.texto}</div>
                </div>
            </div>
            <div class="detalhe-item" style="border-left-color:#3B82F6;">
                <span class="detalhe-icone">📋</span>
                <div>
                    <div class="detalhe-label">Escala</div>
                    <div class="detalhe-valor">${equipeNome}</div>
                </div>
            </div>
            ${alertaHtml}
            ${feriadoHtml}
            ${extrasHtml}
            ${!alertaHtml && !feriadoHtml && !extrasHtml ? `
                <div style="text-align:center;padding:20px 0;color:var(--color-text-muted);">
                    <svg class="icon" width="32" height="32" style="opacity:0.3;">
                        <use href="assets/icons/sprite.svg#icon-info"></use>
                    </svg>
                    <p style="margin-top:8px;">Nenhuma informação adicional.</p>
                </div>
            ` : ''}
        </div>
    `;

    overlay.classList.add('ativo');
}

function fecharDetalhesDia() {
    const overlay = document.getElementById('popupDetalhesDia');
    if (overlay) overlay.classList.remove('ativo');
}

// =====================================================
// EXPORTA FUNÇÕES PARA O GLOBAL
// =====================================================

Object.assign(window, {
    toggleMenu, fecharMenu, toggleTema,
    abrirModalPessoa, fecharModalPessoa, abrirModalExtra, fecharModalExtra,
    abrirPopup, fecharPopup, abrirPopupADM,
    abrirEstatisticas, fecharEstatisticas,
    mudarPeriodo, selecionarEquipe,
    salvarExtra, removerExtra, renderizarListaExtras,
    salvarPessoa, removerPessoa, editarFuncionario,
    aplicarPeriodo, carregarConfigPeriodoUI,
    exportarDados, importarDados, limparDados, resetarTudo,
    abrirMelhorias, abrirBug, abrirGuia,
    recarregarPessoas,
    abrirDetalhesDia, fecharDetalhesDia,
    renderizarCalendario
});

// 🔥 Debug global
window.__debug = {
    get equipeSelecionada() { return equipeSelecionada; },
    get pessoas() { return pessoas; },
    get horasExtras() { return horasExtras; },
    get periodoIndex() { return periodoIndex; },
    getCicloCompleto: (equipe) => getCicloCompleto(equipe || equipeSelecionada),
    obterStatusDia: (data) => obterStatusDia(equipeSelecionada, data),
    getStatusInfo,
    getFeriados,
    renderizarCalendario,
    getExtrasDoPeriodoAtual
};

console.log('✅ Funções exportadas para o window!');
console.log('🐛 Debug: window.__debug');

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
        fecharDetalhesDia();
    }
});

// =====================================================
// INICIALIZAÇÃO
// =====================================================

function init() {
    console.log('🚀 Inicializando Explorer...');
    console.log('📋 Escalas versão:', ESCALAS_VERSAO);
    console.log('📋 Equipe selecionada:', equipeSelecionada?.id);

    initTema();
    initModais();
    initPopups(equipeSelecionada);

    import('./core/estatisticas.js').then(module => {
        if (module.initEstatisticas) module.initEstatisticas(equipeSelecionada);
    });

    renderizarBotoesEquipe();
    renderizarCalendario();
    atualizarContadores();
    atualizarPeriodoInfo();

    // 🔥 Usa setTimeout (mais compatível que requestIdleCallback)
    const lazyInit = () => {
        carregarConfigPeriodoUI();
        renderizarLegendaFeriados();
        renderizarListaExtras();
    };

    if ('requestIdleCallback' in window) {
        requestIdleCallback(lazyInit, { timeout: 2000 });
    } else {
        setTimeout(lazyInit, 100);
    }

    document.getElementById('modalExtra')?.addEventListener('click', function(e) {
        if (e.target === this) fecharModalExtra();
    });
    document.getElementById('modalPessoa')?.addEventListener('click', function(e) {
        if (e.target === this) fecharModalPessoa();
    });

    // 🔥 Service Worker compatível com Safari
    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
        const registrarSW = () => {
            navigator.serviceWorker.register('sw.js')
                .then(() => console.log('✅ Service Worker registrado!'))
                .catch(error => console.log('⚠️ Falha no Service Worker:', error));
        };

        if ('requestIdleCallback' in window) {
            requestIdleCallback(registrarSW, { timeout: 3000 });
        } else {
            setTimeout(registrarSW, 1000);
        }
    }

    console.log('✅ Calendário inicializado!');
}

init();