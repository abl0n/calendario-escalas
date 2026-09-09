// =====================================================
// ESTATÍSTICAS - Relatórios e Indicadores do Período
// =====================================================

import { getPeriodoPorIndex, getDiasNoPeriodo, formatarDataPeriodo } from '../utils/periodos.js';
import { carregarExtrasStorage } from '../utils/storage.js';
import { getPessoas } from '../core/pessoas.js';
import { HORAS_POR_DIA, DATA_REFERENCIA, feriados } from '../config.js';
import { horasParaMinutos, formatarMinutos, getCicloCompleto } from '../utils/helpers.js';
import { CORES_ESCALAS, CORES_TURNOS } from '../constants/cores.js';

let equipeSelecionada = null;

export function initEstatisticas(equipe) {
    equipeSelecionada = equipe;
    console.log('📊 initEstatisticas - equipe selecionada:', equipe);
}

function obterStatusDia(equipe, data) {
    if (!equipe) return 0;
    const ciclo = getCicloCompleto(equipe);
    if (!ciclo || ciclo.length === 0) return 0;
    const diffDias = Math.floor((data - DATA_REFERENCIA) / (1000 * 60 * 60 * 24));
    const totalDias = ciclo.length;
    const posicao = ((diffDias % totalDias) + totalDias) % totalDias;
    return ciclo[posicao] || 0;
}

function calcularEstatisticas(periodoIndex) {
    const periodo = getPeriodoPorIndex(periodoIndex);
    const diasNoPeriodo = getDiasNoPeriodo(periodo);

    let trabalhos = 0, folgas = 0, feriadosCount = 0, feriadosTrabalhadosCount = 0;
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

function calcularTotaisPorCategoria() {
    const todasPessoas = getPessoas();
    const adm = todasPessoas.filter(p => p.tipo === 'ADM').length;
    const comercial = todasPessoas.filter(p => Number(p.escalaId) === 5).length;
    const operacional = todasPessoas.filter(p => p.tipo === 'OPERACIONAL' && Number(p.escalaId) !== 5).length;
    const manha = todasPessoas.filter(p => p.turno === 'M').length;
    const tarde = todasPessoas.filter(p => p.turno === 'T').length;
    const noite = todasPessoas.filter(p => p.turno === 'N').length;
    
    return { adm, comercial, operacional, total: todasPessoas.length, manha, tarde, noite };
}

// =====================================================
// RENDERIZAR ESTATÍSTICAS - NOMENCLATURA CLARA
// =====================================================

export function renderizarEstatisticas(container, periodoIndex) {
    console.log('📊 renderizarEstatisticas chamada!');
    
    if (!container) {
        console.error('❌ Container não existe!');
        return;
    }

    if (!equipeSelecionada) {
        container.innerHTML = `
            <div style="text-align:center; padding:40px; color:var(--color-warning);">
                <p>⚠️ Nenhuma escala selecionada</p>
                <small style="color:var(--color-text-muted);">Selecione uma escala (1, 2, 3 ou 4) para ver as estatísticas.</small>
            </div>
        `;
        return;
    }

    try {
        const stats = calcularEstatisticas(periodoIndex);
        const totais = calcularTotaisPorCategoria();

        const escalaId = equipeSelecionada?.id || 1;
        const corEscala = CORES_ESCALAS[escalaId]?.bg || '#2563EB';
        const corEscalaText = CORES_ESCALAS[escalaId]?.text || '#FFFFFF';

        let html = `
            <!-- ============================================================ -->
            <!-- SEÇÃO 1: DADOS DO PERÍODO - CALENDÁRIO -->
            <!-- ============================================================ -->
            <div style="margin-bottom: 16px;">
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    color: var(--color-text);
                    margin-bottom: 10px;
                    padding-bottom: 6px;
                    border-bottom: 2px solid var(--color-border, #e2e8f0);
                ">
                    <svg class="icon" width="18" height="18" style="color: var(--color-primary, #2563EB);">
                        <use href="assets/icons/sprite.svg#icon-calendar"></use>
                    </svg>
                    📅 Período: ${formatarDataPeriodo(stats.periodo.inicio)} a ${formatarDataPeriodo(stats.periodo.fim)}
                </div>
                <div class="estatisticas-grid">
                    <div class="estatistica-card total-dias" style="border-left-color: #3B82F6;">
                        <div class="estatistica-icon">📊</div>
                        <div class="estatistica-info">
                            <span class="estatistica-label">Total de dias no período</span>
                            <span class="estatistica-valor" style="color:#3B82F6;">${stats.diasNoPeriodo}</span>
                        </div>
                    </div>
                    <div class="estatistica-card trabalhados" style="border-left-color: #2563EB;">
                        <div class="estatistica-icon">💼</div>
                        <div class="estatistica-info">
                            <span class="estatistica-label">Dias trabalhados (Escala ${escalaId})</span>
                            <span class="estatistica-valor" style="color:#2563EB;">${stats.trabalhos}</span>
                        </div>
                    </div>
                    <div class="estatistica-card folga" style="border-left-color: #64748B;">
                        <div class="estatistica-icon">🏖️</div>
                        <div class="estatistica-info">
                            <span class="estatistica-label">Dias de folga (Escala ${escalaId})</span>
                            <span class="estatistica-valor" style="color:#64748B;">${stats.folgas}</span>
                        </div>
                    </div>
                    <div class="estatistica-card feriados" style="border-left-color: #DC2626;">
                        <div class="estatistica-icon">📅</div>
                        <div class="estatistica-info">
                            <span class="estatistica-label">Feriados no período</span>
                            <span class="estatistica-valor" style="color:#DC2626;">${stats.feriadosCount}</span>
                        </div>
                    </div>
                    <div class="estatistica-card feriados-trab" style="border-left-color: #B91C1C;">
                        <div class="estatistica-icon">⚠️</div>
                        <div class="estatistica-info">
                            <span class="estatistica-label">Feriados trabalhados (Escala ${escalaId})</span>
                            <span class="estatistica-valor" style="color:#B91C1C;">${stats.feriadosTrabalhadosCount}</span>
                        </div>
                    </div>
                    <div class="estatistica-card horas" style="border-left-color: #10B981;">
                        <div class="estatistica-icon">⏱️</div>
                        <div class="estatistica-info">
                            <span class="estatistica-label">Horas efetivas (Escala ${escalaId})</span>
                            <span class="estatistica-valor" style="color:#10B981;">${formatarMinutos(stats.minutosTrabalhados)}</span>
                        </div>
                    </div>
                    <div class="estatistica-card percentual" style="border-left-color: #8B5CF6;">
                        <div class="estatistica-icon">📊</div>
                        <div class="estatistica-info">
                            <span class="estatistica-label">% de dias trabalhados (Escala ${escalaId})</span>
                            <span class="estatistica-valor" style="color:#8B5CF6;">${stats.percentual}%</span>
                        </div>
                    </div>
                    <div class="estatistica-card extra" style="border-left-color: #F59E0B;">
                        <div class="estatistica-icon">⏰</div>
                        <div class="estatistica-info">
                            <span class="estatistica-label">Horas extras no período (Todas as escalas)</span>
                            <span class="estatistica-valor" style="color:#F59E0B;">${formatarMinutos(stats.totalExtrasMin)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ============================================================ -->
            <!-- DIVIDER -->
            <!-- ============================================================ -->
            <div style="margin: 20px 0 16px 0; display: flex; align-items: center; gap: 12px;">
                <div style="flex: 1; height: 2px; background: linear-gradient(to right, var(--color-border, #e2e8f0), transparent);"></div>
                <span style="font-size: 0.7rem; font-weight: 600; color: var(--color-text-muted, #64748b); text-transform: uppercase; letter-spacing: 0.5px; background: var(--color-surface, #ffffff); padding: 0 12px;">
                    📋 Funcionários da Escala ${escalaId}
                </span>
                <div style="flex: 1; height: 2px; background: linear-gradient(to left, var(--color-border, #e2e8f0), transparent);"></div>
            </div>

            <!-- ============================================================ -->
            <!-- SEÇÃO 2: FUNCIONÁRIOS DA ESCALA SELECIONADA -->
            <!-- ============================================================ -->
            <div style="margin-bottom: 16px;">
                <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 0.85rem; color: var(--color-text); margin-bottom: 10px; padding-bottom: 6px; border-bottom: 2px solid var(--color-border, #e2e8f0);">
                    <svg class="icon" width="18" height="18" style="color: ${corEscala};">
                        <use href="assets/icons/sprite.svg#icon-users"></use>
                    </svg>
                    🏢 Escala ${escalaId} - ${equipeSelecionada?.nome || ''}
                    <span style="font-size: 0.65rem; font-weight: 600; background: ${corEscala}; color: ${corEscalaText}; padding: 2px 10px; border-radius: 12px;">${stats.totalPessoas} funcionários</span>
                </div>
                <div class="estatisticas-grid">
                    <div class="estatistica-card" style="border-left-color: ${corEscala};">
                        <div class="estatistica-icon">👥</div>
                        <div class="estatistica-info">
                            <span class="estatistica-label">Total de funcionários</span>
                            <span class="estatistica-valor" style="color: ${corEscala};">${stats.totalPessoas}</span>
                        </div>
                    </div>
                    <div class="estatistica-card" style="border-left-color: ${CORES_TURNOS.M.badge};">
                        <div class="estatistica-icon">☀️</div>
                        <div class="estatistica-info">
                            <span class="estatistica-label">Funcionários no turno da Manhã</span>
                            <span class="estatistica-valor" style="color: ${CORES_TURNOS.M.badge};">${stats.turnos.M}</span>
                        </div>
                    </div>
                    <div class="estatistica-card" style="border-left-color: ${CORES_TURNOS.T.badge};">
                        <div class="estatistica-icon">🌆</div>
                        <div class="estatistica-info">
                            <span class="estatistica-label">Funcionários no turno da Tarde</span>
                            <span class="estatistica-valor" style="color: ${CORES_TURNOS.T.badge};">${stats.turnos.T}</span>
                        </div>
                    </div>
                    <div class="estatistica-card" style="border-left-color: ${CORES_TURNOS.N.badge};">
                        <div class="estatistica-icon">🌙</div>
                        <div class="estatistica-info">
                            <span class="estatistica-label">Funcionários no turno da Noite</span>
                            <span class="estatistica-valor" style="color: ${CORES_TURNOS.N.badge};">${stats.turnos.N}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- ============================================================ -->
            <!-- DIVIDER -->
            <!-- ============================================================ -->
            <div style="margin: 20px 0 16px 0; display: flex; align-items: center; gap: 12px;">
                <div style="flex: 1; height: 2px; background: linear-gradient(to right, var(--color-border, #e2e8f0), transparent);"></div>
                <span style="font-size: 0.7rem; font-weight: 600; color: var(--color-text-muted, #64748b); text-transform: uppercase; letter-spacing: 0.5px; background: var(--color-surface, #ffffff); padding: 0 12px;">
                    📊 Resumo Geral da Empresa
                </span>
                <div style="flex: 1; height: 2px; background: linear-gradient(to left, var(--color-border, #e2e8f0), transparent);"></div>
            </div>

            <!-- ============================================================ -->
            <!-- SEÇÃO 3: RESUMO GERAL DA EMPRESA -->
            <!-- ============================================================ -->
            <div style="margin-bottom: 16px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px;">
                    <div style="padding: 12px 14px; border-radius: var(--radius-md, 8px); background: #10B981; color: #FFFFFF; text-align: center; border: none;">
                        <div style="font-size: 0.55rem; font-weight: 600; text-transform: uppercase; opacity: 0.8;">🏢 Funcionários ADM</div>
                        <div style="font-size: 1.4rem; font-weight: 700;">${totais.adm}</div>
                        <div style="font-size: 0.55rem; opacity: 0.7;">Administrativos</div>
                    </div>
                    <div style="padding: 12px 14px; border-radius: var(--radius-md, 8px); background: #F59E0B; color: #1E293B; text-align: center; border: none;">
                        <div style="font-size: 0.55rem; font-weight: 600; text-transform: uppercase; opacity: 0.8;">🏢 Funcionários Comercial</div>
                        <div style="font-size: 1.4rem; font-weight: 700;">${totais.comercial}</div>
                        <div style="font-size: 0.55rem; opacity: 0.7;">Escala Comercial (Seg-Sex)</div>
                    </div>
                    <div style="padding: 12px 14px; border-radius: var(--radius-md, 8px); background: #64748B; color: #FFFFFF; text-align: center; border: none;">
                        <div style="font-size: 0.55rem; font-weight: 600; text-transform: uppercase; opacity: 0.8;">🔧 Funcionários Operacionais</div>
                        <div style="font-size: 1.4rem; font-weight: 700;">${totais.operacional}</div>
                        <div style="font-size: 0.55rem; opacity: 0.7;">Escalas 1, 2, 3 e 4</div>
                    </div>
                </div>
                
                <!-- TOTAL GERAL -->
                <div style="padding: 12px 14px; border-radius: var(--radius-md, 8px); background: var(--color-primary, #2563EB); color: #FFFFFF; text-align: center; border: none; margin-bottom: 10px;">
                    <div style="font-size: 0.55rem; font-weight: 600; text-transform: uppercase; opacity: 0.8;">👥 Total de Funcionários da Empresa</div>
                    <div style="font-size: 1.4rem; font-weight: 700;">${totais.total}</div>
                </div>

                <!-- TOTAIS POR TURNO - GERAL -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                    <div style="padding: 10px 12px; border-radius: var(--radius-md, 8px); background: ${CORES_TURNOS.M.bg}; color: ${CORES_TURNOS.M.text}; text-align: center; border: 1px solid ${CORES_TURNOS.M.badge}30;">
                        <div style="font-size: 0.55rem; font-weight: 600; text-transform: uppercase; opacity: 0.7;">☀️ Turno da Manhã</div>
                        <div style="font-size: 1.3rem; font-weight: 700;">${totais.manha}</div>
                        <div style="font-size: 0.55rem; opacity: 0.6;">Total de funcionários</div>
                    </div>
                    <div style="padding: 10px 12px; border-radius: var(--radius-md, 8px); background: ${CORES_TURNOS.T.bg}; color: ${CORES_TURNOS.T.text}; text-align: center; border: 1px solid ${CORES_TURNOS.T.badge}30;">
                        <div style="font-size: 0.55rem; font-weight: 600; text-transform: uppercase; opacity: 0.7;">🌆 Turno da Tarde</div>
                        <div style="font-size: 1.3rem; font-weight: 700;">${totais.tarde}</div>
                        <div style="font-size: 0.55rem; opacity: 0.6;">Total de funcionários</div>
                    </div>
                    <div style="padding: 10px 12px; border-radius: var(--radius-md, 8px); background: ${CORES_TURNOS.N.bg}; color: ${CORES_TURNOS.N.text}; text-align: center; border: 1px solid ${CORES_TURNOS.N.badge}30;">
                        <div style="font-size: 0.55rem; font-weight: 600; text-transform: uppercase; opacity: 0.7;">🌙 Turno da Noite</div>
                        <div style="font-size: 1.3rem; font-weight: 700;">${totais.noite}</div>
                        <div style="font-size: 0.55rem; opacity: 0.6;">Total de funcionários</div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        console.log('✅ Estatísticas renderizadas com sucesso!');
        
    } catch (error) {
        console.error('❌ Erro ao renderizar estatísticas:', error);
        container.innerHTML = `
            <div style="padding: 20px; color: var(--color-danger); text-align: center;">
                <p>❌ Erro ao renderizar estatísticas</p>
                <small style="color: var(--color-text-muted);">${error.message}</small>
            </div>
        `;
    }
}