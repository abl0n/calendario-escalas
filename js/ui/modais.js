// =====================================================
// MODAIS - Gerenciamento de Janelas Modais
// =====================================================

import { getPessoas } from '../core/pessoas.js';
import { 
    criarFerias, 
    atualizarFerias, 
    excluirFerias,
    getFeriasPorId,
    getFeriasPorEscala,
    calcularDataFim,
    FERIAS_DURACAO_MAX
} from '../core/ferias.js';
import { mostrarToast } from '../utils/helpers.js';

let modalPessoaCallback = null;

// =====================================================
// ESTADO INTERNO DAS FÉRIAS
// =====================================================
let feriasEditandoId = null;
let feriasExcluirId = null;
let escalaAtualFerias = null;

export function initModais(callback) {
    modalPessoaCallback = callback;
}

// =====================================================
// MODAL PESSOA
// =====================================================

export function abrirModalPessoa(pessoaId = null) {
    const modal = document.getElementById('modalPessoa');
    if (!modal) {
        console.error('❌ Modal pessoa não encontrado!');
        return;
    }
    modal.classList.add('ativo');

    const inputNome = document.getElementById('inputNomePessoa');
    const inputCargo = document.getElementById('inputCargoPessoa');
    const inputEmpresa = document.getElementById('inputEmpresaPessoa');
    const inputContato = document.getElementById('inputContatoPessoa');
    const inputEscala = document.getElementById('inputEscalaPessoa');
    const inputTurno = document.getElementById('inputTurnoPessoa');
    const inputTipo = document.getElementById('inputTipoPessoa');
    const titulo = document.getElementById('modalPessoaTitulo');
    const subtitulo = document.getElementById('modalPessoaSubtitulo');

    if (pessoaId) {
        const pessoas = getPessoas();
        const pessoa = pessoas.find(p => p.id === parseInt(pessoaId) || p.id === String(pessoaId));
        
        if (pessoa) {
            console.log('📝 Editando pessoa:', pessoa);
            if (inputNome) inputNome.value = pessoa.nome || '';
            if (inputCargo) inputCargo.value = pessoa.cargo || '';
            if (inputEmpresa) inputEmpresa.value = pessoa.empresa || '';
            if (inputContato) inputContato.value = pessoa.contato || '';
            if (inputEscala) inputEscala.value = pessoa.escalaId || '1';
            if (inputTurno) inputTurno.value = pessoa.turno || 'M';
            if (inputTipo) inputTipo.value = pessoa.tipo || 'OPERACIONAL';
            if (titulo) titulo.textContent = '✏️ Editar Funcionário';
            if (subtitulo) subtitulo.textContent = 'Edite os dados do funcionário';
            modal.dataset.editando = pessoaId;
        } else {
            console.error('❌ Pessoa não encontrada para ID:', pessoaId);
            mostrarToast('❌ Funcionário não encontrado!', 'erro');
            fecharModalPessoa();
        }
    } else {
        if (inputNome) inputNome.value = '';
        if (inputCargo) inputCargo.value = '';
        if (inputEmpresa) inputEmpresa.value = '';
        if (inputContato) inputContato.value = '';
        if (inputEscala) inputEscala.value = '1';
        if (inputTurno) inputTurno.value = 'M';
        if (inputTipo) inputTipo.value = 'OPERACIONAL';
        if (titulo) titulo.textContent = '👤 Cadastrar Funcionário';
        if (subtitulo) subtitulo.textContent = 'Vincule o funcionário à escala e turno';
        modal.dataset.editando = '';
    }
}

export function fecharModalPessoa() {
    const modal = document.getElementById('modalPessoa');
    if (modal) modal.classList.remove('ativo');
}

// =====================================================
// MODAL EXTRA
// =====================================================

export function abrirModalExtra() {
    const modal = document.getElementById('modalExtra');
    if (!modal) {
        console.error('❌ Modal extra não encontrado!');
        return;
    }
    modal.classList.add('ativo');

    const hoje = new Date();
    const inputData = document.getElementById('inputDataExtra');
    if (inputData) {
        inputData.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    }
    const inputInicio = document.getElementById('inputInicioExtra');
    if (inputInicio) inputInicio.value = '08:00';
    const inputFim = document.getElementById('inputFimExtra');
    if (inputFim) inputFim.value = '18:00';
}

export function fecharModalExtra() {
    const modal = document.getElementById('modalExtra');
    if (modal) modal.classList.remove('ativo');
}

// =====================================================
// 🏖️ MODAL FÉRIAS
// =====================================================

/**
 * Abre o modal de férias.
 * @param {Object} equipeSelecionada - escala ativa no momento
 */
export function abrirModalFerias(equipeSelecionada = null) {
    const modal = document.getElementById('modalFerias');
    if (!modal) {
        console.error('❌ Modal férias não encontrado!');
        return;
    }

    if (!equipeSelecionada) {
        mostrarToast('❌ Selecione uma escala primeiro!', 'erro');
        return;
    }

    escalaAtualFerias = equipeSelecionada;
    feriasEditandoId = null;

    // Atualiza badge da escala
    const badge = document.getElementById('feriasEscalaBadge');
    if (badge) {
        badge.textContent = `Escala ${equipeSelecionada.id}`;
    }

    // Limpa o formulário
    cancelarEdicaoFerias();

    // Renderiza a lista
    renderizarListaFerias();

    // Abre o modal
    modal.classList.add('ativo');
}

/**
 * Fecha o modal de férias.
 */
export function fecharModalFerias() {
    const modal = document.getElementById('modalFerias');
    if (modal) modal.classList.remove('ativo');
    
    feriasEditandoId = null;
    escalaAtualFerias = null;
    cancelarEdicaoFerias();
}

/**
 * Salva uma férias (nova ou editada).
 * @param {number} statusDiaInicio - 0=folga, 1=trabalho, 2=trabalho+alerta
 */
export function salvarFerias(statusDiaInicio = null) {
    if (!escalaAtualFerias) {
        mostrarToast('❌ Nenhuma escala selecionada.', 'erro');
        return;
    }

    const inputInicio = document.getElementById('inputFeriasInicio');
    const inputDias = document.getElementById('inputFeriasDias');
    const inputObs = document.getElementById('inputFeriasObs');

    const inicio = inputInicio?.value;
    const dias = parseInt(inputDias?.value || '0');
    const observacao = inputObs?.value || '';

    // Validações básicas do formulário
    if (!inicio) {
        mostrarToast('⚠️ Informe a data de início.', 'erro');
        inputInicio?.focus();
        return;
    }

    if (!dias || dias < 1 || dias > FERIAS_DURACAO_MAX) {
        mostrarToast(`⚠️ Duração deve ser entre 1 e ${FERIAS_DURACAO_MAX} dias.`, 'erro');
        inputDias?.focus();
        return;
    }

    // Se statusDiaInicio não foi passado, deixa o ferias.js calcular
    // (mas ele precisa saber — vamos usar um fallback)
    if (statusDiaInicio === null) {
        // Fallback: assume dia de trabalho (a validação real fica no ferias.js)
        // O ideal é o app.js passar esse valor calculado
        statusDiaInicio = 1;
    }

    let resultado;

    if (feriasEditandoId) {
        // ----- EDIÇÃO -----
        resultado = atualizarFerias(feriasEditandoId, {
            inicio,
            dias,
            observacao,
            statusDiaInicio
        });

        if (resultado.sucesso) {
            mostrarToast('✅ Férias atualizadas com sucesso!', 'sucesso');
            feriasEditandoId = null;
            cancelarEdicaoFerias();
        } else {
            mostrarToast(`❌ ${resultado.erro}`, 'erro');
            return;
        }
    } else {
        // ----- CADASTRO NOVO -----
        resultado = criarFerias({
            escalaId: escalaAtualFerias.id,
            inicio,
            dias,
            observacao,
            statusDiaInicio
        });

        if (resultado.sucesso) {
            mostrarToast('✅ Férias cadastradas com sucesso!', 'sucesso');
        } else {
            mostrarToast(`❌ ${resultado.erro}`, 'erro');
            return;
        }
    }

    // Limpa o formulário e atualiza a lista
    cancelarEdicaoFerias();
    renderizarListaFerias();

    // Atualiza o calendário (callback opcional)
    if (typeof window.renderizarCalendario === 'function') {
        window.renderizarCalendario();
    }
}

/**
 * Carrega uma férias no formulário para edição.
 * @param {number} id
 */
export function editarFerias(id) {
    const ferias = getFeriasPorId(id);
    if (!ferias) {
        mostrarToast('❌ Férias não encontrada.', 'erro');
        return;
    }

    feriasEditandoId = id;

    const inputInicio = document.getElementById('inputFeriasInicio');
    const inputDias = document.getElementById('inputFeriasDias');
    const inputObs = document.getElementById('inputFeriasObs');
    const titulo = document.getElementById('feriasFormTitulo');
    const btnCancelar = document.getElementById('btnCancelarEdicao');

    if (inputInicio) inputInicio.value = ferias.inicio;
    if (inputDias) inputDias.value = ferias.dias;
    if (inputObs) inputObs.value = ferias.observacao || '';
    if (titulo) titulo.textContent = '✏️ Editar Férias';
    if (btnCancelar) btnCancelar.hidden = false;

    atualizarPreviewFerias();

    // Scroll ao topo do modal
    const modalContent = document.querySelector('#modalFerias .modal-content');
    if (modalContent) modalContent.scrollTop = 0;
}

/**
 * Cancela a edição em andamento.
 */
export function cancelarEdicaoFerias() {
    feriasEditandoId = null;

    const inputInicio = document.getElementById('inputFeriasInicio');
    const inputDias = document.getElementById('inputFeriasDias');
    const inputObs = document.getElementById('inputFeriasObs');
    const titulo = document.getElementById('feriasFormTitulo');
    const btnCancelar = document.getElementById('btnCancelarEdicao');
    const preview = document.getElementById('feriasPreview');

    if (inputInicio) inputInicio.value = '';
    if (inputDias) inputDias.value = FERIAS_DURACAO_MAX;
    if (inputObs) inputObs.value = '';
    if (titulo) titulo.textContent = 'Cadastrar Nova Férias';
    if (btnCancelar) btnCancelar.hidden = true;
    if (preview) preview.hidden = true;
}

/**
 * Atualiza o preview do término das férias em tempo real.
 */
export function atualizarPreviewFerias() {
    const inputInicio = document.getElementById('inputFeriasInicio');
    const inputDias = document.getElementById('inputFeriasDias');
    const preview = document.getElementById('feriasPreview');
    const previewFim = document.getElementById('feriasPreviewFim');

    const inicio = inputInicio?.value;
    const dias = parseInt(inputDias?.value || '0');

    if (!inicio || !dias || dias < 1 || dias > FERIAS_DURACAO_MAX) {
        if (preview) preview.hidden = true;
        return;
    }

    const fim = calcularDataFim(inicio, dias);

    // Formata para pt-BR
    const [ano, mes, dia] = fim.split('-');
    const fimFormatado = `${dia}/${mes}/${ano}`;

    if (previewFim) previewFim.textContent = fimFormatado;
    if (preview) preview.hidden = false;
}

/**
 * Renderiza a lista de férias da escala ativa.
 */
export function renderizarListaFerias() {
    const container = document.getElementById('feriasListaConteudo');
    if (!container || !escalaAtualFerias) return;

    const ferias = getFeriasPorEscala(escalaAtualFerias.id);

    if (ferias.length === 0) {
        container.innerHTML = `
            <div class="ferias-vazio">
                Nenhuma férias cadastrada ainda.
            </div>
        `;
        return;
    }

    // Ordena por data de início (mais recente primeiro)
    const ordenadas = [...ferias].sort((a, b) => b.inicio.localeCompare(a.inicio));

    container.innerHTML = ordenadas.map(f => {
        const [anoI, mesI, diaI] = f.inicio.split('-');
        const [anoF, mesF, diaF] = f.fim.split('-');
        const inicioFmt = `${diaI}/${mesI}/${anoI}`;
        const fimFmt = `${diaF}/${mesF}/${anoF}`;
        const obs = f.observacao ? `<div class="ferias-item-obs">${f.observacao}</div>` : '';

        return `
            <div class="ferias-item" role="listitem">
                <div class="ferias-item-header">
                    <span class="ferias-item-periodo">📅 ${inicioFmt} → ${fimFmt}</span>
                    <span class="ferias-item-dias">${f.dias} dias</span>
                </div>
                ${obs}
                <div class="ferias-item-acoes">
                    <button class="btn-ferias-acao" 
                            onclick="window.editarFerias(${f.id})" 
                            aria-label="Editar férias">
                        ✏️ Editar
                    </button>
                    <button class="btn-ferias-acao btn-excluir" 
                            onclick="window.excluirFeriasConfirmar(${f.id})" 
                            aria-label="Excluir férias">
                        🗑️ Excluir
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// =====================================================
// 🏖️ EXCLUSÃO DE FÉRIAS
// =====================================================

/**
 * Abre o modal de confirmação de exclusão.
 * @param {number} id
 */
export function excluirFeriasConfirmar(id) {
    const ferias = getFeriasPorId(id);
    if (!ferias) {
        mostrarToast('❌ Férias não encontrada.', 'erro');
        return;
    }

    feriasExcluirId = id;

    const [anoI, mesI, diaI] = ferias.inicio.split('-');
    const [anoF, mesF, diaF] = ferias.fim.split('-');
    const inicioFmt = `${diaI}/${mesI}/${anoI}`;
    const fimFmt = `${diaF}/${mesF}/${anoF}`;

    const texto = document.getElementById('confirmarExclusaoTexto');
    if (texto) {
        texto.textContent = `Tem certeza que deseja excluir as férias de ${inicioFmt} a ${fimFmt} (${ferias.dias} dias)?`;
    }

    const modal = document.getElementById('modalConfirmarExclusao');
    if (modal) modal.classList.add('ativo');
}

/**
 * Confirma e executa a exclusão.
 */
export function confirmarExclusaoFerias() {
    if (!feriasExcluirId) return;

    const resultado = excluirFerias(feriasExcluirId);

    if (resultado.sucesso) {
        mostrarToast('🗑️ Férias excluídas com sucesso!', 'sucesso');
        cancelarExclusaoFerias();
        renderizarListaFerias();

        // Atualiza o calendário
        if (typeof window.renderizarCalendario === 'function') {
            window.renderizarCalendario();
        }
    } else {
        mostrarToast(`❌ ${resultado.erro}`, 'erro');
        cancelarExclusaoFerias();
    }
}

/**
 * Cancela a exclusão.
 */
export function cancelarExclusaoFerias() {
    feriasExcluirId = null;
    const modal = document.getElementById('modalConfirmarExclusao');
    if (modal) modal.classList.remove('ativo');
}

// =====================================================
// 🏖️ INICIALIZAÇÃO DOS LISTENERS DE FÉRIAS
// =====================================================

/**
 * Configura os listeners de input do formulário de férias.
 * Chame isso uma vez após o DOM estar pronto.
 */
export function initModaisFerias() {
    const inputInicio = document.getElementById('inputFeriasInicio');
    const inputDias = document.getElementById('inputFeriasDias');

    if (inputInicio) {
        inputInicio.addEventListener('change', atualizarPreviewFerias);
        inputInicio.addEventListener('input', atualizarPreviewFerias);
    }

    if (inputDias) {
        inputDias.addEventListener('change', atualizarPreviewFerias);
        inputDias.addEventListener('input', atualizarPreviewFerias);
    }

    console.log('✅ Listeners de férias configurados');
}