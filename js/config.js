// =====================================================
// CONFIGURAÇÕES - Calendário de Escalas
// =====================================================

import { CORES_ESCALAS, CORES_CALENDARIO, PALETA } from './constants/cores.js';
import { getFeriadosMoveis } from './utils/feriadosMoveis.js';

// ===== ESCALAS PADRÃO =====
export const escalasPadrao = [
    {
        id: 1, nome: "Escala 1", cor: CORES_ESCALAS[1].bg,
        semana1: "T T F T T T F", semana2: "F T T F T T T",
        semana3: "T F T T T F F", semana4: "F T T T F T T"
    },
    {
        id: 2, nome: "Escala 2", cor: CORES_ESCALAS[2].bg,
        semana1: "T F T T T F F", semana2: "F T T T F T T",
        semana3: "T T F T T T F", semana4: "F T T F T T T"
    },
    {
        id: 3, nome: "Escala 3", cor: CORES_ESCALAS[3].bg,
        semana1: "F T T F T T T", semana2: "T F T T T F F",
        semana3: "F T T T F T T", semana4: "T T F T T T F"
    },
    {
        id: 4, nome: "Escala 4", cor: CORES_ESCALAS[4].bg,
        semana1: "F T T T F T T", semana2: "T T F T T T F",
        semana3: "F T T F T T T", semana4: "T F T T T F F"
    }
];

// =====================================================
// CORES DO HEADER
// =====================================================

export const coresMeses = Array(12).fill(PALETA.grayLight);
export const coresDestaque = Array(12).fill(PALETA.primary);
export const coresHeaderFundo = Array(12).fill(CORES_CALENDARIO.header.background);
export const coresHeaderTexto = Array(12).fill(CORES_CALENDARIO.header.text);
export const coresHeaderBorda = Array(12).fill(CORES_CALENDARIO.header.border);

// =====================================================
// FERIADOS - FIXOS + MÓVEIS (calculados por ano)
// =====================================================

const FERIADOS_FIXOS = {
    '01-01': { nome: 'Confraternização Universal', tipo: 'feriado', icone: '🎆' },
    '25-01': { nome: 'Aniversário de SP', tipo: 'feriado', icone: '🏙️' },
    '14-02': { nome: 'Dia dos Namorados (EUA)', tipo: 'comemorativo', icone: '💕' },
    '08-03': { nome: 'Dia da Mulher', tipo: 'comemorativo', icone: '👩' },
    '21-04': { nome: 'Tiradentes', tipo: 'feriado', icone: '⚔️' },
    '22-04': { nome: 'Descobrimento do Brasil', tipo: 'comemorativo', icone: '⛵' },
    '01-05': { nome: 'Dia do Trabalho', tipo: 'feriado', icone: '🛠️' },
    '13-05': { nome: 'Abolição da Escravatura', tipo: 'comemorativo', icone: '📜' },
    '12-06': { nome: 'Dia dos Namorados', tipo: 'comemorativo', icone: '💕' },
    '09-07': { nome: 'Revolução Constitucionalista', tipo: 'feriado', icone: '⚡' },
    '11-08': { nome: 'Dia do Estudante', tipo: 'comemorativo', icone: '📚' },
    '07-09': { nome: 'Independência do Brasil', tipo: 'feriado', icone: '🇧🇷' },
    '07-10': { nome: 'Dia do Livro', tipo: 'comemorativo', icone: '📖' },
    '12-10': { nome: 'N. Sra. Aparecida', tipo: 'feriado', icone: '🙏' },
    '31-10': { nome: 'Halloween', tipo: 'comemorativo', icone: '🎃' },
    '02-11': { nome: 'Finados', tipo: 'feriado', icone: '🕯️' },
    '15-11': { nome: 'Proclamação da República', tipo: 'feriado', icone: '🏛️' },
    '20-11': { nome: 'Consciência Negra', tipo: 'feriado', icone: '✊' },
    '24-12': { nome: 'Véspera de Natal', tipo: 'comemorativo', icone: '🧑‍🎄' },
    '25-12': { nome: 'Natal', tipo: 'feriado', icone: '🎄' },
    '31-12': { nome: 'Véspera de Ano Novo', tipo: 'comemorativo', icone: '🥂' }
};

// Cache por ano (performance)
const _cacheFeriados = {};

/**
 * Retorna todos os feriados (fixos + móveis) de um ano.
 * @param {number} ano
 * @returns {Object} { 'DD-MM': { nome, tipo, icone } }
 */
export function getFeriados(ano) {
    if (!_cacheFeriados[ano]) {
        _cacheFeriados[ano] = {
            ...FERIADOS_FIXOS,
            ...getFeriadosMoveis(ano)
        };
    }
    return _cacheFeriados[ano];
}

/**
 * Atalho: busca um feriado por dia/mês/ano.
 * @returns {Object|null}
 */
export function getFeriado(dia, mes, ano) {
    const chave = `${String(dia).padStart(2, '0')}-${String(mes).padStart(2, '0')}`;
    return getFeriados(ano)[chave] || null;
}

// ===== CONSTANTES GLOBAIS =====
export const DATA_REFERENCIA = new Date(2026, 6, 5);
export const HORAS_POR_DIA = 9;
export const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];