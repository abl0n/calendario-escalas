// =====================================================
// APP - Inicialização principal (OTIMIZADO)
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
    DIAS_SEMANA
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

import { getPessoas, recarregarPessoas } from './core/pessoas.js';

// 🔥 CORES CENTRALIZADAS
import { CORES_ESCALAS, CORES_TURNOS } from './constants/cores.js';

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
// FUNÇÕES AUXILIARES
// =====================================================

function obterStatusDia(equipe, data) {
    if (!equipe) return 0;
    const ciclo = getCicloCompleto(equipe);
    if (!ciclo || ciclo.length === 0) return 0;
    const diffDias = Math.floor((data - DATA_REFERENCIA) / (1000 * 60 * 60 * 24));
    const posicao = ((diffDias % ciclo.length) + ciclo.length) % ciclo.length;
    return ciclo[posicao] || 0;
}

function getDataComemorativa(dia, mes) {
    const chave = `${String(dia).padStart(2, '0')}-${String(mes).padStart(2, '0')}`;
    return feriados[chave] || null;
}

function getExtrasPorData(dataStr) {
    return horasExtras.filter(item => item.data === dataStr);
}

function getTotalExtras() {
    return horasExtras.reduce((acc, item) => acc + (item.horas || 0), 0);
}

// =====================================================
// RENDERIZAÇÃO DO CALENDÁRIO
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

    let html = `<table><thead><tr>`;
    DIAS_SEMANA.forEach(dia => {
        html += `<th style="background:${corHeaderFundo};color:${corHeaderTexto};border-bottom:3px solid ${corHeaderBorda};">${dia}</th>`;
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

// =====================================================
// BOTÕES EQUIPE - OTIMIZADO COM CORES CENTRALIZADAS
// =====================================================

function renderizarBotoesEquipe() {
    const container = DOM.botoesEquipe;
    if (!container) return;
    container.innerHTML = '';
    
    const iconesEscalas = ['icon-calendar', 'icon-calendar-month', 'icon-calendar', 'icon-calendar'];

    equipes.forEach(equipe => {
        const isSelected = equipeSelecionada && equipe.id === equipeSelecionada.id;
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
            font-family: var(--font-family, system-ui, sans-serif);
            box-shadow: ${isSelected ? `0 4px 15px ${cores.bg}40` : 'none'};
            transform: ${isSelected ? 'scale(1.05)' : 'scale(1)'};
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            will-change: transform, box-shadow, background;
        `;

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

        btn.addEventListener('click', () => selecionarEquipe(equipe));
        container.appendChild(btn);
    });
}

function selecionarEquipe(equipe) {
    equipeSelecionada = equipe;
     // 🔥 ATUALIZAR ESTATÍSTICAS
    import('./core/estatisticas.js').then(module => {
        if (module.initEstatisticas) {
            module.initEstatisticas(equipe);
            console.log('📊 Estatísticas atualizadas para:', equipe);
        }
    });

    if (typeof atualizarEquipePopup === 'function') atualizarEquipePopup(equipe);
    renderizarBotoesEquipe();
    renderizarCalendario();
    renderizarLegendaFeriados();
    atualizarPeriodoInfo();
    atualizarContadores();
}

// =====================================================
// CONTADORES - COM BORDAS DA ESCALA SELECIONADA
// =====================================================

function atualizarContadores() {
    const pessoasEscala = pessoas.filter(p => p.escalaId === equipeSelecionada?.id);
    const turnos = { M: 0, T: 0, N: 0 };
    pessoasEscala.forEach(p => turnos[p.turno] = (turnos[p.turno] || 0) + 1);

    // 🔥 Atualizar números
    if (DOM.numPessoasEscala) DOM.numPessoasEscala.textContent = pessoasEscala.length;
    if (DOM.numManha) DOM.numManha.textContent = turnos.M;
    if (DOM.numTarde) DOM.numTarde.textContent = turnos.T;
    if (DOM.numNoite) DOM.numNoite.textContent = turnos.N;

    // 🔥 ATUALIZAR BORDAS DOS CONTADORES - APENAS CLASSES
    const escalaId = equipeSelecionada?.id || 1;
    const cores = CORES_ESCALAS[escalaId];
    
    if (cores) {
        const contadores = document.querySelectorAll('.contador-item');
        contadores.forEach(contador => {
            contador.classList.remove('escala-1', 'escala-2', 'escala-3', 'escala-4', 'escala-5');
            contador.classList.add(`escala-${escalaId}`);
            // ❌ NÃO usar style.border - mantém as cores de fundo e ícones
        });
    }
}

// =====================================================
// LEGENDA FERIADOS
// =====================================================

function renderizarLegendaFeriados() {
    const container = DOM.legendaFeriados;
    if (!container) return;
    const periodo = getPeriodoPorIndex(periodoIndex);
    const feriadosPeriodo = getFeriadosDoPeriodo(periodo);
    if (feriadosPeriodo.length === 0) { container.innerHTML = ''; return; }

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
        const dataComemorativa = getDataComemorativa(dia, mes);
        if (dataComemorativa) {
            resultados.push({
                data: new Date(dataAtual),
                ...dataComemorativa,
                trabalhado: obterStatusDia(equipeSelecionada, dataAtual) === 1
            });
        }
        dataAtual.setDate(dataAtual.getDate() + 1);
    }
    return resultados;
}

function atualizarPeriodoInfo() {
    const periodo = getPeriodoPorIndex(periodoIndex);
    const periodoNome = document.getElementById('periodoNome');
    if (periodoNome) periodoNome.textContent = getNomePeriodo(periodo);
}

function mudarPeriodo(delta) {
    periodoIndex += delta;
    salvarPeriodoStorage(periodoIndex);
    renderizarCalendario();
    renderizarLegendaFeriados();
    atualizarPeriodoInfo();
}

// =====================================================
// HORAS EXTRAS
// =====================================================

function renderizarListaExtras() {
    const container = DOM.listaExtrasContainer;
    const totalModal = DOM.totalExtraModal;
    if (!container) return;

    if (horasExtras.length === 0) {
        container.innerHTML = '<p style="color:var(--color-text-muted);font-size:0.8rem;text-align:center;padding:16px;">Nenhuma hora extra registrada</p>';
        if (totalModal) totalModal.textContent = 'Total: 0h';
        return;
    }

    const sorted = [...horasExtras].sort((a, b) => b.data.localeCompare(a.data));
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

    const totalMin = horasParaMinutos(getTotalExtras());
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

    const duplicado = pessoas.find(p => p.nome.toLowerCase() === nome.toLowerCase() && p.escalaId === escalaId);
    if (duplicado && !editando) {
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
        console.log('📝 Novo funcionário cadastrado:', { nome, tipo });
        mostrarToast('✅ Funcionário cadastrado com sucesso!', 'sucesso');
    }

    salvarPessoasStorage(pessoas);
    atualizarContadores();
    fecharModalPessoa();
    if (typeof recarregarPessoas === 'function') recarregarPessoas();
}

function removerPessoa(id) {
    console.log('🗑️ Tentando remover funcionário ID:', id);
    console.log('📋 Pessoas atuais:', pessoas);
    
    const idNumero = Number(id);
    const pessoa = pessoas.find(p => Number(p.id) === idNumero);
    
    if (!pessoa) {
        console.error('❌ Funcionário não encontrado! ID:', id);
        mostrarToast('❌ Funcionário não encontrado!', 'erro');
        return;
    }

    console.log('✅ Funcionário encontrado:', pessoa);

    if (confirm(`Tem certeza que deseja remover "${pessoa.nome}" da escala ${pessoa.escalaId}?`)) {
        const novasPessoas = pessoas.filter(p => Number(p.id) !== idNumero);
        console.log(`📊 Antes: ${pessoas.length} funcionários`);
        console.log(`📊 Depois: ${novasPessoas.length} funcionários`);
        pessoas = novasPessoas;
        salvarPessoasStorage(pessoas);
        if (typeof recarregarPessoas === 'function') recarregarPessoas();
        atualizarContadores();
        fecharPopup();
        renderizarCalendario();
        mostrarToast(`🗑️ "${pessoa.nome}" removido com sucesso!`, 'sucesso');
        console.log('✅ Funcionário removido com sucesso!');
    }
}

function editarFuncionario(id) {
    console.log('✏️ Editando funcionário ID:', id);
    fecharPopup();
    const pessoa = pessoas.find(p => p.id === parseInt(id) || p.id === String(id));
    if (!pessoa) {
        console.error('❌ Funcionário não encontrado! ID:', id);
        mostrarToast('❌ Funcionário não encontrado!', 'erro');
        return;
    }
    console.log('📝 Funcionário encontrado:', pessoa);
    abrirModalPessoa(id);
}

// =====================================================
// ESTATÍSTICAS - FUNÇÃO PARA ABRIR
// =====================================================

function abrirEstatisticas() {
    const overlay = document.getElementById('popupEstatisticas');
    const conteudo = document.getElementById('popupEstatisticasConteudo');
    
    console.log('🔍 abrirEstatisticas chamada!');
    
    if (!overlay || !conteudo) {
        console.error('❌ Elementos não encontrados!');
        return;
    }

    // 🔥 LOADING
    conteudo.innerHTML = `
        <div style="text-align:center; padding:40px; color:var(--color-text-muted);">
            <svg class="icon mi-spin" width="32" height="32" style="color:var(--color-primary);">
                <use href="assets/icons/sprite.svg#icon-sync"></use>
            </svg>
            <p style="margin-top:12px;">Carregando estatísticas...</p>
        </div>
    `;
    overlay.classList.add('ativo');

    // 🔥 IMPORT DINÂMICO
    import('./core/estatisticas.js')
        .then(module => {
            console.log('✅ Módulo carregado!');
            console.log('📦 Funções disponíveis:', Object.keys(module));
            
            if (typeof module.renderizarEstatisticas === 'function') {
                module.renderizarEstatisticas(conteudo, periodoIndex);
                console.log('✅ Estatísticas renderizadas!');
            } else {
                console.error('❌ renderizarEstatisticas não é uma função');
                conteudo.innerHTML = `
                    <div style="text-align:center; padding:40px; color:var(--color-danger);">
                        <p>❌ Erro: Função não encontrada</p>
                        <small style="color:var(--color-text-muted);">O módulo não exporta renderizarEstatisticas</small>
                    </div>
                `;
            }
        })
        .catch(err => {
            console.error('❌ Erro ao carregar módulo:', err);
            conteudo.innerHTML = `
                <div style="text-align:center; padding:40px; color:var(--color-danger);">
                    <p>❌ Erro ao carregar estatísticas</p>
                    <small style="color:var(--color-text-muted);">${err.message}</small>
                    <br>
                    <small style="color:var(--color-text-muted); font-size:0.7rem;">Verifique se o arquivo core/estatisticas.js existe</small>
                </div>
            `;
        });
}

function fecharEstatisticas() {
    const overlay = document.getElementById('popupEstatisticas');
    if (overlay) {
        overlay.classList.remove('ativo');
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
    alert(`📖 GUIA RÁPIDO - Calendário de Escalas

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

📞 Dúvidas? Envie um e-mail para adri0mt@uni9.edu.br`);
}

// =====================================================
// EXPORTAR/IMPORTAR DADOS
// =====================================================

function exportarDados() {
    try {
        const dados = {
            versao: "1.0.0",
            dataExportacao: new Date().toISOString(),
            temaEscuro,
            escalas: equipes,
            horasExtras,
            pessoas,
            periodoConfig: { diaInicio: getConfigPeriodo().diaInicio, diaFim: getConfigPeriodo().diaFim }
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

                if (!confirm(`⚠️ Isso irá substituir todos os dados atuais!\n\n📋 ${qtdEscalas} escalas\n👥 ${qtdPessoas} funcionários\n⏱️ ${qtdHorasExtras} horas extras\n\nDeseja continuar?`)) {
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
                if (typeof carregarConfigPeriodoUI === 'function') carregarConfigPeriodoUI();

                mostrarToast(`✅ Dados importados com sucesso!\n👥 ${pessoas.length} funcionários`, 'sucesso');

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
        mostrarToast('🗑️ Todas as horas extras foram removidas', 'info');
        fecharMenu();
    }
}

function resetarTudo() {
    if (confirm('⚠️ Isso irá restaurar todas as configurações para o padrão.') &&
        confirm('Última confirmação: TODOS os dados serão perdidos!')) {
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

function abrirMelhorias() {
    fecharMenu();
    window.open(`mailto:adri0mt@uni9.edu.br?subject=${encodeURIComponent('💡 Sugestão de Melhoria - Calendário de Escalas')}`, '_blank');
}

function abrirBug() {
    fecharMenu();
    window.open(`mailto:adri0mt@uni9.edu.br?subject=${encodeURIComponent('🐛 Reporte de Bug - Calendário de Escalas')}`, '_blank');
}

// =====================================================
// DETALHES DO DIA
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

    const status = obterStatusDia(equipeSelecionada, data);
    const statusTexto = status === 1 ? 'Trabalho' : 'Folga';
    const statusIcone = status === 1 ? 'icon-work' : 'icon-beach';
    const statusCor = status === 1 ? '#3B82F6' : '#10B981';

    const dataComemorativa = getDataComemorativa(dia, mes);
    let feriadoHtml = dataComemorativa ? `
        <div class="detalhe-item" style="border-left-color: ${dataComemorativa.tipo === 'feriado' ? '#EF4444' : '#8B5CF6'};">
            <span class="detalhe-icone">${dataComemorativa.icone}</span>
            <div>
                <div class="detalhe-label">${dataComemorativa.tipo === 'feriado' ? 'Feriado' : 'Comemorativo'}</div>
                <div class="detalhe-valor">${dataComemorativa.nome}</div>
            </div>
        </div>
    ` : '';

    const extras = getExtrasPorData(dataStr);
    let extrasHtml = '';
    if (extras.length) {
        const totalHoras = extras.reduce((acc, item) => acc + item.horas, 0);
        const extraMin = Math.round(totalHoras * 60);
        const h = Math.floor(extraMin / 60);
        const m = extraMin % 60;
        extrasHtml = `
            <div class="detalhe-item" style="border-left-color: #F59E0B;">
                <span class="detalhe-icone">⏱️</span>
                <div>
                    <div class="detalhe-label">Horas Extras</div>
                    <div class="detalhe-valor" style="color:#F59E0B;font-weight:700;">${h > 0 ? h + 'h' : ''}${m > 0 ? m + 'min' : ''}</div>
                </div>
            </div>
            ${extras.map(extra => {
                const extraMin2 = Math.round(extra.horas * 60);
                const h2 = Math.floor(extraMin2 / 60);
                const m2 = extraMin2 % 60;
                return `<div class="detalhe-item" style="border-left-color:#F59E0B;padding-left:40px;font-size:0.85rem;">
                    <span style="color:var(--color-text-muted);">${extra.inicio || '08:00'} - ${extra.fim || '18:00'} (${h2 > 0 ? h2 + 'h' : ''}${m2 > 0 ? m2 + 'min' : ''})</span>
                </div>`;
            }).join('')}
        `;
    }

    const pessoasDoDia = pessoas.filter(p => equipeSelecionada?.escalas?.some(e => e.data === dataStr && e.pessoaId === p.id));
    const pessoasHtml = pessoasDoDia.length ? `
        <div class="detalhe-item" style="border-left-color:#8B5CF6;">
            <span class="detalhe-icone">👥</span>
            <div>
                <div class="detalhe-label">Pessoas Escaladas</div>
                ${pessoasDoDia.map(p => `
                    <div style="display:flex;align-items:center;gap:8px;padding:2px 0;">
                        <span>• ${p.nome}</span>
                        <span style="font-size:0.65rem;background:var(--color-bg);padding:0 8px;border-radius:4px;color:var(--color-text-muted);">
                            ${p.turno === 'M' ? '☀️ Manhã' : p.turno === 'T' ? '🌆 Tarde' : '🌙 Noite'}
                        </span>
                    </div>
                `).join('')}
            </div>
        </div>
    ` : '';

    const equipeNome = equipeSelecionada?.nome || `Escala ${equipeSelecionada?.id}`;

    titulo.innerHTML = `
        <svg class="icon" width="20" height="20" style="color:var(--color-primary,#3B82F6);">
            <use href="assets/icons/sprite.svg#icon-calendar"></use>
        </svg>
        ${dataFormatada} - ${nomeDia}
    `;

    conteudo.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:12px;">
            <div class="detalhe-item" style="border-left-color:${statusCor};">
                <span class="detalhe-icone">
                    <svg class="icon" width="24" height="24" style="color:${statusCor};">
                        <use href="assets/icons/sprite.svg#${statusIcone}"></use>
                    </svg>
                </span>
                <div>
                    <div class="detalhe-label">Status</div>
                    <div class="detalhe-valor" style="color:${statusCor};font-weight:700;">${statusTexto}</div>
                </div>
            </div>
            <div class="detalhe-item" style="border-left-color:#3B82F6;">
                <span class="detalhe-icone">📋</span>
                <div>
                    <div class="detalhe-label">Escala</div>
                    <div class="detalhe-valor">${equipeNome}</div>
                </div>
            </div>
            ${feriadoHtml}
            ${extrasHtml}
            ${pessoasHtml}
            ${!feriadoHtml && !extrasHtml && !pessoasDoDia.length ? `
                <div style="text-align:center;padding:20px 0;color:var(--color-text-muted);">
                    <svg class="icon" width="32" height="32" style="opacity:0.3;">
                        <use href="assets/icons/sprite.svg#icon-info"></use>
                    </svg>
                    <p style="margin-top:8px;">Nenhuma informação adicional para este dia.</p>
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
// EXPORTA FUNÇÕES PARA O GLOBAL (window)
// =====================================================

window.toggleMenu = toggleMenu;
window.fecharMenu = fecharMenu;
window.toggleTema = toggleTema;
window.abrirModalPessoa = abrirModalPessoa;
window.fecharModalPessoa = fecharModalPessoa;
window.abrirModalExtra = abrirModalExtra;
window.fecharModalExtra = fecharModalExtra;
window.abrirPopup = abrirPopup;
window.fecharPopup = fecharPopup;
window.abrirPopupADM = abrirPopupADM;
window.abrirEstatisticas = abrirEstatisticas;
window.fecharEstatisticas = fecharEstatisticas;
window.mudarPeriodo = mudarPeriodo;
window.selecionarEquipe = selecionarEquipe;
window.salvarExtra = salvarExtra;
window.removerExtra = removerExtra;
window.renderizarListaExtras = renderizarListaExtras;
window.salvarPessoa = salvarPessoa;
window.removerPessoa = removerPessoa;
window.editarFuncionario = editarFuncionario;
window.aplicarPeriodo = aplicarPeriodo;
window.carregarConfigPeriodoUI = carregarConfigPeriodoUI;
window.exportarDados = exportarDados;
window.importarDados = importarDados;
window.limparDados = limparDados;
window.resetarTudo = resetarTudo;
window.abrirMelhorias = abrirMelhorias;
window.abrirBug = abrirBug;
window.abrirGuia = abrirGuia;
window.recarregarPessoas = recarregarPessoas;
window.abrirDetalhesDia = abrirDetalhesDia;
window.fecharDetalhesDia = fecharDetalhesDia;

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
        fecharDetalhesDia();
    }
});

// =====================================================
// INICIALIZAÇÃO
// =====================================================

function init() {
    console.log('🚀 Inicializando Explorer...');
    console.log('👥 Pessoas carregadas:', pessoas);
    console.log('📋 Equipe selecionada:', equipeSelecionada);

    initTema();
    initModais();
    initPopups(equipeSelecionada);


     // 🔥 ADICIONAR ESTA LINHA - INICIALIZAR ESTATÍSTICAS
    import('./core/estatisticas.js').then(module => {
        if (module.initEstatisticas) {
            module.initEstatisticas(equipeSelecionada);
            console.log('📊 Estatísticas inicializadas com:', equipeSelecionada);
        }
    });

    renderizarBotoesEquipe();
    renderizarCalendario();
    atualizarContadores();
    atualizarPeriodoInfo();

    if ('requestIdleCallback' in window) {
        requestIdleCallback(() => {
            console.log('🔄 Carregando elementos não críticos...');
            carregarConfigPeriodoUI();
            renderizarLegendaFeriados();
            renderizarListaExtras();
        }, { timeout: 2000 });
    } else {
        setTimeout(() => {
            carregarConfigPeriodoUI();
            renderizarLegendaFeriados();
            renderizarListaExtras();
        }, 100);
    }

    document.getElementById('modalExtra')?.addEventListener('click', function(e) {
        if (e.target === this) fecharModalExtra();
    });
    document.getElementById('modalPessoa')?.addEventListener('click', function(e) {
        if (e.target === this) fecharModalPessoa();
    });

    if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
        requestIdleCallback(() => {
            navigator.serviceWorker.register('sw.js')
                .then(() => console.log('✅ Service Worker registrado com sucesso!'))
                .catch(error => console.log('⚠️ Falha ao registrar Service Worker:', error));
        });
    }

    console.log('✅ Calendário inicializado!');
    console.log('📅 Período atual:', getNomePeriodo(getPeriodoPorIndex(periodoIndex)));
    console.log('👥 Funcionários:', pessoas.length);
}

// =====================================================
// INICIALIZAÇÃO
// =====================================================

init();