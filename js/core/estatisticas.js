// =====================================================
// ESTATÍSTICAS - Relatórios e Indicadores do Período
// =====================================================

import { getPeriodoPorIndex, getDiasNoPeriodo, formatarDataPeriodo } from '../utils/periodos.js';
import { carregarExtrasStorage } from '../utils/storage.js';
import { getPessoas } from '../core/pessoas.js';
import { HORAS_POR_DIA, DATA_REFERENCIA, feriados } from '../config.js';
import { horasParaMinutos, formatarMinutos, getCicloCompleto } from '../utils/helpers.js';

let equipeSelecionada = null;

export function initEstatisticas(equipe) {
    equipeSelecionada = equipe;
}

function obterStatusDia(equipe, data) {
    const ciclo = getCicloCompleto(equipe);
    const diffDias = Math.floor((data - DATA_REFERENCIA) / (1000 * 60 * 60 * 24));
    const totalDias = ciclo.length;
    const posicao = ((diffDias % totalDias) + totalDias) % totalDias;
    return ciclo[posicao];
}

export function calcularEstatisticas(periodoIndex) {
    const periodo = getPeriodoPorIndex(periodoIndex);
    const diasNoPeriodo = getDiasNoPeriodo(periodo);

    let trabalhos = 0,
        folgas = 0,
        feriadosCount = 0,
        feriadosTrabalhadosCount = 0;
    let horasTrabalhadas = 0;

    const dataAtual = new Date(periodo.inicio);
    while (dataAtual <= periodo.fim) {
        const status = obterStatusDia(equipeSelecionada, dataAtual);
        const dia = dataAtual.getDate();
        const mes = dataAtual.getMonth() + 1;

        const chave = `${String(dia).padStart(2, '0')}-${String(mes).padStart(2, '0')}`;
        const infoFeriado = feriados[chave];
        const isFeriado = infoFeriado && infoFeriado.tipo === 'feriado';

        if (isFeriado) {
            feriadosCount++;
            if (status === 1) feriadosTrabalhadosCount++;
        }

        if (status === 1) {
            trabalhos++;
            horasTrabalhadas += HORAS_POR_DIA;
        } else {
            folgas++;
        }

        dataAtual.setDate(dataAtual.getDate() + 1);
    }

    const minutosTrabalhados = horasParaMinutos(horasTrabalhadas);
    
    // Calcular Horas Extras acumuladas no período
    const extrasStorage = carregarExtrasStorage();
    const totalExtrasPeriodo = extrasStorage.reduce((acc, item) => {
        const itemData = new Date(item.data + 'T00:00:00');
        if (itemData >= periodo.inicio && itemData <= periodo.fim) {
            return acc + (item.horas || 0);
        }
        return acc;
    }, 0);

    const totalExtrasMin = horasParaMinutos(totalExtrasPeriodo);
    const percentual = diasNoPeriodo > 0 ? Math.round((trabalhos / diasNoPeriodo) * 100) : 0;

    // Contar pessoas da escala por turno
    const todasPessoas = getPessoas();
    const pessoasEscala = todasPessoas.filter(p => Number(p.escalaId) === Number(equipeSelecionada?.id));
    
    const turnos = {
        M: pessoasEscala.filter(p => p.turno === 'M').length,
        T: pessoasEscala.filter(p => p.turno === 'T').length,
        N: pessoasEscala.filter(p => p.turno === 'N').length
    };

    return {
        periodo,
        diasNoPeriodo,
        trabalhos,
        folgas,
        feriadosCount,
        feriadosTrabalhadosCount,
        minutosTrabalhados,
        totalExtrasMin,
        percentual,
        totalPessoas: pessoasEscala.length,
        turnos
    };
}

export function renderizarEstatisticas(container, periodoIndex) {
    if (!container) return;
    const stats = calcularEstatisticas(periodoIndex);

    let html = `
        <div class="estatistica-detalhada-item">
            <span class="label">📅 Período</span>
            <span class="valor">${formatarDataPeriodo(stats.periodo.inicio)} a ${formatarDataPeriodo(stats.periodo.fim)}</span>
        </div>
        <div class="estatistica-detalhada-item">
            <span class="label">📊 Total de Dias</span>
            <span class="valor">${stats.diasNoPeriodo}</span>
        </div>
        <div class="estatistica-detalhada-item">
            <span class="label">💼 Dias Trabalhados</span>
            <span class="valor trabalho">${stats.trabalhos}</span>
        </div>
        <div class="estatistica-detalhada-item">
            <span class="label">🏖️ Dias de Folga</span>
            <span class="valor folga">${stats.folgas}</span>
        </div>
        <div class="estatistica-detalhada-item">
            <span class="label">📅 Feriados no Período</span>
            <span class="valor feriado">${stats.feriadosCount}</span>
        </div>
        <div class="estatistica-detalhada-item">
            <span class="label">⚠️ Feriados Trabalhados</span>
            <span class="valor feriado">${stats.feriadosTrabalhadosCount}</span>
        </div>
        <div class="estatistica-detalhada-item">
            <span class="label">⏱️ Horas Efetivas</span>
            <span class="valor" style="color:#059669;">${formatarMinutos(stats.minutosTrabalhados)}</span>
        </div>
        <div class="estatistica-detalhada-item">
            <span class="label">📊 Percentual Trabalhado</span>
            <span class="valor" style="color:#8B5CF6;">${stats.percentual}%</span>
        </div>
        <div class="estatistica-detalhada-item">
            <span class="label">➕ Horas Extras (Período)</span>
            <span class="valor" style="color:#f59e0b;">${formatarMinutos(stats.totalExtrasMin)}</span>
        </div>
        <div class="estatistica-detalhada-item" style="border-top: 2px solid #f1f5f9; margin-top: 4px; padding-top: 12px;">
            <span class="label" style="font-weight:700;">👥 Funcionários - Escala ${equipeSelecionada?.id || ''}</span>
            <span class="valor" style="color:#3B82F6;">${stats.totalPessoas}</span>
        </div>
        <div class="estatistica-detalhada-item">
            <span class="label" style="padding-left:16px;">☀️ Manhã</span>
            <span class="valor manha">${stats.turnos.M}</span>
        </div>
        <div class="estatistica-detalhada-item">
            <span class="label" style="padding-left:16px;">🌆 Tarde</span>
            <span class="valor tarde">${stats.turnos.T}</span>
        </div>
        <div class="estatistica-detalhada-item">
            <span class="label" style="padding-left:16px;">🌙 Noite</span>
            <span class="valor noite">${stats.turnos.N}</span>
        </div>
    `;

    container.innerHTML = html;
}