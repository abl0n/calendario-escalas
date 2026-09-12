// =====================================================
// HORAS EXTRAS - Gerenciamento
// =====================================================

import { carregarExtrasStorage, salvarExtrasStorage } from '../utils/storage.js';
import { mostrarToast, horasParaMinutos, formatarMinutos } from '../utils/helpers.js';
import { getPeriodoPorIndex } from '../utils/periodos.js';

let horasExtras = [];

export function initHorasExtras() {
    horasExtras = carregarExtrasStorage();
}

export function getHorasExtras() {
    return horasExtras;
}

export function getExtrasPorData(dataStr) {
    return horasExtras.filter(item => item.data === dataStr);
}

export function getTotalExtras() {
    return horasExtras.reduce((acc, item) => acc + (item.horas || 0), 0);
}

/**
 * 🔥 Retorna o total de horas extras DENTRO do período atual.
 * @param {number} periodoIndex - índice do período (0 = atual)
 * @returns {{ total: number, minutos: number, quantidade: number }}
 */
export function getTotalExtrasPorPeriodo(periodoIndex = 0) {
    const periodo = getPeriodoPorIndex(periodoIndex);
    let totalHoras = 0;
    let quantidade = 0;

    horasExtras.forEach(item => {
        const d = new Date(item.data + 'T00:00:00');
        if (d >= periodo.inicio && d <= periodo.fim) {
            totalHoras += item.horas || 0;
            quantidade++;
        }
    });

    const minutos = horasParaMinutos(totalHoras);
    return { total: totalHoras, minutos, quantidade };
}

/**
 * 🔥 Retorna lista de extras DENTRO do período.
 */
export function getExtrasPorPeriodo(periodoIndex = 0) {
    const periodo = getPeriodoPorIndex(periodoIndex);
    return horasExtras.filter(item => {
        const d = new Date(item.data + 'T00:00:00');
        return d >= periodo.inicio && d <= periodo.fim;
    });
}

export function adicionarExtra(data, inicio, fim) {
    if (!data || !inicio || !fim) {
        mostrarToast('Preencha todos os campos!', 'erro');
        return false;
    }

    const [hInicio, mInicio] = inicio.split(':').map(Number);
    const [hFim, mFim] = fim.split(':').map(Number);

    let totalMinutos = (hFim * 60 + mFim) - (hInicio * 60 + mInicio);
    if (totalMinutos < 0) totalMinutos += 1440;

    const horas = totalMinutos / 60;

    if (horas <= 0) {
        mostrarToast('Horário inválido!', 'erro');
        return false;
    }

    horasExtras.push({ data, inicio, fim, horas });
    salvarExtrasStorage(horasExtras);
    mostrarToast('✅ Hora extra adicionada com sucesso!', 'sucesso');
    return true;
}

export function removerExtra(index) {
    if (confirm('Remover esta hora extra?')) {
        horasExtras.splice(index, 1);
        salvarExtrasStorage(horasExtras);
        mostrarToast('🗑️ Hora extra removida', 'info');
        return true;
    }
    return false;
}

export function renderizarListaExtras(container, totalModal, periodoIndex = 0) {
    const periodo = getPeriodoPorIndex(periodoIndex);
    const doPeriodo = horasExtras.filter(item => {
        const d = new Date(item.data + 'T00:00:00');
        return d >= periodo.inicio && d <= periodo.fim;
    });

    if (doPeriodo.length === 0) {
        container.innerHTML = '<p style="color:#94a3b8;font-size:0.85rem;text-align:center;padding:12px;">Nenhuma hora extra registrada neste período</p>';
        totalModal.textContent = 'Total: 0h';
        return;
    }

    const sorted = [...doPeriodo].sort((a, b) => b.data.localeCompare(a.data));
    let html = '';
    sorted.forEach((item) => {
        const dataFormatada = item.data.split('-').reverse().join('/');
        const index = horasExtras.indexOf(item);
        const minutos = horasParaMinutos(item.horas);
        html += `<div class="item-extra">
            <span class="info">${dataFormatada} ${item.inicio} - ${item.fim}</span>
            <span class="horas">${formatarMinutos(minutos)}</span>
            <button class="btn-remover" onclick="window.removerExtra(${index})">✕</button>
        </div>`;
    });

    container.innerHTML = html;
    const totalMin = horasParaMinutos(doPeriodo.reduce((acc, i) => acc + i.horas, 0));
    totalModal.textContent = `Total: ${formatarMinutos(totalMin)}`;
}