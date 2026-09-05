// =====================================================
// HELPERS - Funções auxiliares gerais
// =====================================================

// ===== TOAST COM ÍCONES ANIMADOS =====
export function mostrarToast(mensagem, tipo = 'info') {
    let toast = document.getElementById('toastNotification');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toastNotification';
        document.body.appendChild(toast);
    }
    
    // Configurações por tipo
    const config = {
        sucesso: { icone: 'check_circle', animacao: 'mi-burst', cor: '#10B981', emoji: '✅' },
        erro: { icone: 'error', animacao: 'mi-pulse', cor: '#EF4444', emoji: '❌' },
        info: { icone: 'info', animacao: 'mi-float', cor: '#3B82F6', emoji: 'ℹ️' },
        alerta: { icone: 'warning', animacao: 'mi-swing', cor: '#F59E0B', emoji: '⚠️' }
    };
    
    const cfg = config[tipo] || config.info;
    
    toast.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        padding: 12px 24px;
        border-radius: 8px;
        color: #FFFFFF;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 0.875rem;
        font-weight: 600;
        z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        background: ${cfg.cor};
        display: flex;
        align-items: center;
        gap: 10px;
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 90%;
        pointer-events: none;
    `;
    
    // Verificar se Material Icons está disponível
    const hasMaterialIcons = document.querySelector('link[href*="material-icons"]') !== null ||
                             document.querySelector('link[href*="fonts.googleapis.com/icon"]') !== null;
    
    let iconeHtml;
    if (hasMaterialIcons) {
        iconeHtml = `<span class="material-icons ${cfg.animacao}" style="font-size:20px; flex-shrink:0;">${cfg.icone}</span>`;
    } else {
        iconeHtml = `<span style="font-size:20px; flex-shrink:0;">${cfg.emoji}</span>`;
    }
    
    toast.innerHTML = `${iconeHtml}<span>${mensagem}</span>`;
    
    // Mostrar com animação
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0) scale(1)';
        toast.style.pointerEvents = 'auto';
    });
    
    // Auto-fechar após 3 segundos
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px) scale(0.95)';
        toast.style.pointerEvents = 'none';
    }, 3000);
}

// ===== FUNÇÃO MOSTRAR LOADING =====
export function mostrarLoading(mensagem = 'Carregando...') {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;
    
    overlay.innerHTML = `
        <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100%; gap:16px; background:rgba(15,23,42,0.85);">
            <span class="material-icons mi-spin" style="font-size:48px; color:#3B82F6;">refresh</span>
            <p style="color: #f1f5f9; font-size: 1.1rem; font-weight: 600; margin:0;">${mensagem}</p>
        </div>
    `;
    overlay.style.display = 'flex';
}

export function esconderLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (!overlay) return;
    overlay.style.display = 'none';
}

// ===== CONVERSÃO E FORMATAÇÃO DE HORAS =====
export function horasParaMinutos(horas) {
    if (typeof horas !== 'number' || isNaN(horas)) return 0;
    return Math.round(horas * 60);
}

export function formatarMinutos(minutos) {
    if (typeof minutos !== 'number' || isNaN(minutos)) return '0min';
    const minAbs = Math.abs(minutos);
    const h = Math.floor(minAbs / 60);
    const m = minAbs % 60;
    let resultado = '';
    if (h > 0) resultado += `${h}h`;
    if (m > 0 || h === 0) resultado += `${m}min`;
    return resultado;
}

export function formatarHora(horas) {
    if (typeof horas !== 'number' || isNaN(horas)) return '0h';
    const h = Math.floor(horas);
    const m = Math.round((horas - h) * 60);
    if (m === 0) return `${h}h`;
    return `${h}h${m}min`;
}

// ===== PARSE E CICLO DE ESCALA =====
export function parseSemana(semana) {
    if (!semana) return [];
    return semana.trim().split(/\s+/).map(s => s.toUpperCase() === 'T' ? 1 : 0);
}

export function getCicloCompleto(equipe) {
    if (!equipe) return Array(28).fill(0);
    if (Array.isArray(equipe.ciclo) && equipe.ciclo.length > 0) {
        return equipe.ciclo;
    }
    if (!equipe.semana1 || !equipe.semana2 || !equipe.semana3 || !equipe.semana4) {
        return Array(28).fill(0);
    }
    const s1 = parseSemana(equipe.semana1);
    const s2 = parseSemana(equipe.semana2);
    const s3 = parseSemana(equipe.semana3);
    const s4 = parseSemana(equipe.semana4);
    return [...s1, ...s2, ...s3, ...s4];
}

// ===== DATAS E UTILITÁRIOS =====
export function gerarId() {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 5);
}

export function clonarObjeto(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function formatarData(dataStr) {
    if (!dataStr) return '---';
    try {
        const data = new Date(dataStr + 'T00:00:00');
        if (isNaN(data.getTime())) return dataStr;
        return data.toLocaleDateString('pt-BR');
    } catch (e) {
        return dataStr;
    }
}

export function formatarDataInput(data) {
    if (!data) return '';
    try {
        const d = new Date(data);
        if (isNaN(d.getTime())) return '';
        const dia = String(d.getDate()).padStart(2, '0');
        const mes = String(d.getMonth() + 1).padStart(2, '0');
        const ano = d.getFullYear();
        return `${ano}-${mes}-${dia}`;
    } catch (e) {
        return '';
    }
}

export function calcularDiferencaDias(data1, data2) {
    try {
        const d1 = new Date(data1);
        const d2 = new Date(data2);
        const diff = Math.abs(d2 - d1);
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    } catch (e) {
        return 0;
    }
}

export function validarData(dataStr) {
    if (!dataStr) return false;
    try {
        const data = new Date(dataStr + 'T00:00:00');
        return !isNaN(data.getTime());
    } catch (e) {
        return false;
    }
}

export function obterDiaSemana(dataStr) {
    if (!dataStr) return -1;
    try {
        const data = new Date(dataStr + 'T00:00:00');
        if (isNaN(data.getTime())) return -1;
        return data.getDay();
    } catch (e) {
        return -1;
    }
}

export function obterNomeDiaSemana(dataStr) {
    if (!dataStr) return '';
    try {
        const data = new Date(dataStr + 'T00:00:00');
        if (isNaN(data.getTime())) return '';
        const dias = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        return dias[data.getDay()];
    } catch (e) {
        return '';
    }
}

export function obterDiaSemanaAbreviado(dataStr) {
    if (!dataStr) return '';
    try {
        const data = new Date(dataStr + 'T00:00:00');
        if (isNaN(data.getTime())) return '';
        const dias = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
        return dias[data.getDay()];
    } catch (e) {
        return '';
    }
}

export function mesAnoToString(mes, ano) {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${meses[mes]} ${ano}`;
}

export function obterNomeMes(index) {
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                   'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return meses[index] || 'Mês inválido';
}

export function ehMesmoDia(data1, data2) {
    try {
        const d1 = new Date(data1);
        const d2 = new Date(data2);
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    } catch (e) {
        return false;
    }
}

export function compararDatas(data1, data2) {
    try {
        const d1 = new Date(data1);
        const d2 = new Date(data2);
        if (d1 < d2) return -1;
        if (d1 > d2) return 1;
        return 0;
    } catch (e) {
        return 0;
    }
}