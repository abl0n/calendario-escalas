// =====================================================
// CONFIGURAÇÕES - Calendário de Escalas
// =====================================================

// ===== ESCALAS PADRÃO =====
export const escalasPadrao = [
    {
        id: 1,
        nome: "Escala 1",
        cor: "#3B82F6",
        semana1: "T T F T T T F",
        semana2: "F T T F T T T",
        semana3: "T F T T T F F",
        semana4: "F T T T F T T"
    },
    {
        id: 2,
        nome: "Escala 2",
        cor: "#EF4444",
        semana1: "T F T T T F F",
        semana2: "F T T T F T T",
        semana3: "T T F T T T F",
        semana4: "F T T F T T T"
    },
    {
        id: 3,
        nome: "Escala 3",
        cor: "#8B5CF6",
        semana1: "F T T F T T T",
        semana2: "T F T T T F F",
        semana3: "F T T T F T T",
        semana4: "T T F T T T F"
    },
    {
        id: 4,
        nome: "Escala 4",
        cor: "#F59E0B",
        semana1: "F T T T F T T",
        semana2: "T T F T T T F",
        semana3: "F T T F T T T",
        semana4: "T F T T T F F"
    }
];

// =====================================================
// CORES DO CALENDÁRIO
// =====================================================

export const coresMeses = [
    '#f3e8ff', // Janeiro
    '#fce4ec', // Fevereiro
    '#e8f0fe', // Março
    '#e3f2fd', // Abril
    '#fff8e1', // Maio
    '#fce4ec', // Junho
    '#fff8e1', // Julho
    '#f3e5f5', // Agosto
    '#fff8e1', // Setembro
    '#fce4ec', // Outubro
    '#e3f2fd', // Novembro
    '#fce4ec'  // Dezembro
];

export const coresDestaque = [
    '#7c3aed', // Janeiro
    '#db2777', // Fevereiro
    '#1e40af', // Março
    '#2563eb', // Abril
    '#ca8a04', // Maio
    '#dc2626', // Junho
    '#ca8a04', // Julho
    '#7c3aed', // Agosto
    '#ca8a04', // Setembro
    '#db2777', // Outubro
    '#2563eb', // Novembro
    '#dc2626'  // Dezembro
];

// =====================================================
// CORES DO HEADER (CAMPANHAS DE SAÚDE)
// =====================================================

export const coresHeaderFundo = [
    '#f3e8ff', // Janeiro - Saúde Mental
    '#fce4ec', // Fevereiro - Lúpus/Alzheimer
    '#e8f0fe', // Março - Câncer Colorretal
    '#e3f2fd', // Abril - Autismo
    '#fff8e1', // Maio - Segurança no Trânsito
    '#fce4ec', // Junho - Doação de Sangue
    '#fff8e1', // Julho - Hepatites Virais
    '#f3e5f5', // Agosto - Violência Contra Mulher
    '#fff8e1', // Setembro - Prevenção ao Suicídio
    '#fce4ec', // Outubro - Câncer de Mama
    '#e3f2fd', // Novembro - Câncer de Próstata/Diabetes
    '#fce4ec'  // Dezembro - HIV/Aids
];

export const coresHeaderTexto = [
    '#7c3aed', '#db2777', '#1e40af', '#2563eb', 
    '#ca8a04', '#dc2626', '#ca8a04', '#7c3aed', 
    '#ca8a04', '#db2777', '#2563eb', '#dc2626'
];

export const coresHeaderBorda = [...coresHeaderTexto];

// =====================================================
// FERIADOS E DATAS COMEMORATIVAS
// =====================================================

// =====================================================
// FERIADOS E DATAS COMEMORATIVAS - COM SVG SPRITE
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
// =====================================================
// CONSTANTES GLOBAIS
// =====================================================

export const DATA_REFERENCIA = new Date(2026, 6, 5); // 05/07/2026
export const HORAS_POR_DIA = 9;
export const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
export const MESES = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];