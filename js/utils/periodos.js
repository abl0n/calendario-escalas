// =====================================================
// PERÍODOS - Manipulação e Cálculo de Períodos
// =====================================================

import { obterMesAbreviado } from './helpers.js';

let DIA_INICIO = 16;
let DIA_FIM = 15;

export function formatarDataInput(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${ano}-${mes}-${dia}`;
}

export function formatarDataPeriodo(data) {
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

export function getConfigPeriodo() {
    return { diaInicio: DIA_INICIO, diaFim: DIA_FIM };
}

export function setConfigPeriodo(diaInicio, diaFim) {
    if (diaInicio < 1 || diaInicio > 31) diaInicio = 1;
    if (diaFim < 1 || diaFim > 31) diaFim = 30;
    
    DIA_INICIO = diaInicio;
    DIA_FIM = diaFim;
    
    try {
        localStorage.setItem('periodoConfig', JSON.stringify({ 
            diaInicio: DIA_INICIO, 
            diaFim: DIA_FIM 
        }));
    } catch (e) {}
    
    return { diaInicio: DIA_INICIO, diaFim: DIA_FIM };
}

export function carregarConfigPeriodo() {
    try {
        const dados = localStorage.getItem('periodoConfig');
        if (dados) {
            const config = JSON.parse(dados);
            DIA_INICIO = config.diaInicio || 16;
            DIA_FIM = config.diaFim || 15;
        }
    } catch (e) {
        console.warn('⚠️ Não foi possível carregar a configuração do período:', e);
    }
    return { diaInicio: DIA_INICIO, diaFim: DIA_FIM };
}

export function getPeriodoData(mes, ano) {
    if (isNaN(mes) || isNaN(ano)) {
        const hoje = new Date();
        return getPeriodoData(hoje.getMonth(), hoje.getFullYear());
    }

    while (mes < 0) { mes += 12; ano--; }
    while (mes > 11) { mes -= 12; ano++; }

    const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
    let inicio, fim;
    
    if (DIA_INICIO > DIA_FIM) {
        // Período cruza meses (ex: 16 de um mês até 15 do próximo)
        let diaInicioAjustado = Math.min(DIA_INICIO, ultimoDiaMes);
        inicio = new Date(ano, mes, diaInicioAjustado);
        
        let mesFim = mes + 1;
        let anoFim = ano;
        if (mesFim > 11) { mesFim = 0; anoFim++; }
        
        const ultimoDiaMesFim = new Date(anoFim, mesFim + 1, 0).getDate();
        let diaFimAjustado = Math.min(DIA_FIM, ultimoDiaMesFim);
        fim = new Date(anoFim, mesFim, diaFimAjustado);
    } else {
        // Período no mesmo mês
        let diaInicioAjustado = Math.min(DIA_INICIO, ultimoDiaMes);
        let diaFimAjustado = Math.min(DIA_FIM, ultimoDiaMes);
        inicio = new Date(ano, mes, diaInicioAjustado);
        fim = new Date(ano, mes, diaFimAjustado);
    }
    
    if (inicio > fim) {
        [inicio, fim] = [fim, inicio];
    }
    
    return { inicio, fim };
}

export function getPeriodoAtual() {
    const hoje = new Date();
    return getPeriodoData(hoje.getMonth(), hoje.getFullYear());
}

export function getPeriodoPorIndex(index = 0) {
    const atual = getPeriodoAtual();
    let mes = atual.inicio.getMonth() + index;
    let ano = atual.inicio.getFullYear();

    while (mes < 0) { mes += 12; ano--; }
    while (mes > 11) { mes -= 12; ano++; }

    return getPeriodoData(mes, ano);
}

// 🔥 FUNÇÃO CORRIGIDA - USANDO obterMesAbreviado DO HELPERS
export function getNomePeriodo(periodo) {
    const mesInicio = periodo.inicio.getMonth();
    const mesFim = periodo.fim.getMonth();
    const ano = periodo.inicio.getFullYear();
    const anoFim = periodo.fim.getFullYear();

    const mesInicioAbr = obterMesAbreviado(mesInicio);
    const mesFimAbr = obterMesAbreviado(mesFim);

    if (ano !== anoFim) {
        return `${mesInicioAbr} ${ano} / ${mesFimAbr} ${anoFim}`;
    }

    if (mesInicio === mesFim) {
        return `${mesInicioAbr} ${ano}`;
    } else {
        return `${mesInicioAbr}/${mesFimAbr} ${ano}`;
    }
}

export function dataEstaNoPeriodo(data, periodo) {
    const d = new Date(data.getFullYear(), data.getMonth(), data.getDate());
    const inicio = new Date(periodo.inicio.getFullYear(), periodo.inicio.getMonth(), periodo.inicio.getDate());
    const fim = new Date(periodo.fim.getFullYear(), periodo.fim.getMonth(), periodo.fim.getDate());
    return d >= inicio && d <= fim;
}

export function getDiasNoPeriodo(periodo) {
    const diffTime = Math.abs(periodo.fim - periodo.inicio);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function validarPeriodo(inicio, fim) {
    if (!(inicio instanceof Date) || !(fim instanceof Date) || isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
        return { valido: false, mensagem: 'Datas inválidas!' };
    }

    if (inicio > fim) {
        return { valido: false, mensagem: 'A data de início deve ser anterior à data de fim!' };
    }

    const diffDias = Math.floor((fim - inicio) / (1000 * 60 * 60 * 24));
    if (diffDias > 31) {
        return { valido: false, mensagem: 'O período não pode exceder 31 dias!', diffDias };
    }

    return { valido: true, diffDias };
}

// Inicializar configuração ao carregar o módulo
carregarConfigPeriodo();