// =====================================================
// CONFIGURAÇÕES - Calendário de Escalas
// =====================================================

import { CORES_ESCALAS, CORES_CALENDARIO, PALETA } from './constants/cores.js';

// ===== ESCALAS PADRÃO =====
export const escalasPadrao = [
    {
        id: 1,
        nome: "Escala 1",
        cor: CORES_ESCALAS[1].bg,
        semana1: "T T F T T T F",
        semana2: "F T T F T T T",
        semana3: "T F T T T F F",
        semana4: "F T T T F T T"
    },
    {
        id: 2,
        nome: "Escala 2",
        cor: CORES_ESCALAS[2].bg,
        semana1: "T F T T T F F",
        semana2: "F T T T F T T",
        semana3: "T T F T T T F",
        semana4: "F T T F T T T"
    },
    {
        id: 3,
        nome: "Escala 3",
        cor: CORES_ESCALAS[3].bg,
        semana1: "F T T F T T T",
        semana2: "T F T T T F F",
        semana3: "F T T T F T T",
        semana4: "T T F T T T F"
    },
    {
        id: 4,
        nome: "Escala 4",
        cor: CORES_ESCALAS[4].bg,
        semana1: "F T T T F T T",
        semana2: "T T F T T T F",
        semana3: "F T T F T T T",
        semana4: "T F T T T F F"
    }
];

// =====================================================
// CORES DO HEADER - UNIFICADAS
// =====================================================

export const coresMeses = Array(12).fill(PALETA.grayLight);
export const coresDestaque = Array(12).fill(PALETA.primary);
export const coresHeaderFundo = Array(12).fill(CORES_CALENDARIO.header.background);
export const coresHeaderTexto = Array(12).fill(CORES_CALENDARIO.header.text);
export const coresHeaderBorda = Array(12).fill(CORES_CALENDARIO.header.border);

// =====================================================
// FERIADOS
// =====================================================

export const feriados = {
    '01-01': { nome: 'Confraternização Universal', tipo: 'feriado', icone: '🎆' },
    '25-01': { nome: 'Aniv. SP', tipo: 'feriado', icone: '🏙️' },
    '14-02': { nome: 'Dia dos Namorados (EUA)', tipo: 'comemorativo', icone: '💕' },
    '17-02': { nome: 'Carnaval', tipo: 'feriado', icone: '🎭' },
    '18-02': { nome: 'Quarta Cinzas', tipo: 'feriado', icone: '✝️' },
    '08-03': { nome: 'Dia da Mulher', tipo: 'comemorativo', icone: '👩' },
    '03-04': { nome: 'Sexta Santa', tipo: 'feriado', icone: '✝️' },
    '05-04': { nome: 'Páscoa', tipo: 'feriado', icone: '🐣' },
    '21-04': { nome: 'Tiradentes', tipo: 'feriado', icone: '⚔️' },
    '22-04': { nome: 'Descobrimento', tipo: 'comemorativo', icone: '⛵' },
    '01-05': { nome: 'Dia do Trabalho', tipo: 'feriado', icone: '🛠️' },
    '13-05': { nome: 'Abolição', tipo: 'comemorativo', icone: '📜' },
    '12-06': { nome: 'Dia dos Namorados', tipo: 'comemorativo', icone: '💕' },
    '21-06': { nome: 'Corpus Christi', tipo: 'feriado', icone: '⛪' },
    '09-07': { nome: 'Revol. Const.', tipo: 'feriado', icone: '⚡' },
    '11-08': { nome: 'Dia do Estudante', tipo: 'comemorativo', icone: '📚' },
    '07-09': { nome: 'Independência', tipo: 'feriado', icone: '🇧🇷' },
    '07-10': { nome: 'Dia do Livro', tipo: 'comemorativo', icone: '📖' },
    '12-10': { nome: 'N.S. Aparecida', tipo: 'feriado', icone: '🙏' },
    '31-10': { nome: 'Halloween', tipo: 'comemorativo', icone: '🎃' },
    '02-11': { nome: 'Finados', tipo: 'feriado', icone: '🕯️' },
    '15-11': { nome: 'Procl. República', tipo: 'feriado', icone: '🏛️' },
    '20-11': { nome: 'Consc. Negra', tipo: 'comemorativo', icone: '✊' },
    '24-12': { nome: 'Véspera Natal', tipo: 'comemorativo', icone: '🧑‍🎄' },
    '25-12': { nome: 'Natal', tipo: 'feriado', icone: '🎄' },
    '31-12': { nome: 'Véspera Ano Novo', tipo: 'comemorativo', icone: '🥂' }
};

// ===== CONSTANTES GLOBAIS =====
export const DATA_REFERENCIA = new Date(2026, 6, 5);
export const HORAS_POR_DIA = 9;
export const DIAS_SEMANA = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

