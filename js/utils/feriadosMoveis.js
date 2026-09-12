// =====================================================
// FERIADOS MÓVEIS - Cálculo dinâmico baseado na Páscoa
// Algoritmo de Meeus/Jones/Butcher
// =====================================================

/**
 * Calcula o Domingo de Páscoa para um dado ano.
 * @param {number} ano
 * @returns {Date}
 */
export function calcularPascoa(ano) {
    const a = ano % 19;
    const b = Math.floor(ano / 100);
    const c = ano % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const L = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * L) / 451);
    const mes = Math.floor((h + L - 7 * m + 114) / 31);
    const dia = ((h + L - 7 * m + 114) % 31) + 1;

    return new Date(ano, mes - 1, dia);
}

function deslocar(data, dias) {
    const nova = new Date(data.getTime());
    nova.setDate(nova.getDate() + dias);
    return nova;
}

function chave(data) {
    const dd = String(data.getDate()).padStart(2, '0');
    const mm = String(data.getMonth() + 1).padStart(2, '0');
    return `${dd}-${mm}`;
}

/**
 * Retorna todos os feriados móveis de um ano no formato
 * { 'DD-MM': { nome, tipo, icone } }
 */
export function getFeriadosMoveis(ano) {
    const pascoa = calcularPascoa(ano);

    return {
        [chave(deslocar(pascoa, -48))]: { nome: 'Segunda de Carnaval', tipo: 'facultativo', icone: '🎭' },
        [chave(deslocar(pascoa, -47))]: { nome: 'Carnaval (Terça)',    tipo: 'facultativo', icone: '🎭' },
        [chave(deslocar(pascoa, -46))]: { nome: 'Quarta de Cinzas',    tipo: 'facultativo', icone: '✝️' },
        [chave(deslocar(pascoa, -2))]:  { nome: 'Sexta-feira Santa',   tipo: 'feriado',     icone: '✝️' },
        [chave(pascoa)]:                { nome: 'Páscoa (Domingo)',    tipo: 'feriado',     icone: '🐣' },
        [chave(deslocar(pascoa, 60))]:  { nome: 'Corpus Christi',      tipo: 'facultativo', icone: '⛪' }
    };
}