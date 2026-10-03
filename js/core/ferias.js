// =====================================================
// FÉRIAS - CRUD (por escala)
// =====================================================
// Regras:
//   - Duração máxima: 30 dias
//   - Não pode iniciar em dia de folga
//   - Não pode sobrepor outra férias da mesma escala
// =====================================================

import {
    carregarFeriasStorage,
    salvarFeriasStorage
} from '../utils/storage.js';

// =====================================================
// CONSTANTES
// =====================================================

export const FERIAS_DURACAO_MAX = 30;
export const FERIAS_DURACAO_MIN = 1;

// =====================================================
// HELPERS INTERNOS
// =====================================================

/**
 * Converte Date para string ISO no formato YYYY-MM-DD
 * @param {Date} data
 * @returns {string}
 */
function dateParaISO(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

/**
 * Converte string ISO (YYYY-MM-DD) para Date local
 * @param {string} iso
 * @returns {Date}
 */
function isoParaDate(iso) {
    return new Date(iso + 'T00:00:00');
}

/**
 * Calcula a data de término com base no início e na duração.
 * Ex: inicio 2026-12-15, dias 30 → fim 2027-01-13
 * @param {string} inicio - ISO YYYY-MM-DD
 * @param {number} dias
 * @returns {string} ISO YYYY-MM-DD
 */
export function calcularDataFim(inicio, dias) {
    const d = isoParaDate(inicio);
    d.setDate(d.getDate() + dias - 1);
    return dateParaISO(d);
}

/**
 * Verifica se dois períodos se sobrepõem.
 * @param {string} inicioA
 * @param {string} fimA
 * @param {string} inicioB
 * @param {string} fimB
 * @returns {boolean}
 */
function periodosSobrepoem(inicioA, fimA, inicioB, fimB) {
    // Dois períodos NÃO se sobrepõem se um termina antes do outro começar
    return !(fimA < inicioB || inicioA > fimB);
}

// =====================================================
// VALIDAÇÕES
// =====================================================

/**
 * Valida os dados de uma férias antes de salvar.
 * @param {Object} params
 * @param {number} params.escalaId
 * @param {string} params.inicio - ISO YYYY-MM-DD
 * @param {number} params.dias
 * @param {number} params.statusDiaInicio - 0=folga, 1=trabalho, 2=trabalho+alerta
 * @param {number|null} params.idIgnorar - ID a ignorar na checagem (para edição)
 * @returns {{ valido: boolean, erro?: string }}
 */
export function validarFerias({ escalaId, inicio, dias, statusDiaInicio, idIgnorar = null }) {
    // Escala obrigatória
    if (!escalaId) {
        return { valido: false, erro: 'Escala não informada.' };
    }

    // Data de início obrigatória
    if (!inicio) {
        return { valido: false, erro: 'Informe a data de início.' };
    }

    // Formato da data
    if (!/^\d{4}-\d{2}-\d{2}$/.test(inicio)) {
        return { valido: false, erro: 'Data de início inválida.' };
    }

    // Dias válidos
    if (!Number.isInteger(dias) || dias < FERIAS_DURACAO_MIN || dias > FERIAS_DURACAO_MAX) {
        return { valido: false, erro: `Duração deve ser entre ${FERIAS_DURACAO_MIN} e ${FERIAS_DURACAO_MAX} dias.` };
    }

    // Não pode iniciar em dia de folga (status 0)
    if (statusDiaInicio === 0) {
        return { valido: false, erro: 'Não é possível iniciar férias em dia de folga.' };
    }

    // Verifica sobreposição com outras férias da mesma escala
    const fim = calcularDataFim(inicio, dias);
    const ferias = carregarFeriasStorage();

    const sobrepoe = ferias.find(f => {
        if (f.escalaId !== escalaId) return false;
        if (idIgnorar && f.id === idIgnorar) return false;
        return periodosSobrepoem(inicio, fim, f.inicio, f.fim);
    });

    if (sobrepoe) {
        return {
            valido: false,
            erro: `Período sobrepõe férias existente (${sobrepoe.inicio} a ${sobrepoe.fim}).`
        };
    }

    return { valido: true };
}

// =====================================================
// CRUD - CREATE
// =====================================================

/**
 * Cria um novo registro de férias.
 * @param {Object} dados
 * @param {number} dados.escalaId
 * @param {string} dados.inicio - ISO YYYY-MM-DD
 * @param {number} dados.dias
 * @param {string} [dados.observacao]
 * @param {number} dados.statusDiaInicio
 * @returns {{ sucesso: boolean, erro?: string, ferias?: Object }}
 */
export function criarFerias({ escalaId, inicio, dias, observacao = '', statusDiaInicio }) {
    // Validação
    const validacao = validarFerias({ escalaId, inicio, dias, statusDiaInicio });
    if (!validacao.valido) {
        return { sucesso: false, erro: validacao.erro };
    }

    // Monta o registro
    const fim = calcularDataFim(inicio, dias);
    const nova = {
        id: Date.now(),
        escalaId: Number(escalaId),
        inicio,
        dias: Number(dias),
        fim,
        observacao: observacao.trim(),
        criadoEm: new Date().toISOString()
    };

    // Salva
    const ferias = carregarFeriasStorage();
    ferias.push(nova);
    salvarFeriasStorage(ferias);

    return { sucesso: true, ferias: nova };
}

// =====================================================
// CRUD - READ
// =====================================================

/**
 * Retorna todas as férias cadastradas.
 * @returns {Array}
 */
export function getTodasFerias() {
    return carregarFeriasStorage();
}

/**
 * Retorna todas as férias de uma escala específica.
 * @param {number} escalaId
 * @returns {Array}
 */
export function getFeriasPorEscala(escalaId) {
    const id = Number(escalaId);
    return carregarFeriasStorage().filter(f => f.escalaId === id);
}

/**
 * Retorna uma férias pelo ID.
 * @param {number} id
 * @returns {Object|null}
 */
export function getFeriasPorId(id) {
    return carregarFeriasStorage().find(f => f.id === Number(id)) || null;
}

/**
 * Verifica se uma escala está de férias em uma data específica.
 * @param {number} escalaId
 * @param {string} dataStr - ISO YYYY-MM-DD
 * @returns {boolean}
 */
export function estaDeFerias(escalaId, dataStr) {
    const id = Number(escalaId);
    return carregarFeriasStorage().some(f =>
        f.escalaId === id &&
        dataStr >= f.inicio &&
        dataStr <= f.fim
    );
}

/**
 * Retorna a férias ativa de uma escala em uma data (se houver).
 * @param {number} escalaId
 * @param {string} dataStr
 * @returns {Object|null}
 */
export function getFeriasNaData(escalaId, dataStr) {
    const id = Number(escalaId);
    return carregarFeriasStorage().find(f =>
        f.escalaId === id &&
        dataStr >= f.inicio &&
        dataStr <= f.fim
    ) || null;
}

// =====================================================
// CRUD - UPDATE
// =====================================================

/**
 * Atualiza uma férias existente.
 * @param {number} id
 * @param {Object} novosDados
 * @param {string} [novosDados.inicio]
 * @param {number} [novosDados.dias]
 * @param {string} [novosDados.observacao]
 * @param {number} novosDados.statusDiaInicio
 * @returns {{ sucesso: boolean, erro?: string, ferias?: Object }}
 */
export function atualizarFerias(id, { inicio, dias, observacao, statusDiaInicio }) {
    const ferias = carregarFeriasStorage();
    const index = ferias.findIndex(f => f.id === Number(id));

    if (index === -1) {
        return { sucesso: false, erro: 'Férias não encontrada.' };
    }

    const atual = ferias[index];
    const novosInicio = inicio ?? atual.inicio;
    const novosDias = dias ?? atual.dias;

    // Validação (ignorando o próprio registro)
    const validacao = validarFerias({
        escalaId: atual.escalaId,
        inicio: novosInicio,
        dias: novosDias,
        statusDiaInicio,
        idIgnorar: atual.id
    });

    if (!validacao.valido) {
        return { sucesso: false, erro: validacao.erro };
    }

    // Atualiza
    const novaFim = calcularDataFim(novosInicio, novosDias);
    ferias[index] = {
        ...atual,
        inicio: novosInicio,
        dias: Number(novosDias),
        fim: novaFim,
        observacao: observacao !== undefined ? observacao.trim() : atual.observacao,
        atualizadoEm: new Date().toISOString()
    };

    salvarFeriasStorage(ferias);
    return { sucesso: true, ferias: ferias[index] };
}

// =====================================================
// CRUD - DELETE
// =====================================================

/**
 * Remove uma férias pelo ID.
 * @param {number} id
 * @returns {{ sucesso: boolean, erro?: string }}
 */
export function excluirFerias(id) {
    const ferias = carregarFeriasStorage();
    const existe = ferias.some(f => f.id === Number(id));

    if (!existe) {
        return { sucesso: false, erro: 'Férias não encontrada.' };
    }

    const filtradas = ferias.filter(f => f.id !== Number(id));
    salvarFeriasStorage(filtradas);

    return { sucesso: true };
}