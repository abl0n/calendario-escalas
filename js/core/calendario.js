function renderizarCalendario() {
    const container = DOM.calendarioContainer;
    if (!container) return;
    
    const periodo = getPeriodoPorIndex(periodoIndex);
    const mesIndex = periodo.inicio.getMonth();

    const corHeaderFundo = coresHeaderFundo[mesIndex] || '#f1f5f9';
    const corHeaderTexto = coresHeaderTexto[mesIndex] || '#1e293b';
    const corHeaderBorda = coresHeaderBorda[mesIndex] || '#3B82F6';

    const mesesClasses = ['mes-jan', 'mes-fev', 'mes-mar', 'mes-abr', 'mes-mai', 'mes-jun',
                          'mes-jul', 'mes-ago', 'mes-set', 'mes-out', 'mes-nov', 'mes-dez'];
    
    container.className = '';
    container.classList.add('calendario', mesesClasses[mesIndex]);

    const mesInicio = periodo.inicio.getMonth();
    const mesFim = periodo.fim.getMonth();
    const anoInicio = periodo.inicio.getFullYear();
    const anoFim = periodo.fim.getFullYear();

    let primeiroDia;
    if (mesInicio !== mesFim || anoInicio !== anoFim) {
        primeiroDia = new Date(periodo.inicio);
        const diaSemanaRef = primeiroDia.getDay();
        primeiroDia.setDate(primeiroDia.getDate() - diaSemanaRef);
    } else {
        primeiroDia = new Date(periodo.inicio.getFullYear(), periodo.inicio.getMonth(), 1);
        const diaSemana = primeiroDia.getDay();
        primeiroDia.setDate(primeiroDia.getDate() - diaSemana);
    }

    const hoje = new Date();
    const hojeStr = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

    // Tabela limpa sem estilos inline travando a largura
    let html = `<table class="tabela-calendario">
        <thead>
            <tr>`;
    
    DIAS_SEMANA.forEach(dia => {
        html += `<th style="background: ${corHeaderFundo}; color: ${corHeaderTexto}; border-bottom: 3px solid ${corHeaderBorda};">${dia}</th>`;
    });
    html += '</tr></thead><tbody>';

    let dataAtual = new Date(primeiroDia);
    let rowOpen = false;

    for (let i = 0; i < 42; i++) {
        if (i % 7 === 0) {
            if (rowOpen) html += '</tr>';
            html += `<tr>`;
            rowOpen = true;
        }

        const dia = dataAtual.getDate();
        const mes = dataAtual.getMonth() + 1;
        const ano = dataAtual.getFullYear();
        const dataStr = `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;

        const status = obterStatusDia(equipeSelecionada, dataAtual);
        const isHoje = dataStr === hojeStr;
        const noPeriodo = dataEstaNoPeriodo(dataAtual, periodo);
        const dataComemorativa = getDataComemorativa(dia, mes);
        const extras = getExtrasPorData(dataStr);
        const temExtra = extras.length > 0;
        const totalExtraDia = extras.reduce((acc, item) => acc + item.horas, 0);

        const classePeriodo = noPeriodo ? '' : 'dia-outro-periodo';
        const classeHoje = isHoje ? 'dia-hoje' : '';
        const classeExtra = temExtra ? 'dia-com-extra' : '';
        const statusTexto = status === 1 ? 'T' : 'F';
        const statusClasse = status === 1 ? 'status-trabalho' : 'status-folga';

        let classeEspecial = '';
        let iconeEspecial = '';
        if (dataComemorativa) {
            if (dataComemorativa.tipo === 'feriado') {
                classeEspecial = status === 1 ? 'dia-feriado-trabalhado' : 'dia-feriado';
                iconeEspecial = `<span class="evento-icone">${dataComemorativa.icone}${status === 1 ? '⚠️' : ''}</span>`;
            } else {
                classeEspecial = 'dia-comemorativo';
                iconeEspecial = `<span class="evento-icone">${dataComemorativa.icone}</span>`;
            }
        }

        let labelExtra = '';
        if (temExtra) {
            const extraMin = Math.round(totalExtraDia * 60);
            const h = Math.floor(extraMin / 60);
            const m = extraMin % 60;
            labelExtra = `<span class="evento-extra">➕ ${h > 0 ? h + 'h' : ''}${m > 0 ? m + 'min' : ''}</span>`;
        }

        html += `<td class="${classeHoje} ${classeExtra} ${classeEspecial} ${classePeriodo}">
            <div class="dia-header">
                <span class="dia-numero">${dia}</span>
                <span class="status-dia ${statusClasse}">${statusTexto}</span>
            </div>
            <div class="dia-corpo">
                ${iconeEspecial}
                ${labelExtra}
            </div>
        </td>`;

        dataAtual.setDate(dataAtual.getDate() + 1);
    }

    if (rowOpen) html += '</tr>';
    html += '</tbody></table>';
    container.innerHTML = html;
}