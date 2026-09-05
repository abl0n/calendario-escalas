// =====================================================
// POPUPS - Exibição de Listagens e Filtros Flutuantes
// =====================================================

import { getPessoas } from '../core/pessoas.js';
import { mostrarToast } from '../utils/helpers.js';

let equipeSelecionada = null;

export function initPopups(equipe) {
    equipeSelecionada = equipe;
}

export function atualizarEquipePopup(equipe) {
    equipeSelecionada = equipe;
}

export function abrirPopup(tipo) {
    const overlay = document.getElementById('popupOverlay') || document.getElementById('popupGenerico');
    const titulo = document.getElementById('popupTitulo');
    const conteudo = document.getElementById('popupConteudo');
    const total = document.getElementById('popupTotal');

    if (!overlay) {
        console.error('❌ Elemento overlay do popup não encontrado!');
        return;
    }

    if (!equipeSelecionada) {
        mostrarToast('❌ Nenhuma escala selecionada!', 'erro');
        return;
    }

    const todasPessoas = getPessoas();
    const escalaAtual = equipeSelecionada.id;

    let pessoasFiltradas = todasPessoas.filter(p => Number(p.escalaId) === Number(escalaAtual));
    let tituloTexto = '';
    let turnoLabel = '';
    let corDestaque = '';

    if (tipo === 'total') {
        tituloTexto = `👥 Todos os Funcionários - Escala ${escalaAtual}`;
        turnoLabel = 'Todos';
        corDestaque = '#3B82F6';
    } else if (tipo === 'M') {
        pessoasFiltradas = pessoasFiltradas.filter(p => p.turno === 'M');
        tituloTexto = `☀️ Manhã - Escala ${escalaAtual}`;
        turnoLabel = 'Manhã';
        corDestaque = '#F59E0B';
    } else if (tipo === 'T') {
        pessoasFiltradas = pessoasFiltradas.filter(p => p.turno === 'T');
        tituloTexto = `🌆 Tarde - Escala ${escalaAtual}`;
        turnoLabel = 'Tarde';
        corDestaque = '#EA580C';
    } else if (tipo === 'N') {
        pessoasFiltradas = pessoasFiltradas.filter(p => p.turno === 'N');
        tituloTexto = `🌙 Noite - Escala ${escalaAtual}`;
        turnoLabel = 'Noite';
        corDestaque = '#4F46E5';
    } else {
        mostrarToast('❌ Tipo de filtro inválido!', 'erro');
        return;
    }

    if (titulo) titulo.textContent = tituloTexto;

    pessoasFiltradas.sort((a, b) => a.nome.localeCompare(b.nome));

    if (conteudo) {
        if (pessoasFiltradas.length === 0) {
            conteudo.innerHTML = `
                <div style="text-align:center; padding: 40px 20px; color: var(--color-text-muted, #64748b);">
                    <span class="material-icons" style="font-size:48px; opacity:0.3;">people</span>
                    <p style="margin-top:12px; font-size:0.95rem;">
                        ${tipo === 'total' ? 'Nenhum funcionário cadastrado nesta escala.' : `Nenhum funcionário no turno ${turnoLabel}.`}
                    </p>
                    <small style="font-size:0.75rem;">Clique em "Cadastrar Funcionário" no menu para adicionar.</small>
                </div>
            `;
        } else {
            const turnosLabels = {
                'M': 'E' + escalaAtual + '-M',
                'T': 'E' + escalaAtual + '-T',
                'N': 'E' + escalaAtual + '-N'
            };

            const coresTurnos = {
                'M': { bg: '#FEF3C7', text: '#92400E', badge: '#F59E0B' },
                'T': { bg: '#FFEDD5', text: '#7C2D12', badge: '#EA580C' },
                'N': { bg: '#E0E7FF', text: '#1E1B4B', badge: '#4F46E5' }
            };

            let html = `
                <div style="display:flex; flex-direction:column; gap:8px;">
            `;
            
            pessoasFiltradas.forEach(p => {
                const badge = turnosLabels[p.turno] || p.turno;
                const cores = coresTurnos[p.turno] || coresTurnos['M'];
                
                html += `
                    <div style="
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        padding: 12px 16px;
                        background: var(--color-bg, #f8fafc);
                        border-radius: 10px;
                        border-left: 4px solid ${cores.badge};
                        transition: all 0.2s ease;
                    ">
                        <div style="display:flex; flex-direction:column; gap:2px; flex:1; min-width:0;">
                            <span style="font-weight:600; font-size:0.95rem; color: var(--color-text, #1e293b);">
                                ${p.nome}
                            </span>
                            ${p.contato ? `<span style="font-size:0.75rem; color: var(--color-text-muted, #64748b);">
                                <span class="material-icons" style="font-size:14px; vertical-align:middle;">phone</span>
                                ${p.contato}
                            </span>` : ''}
                        </div>
                        <div style="display:flex; align-items:center; gap:10px; flex-shrink:0;">
                            <span style="
                                font-size:0.65rem;
                                font-weight:700;
                                padding:2px 12px;
                                border-radius:20px;
                                background: ${cores.bg};
                                color: ${cores.text};
                            ">${badge}</span>
                            <div style="display:flex; gap:4px;">
                                <button onclick="window.editarFuncionario('${p.id}')" 
                                    style="
                                        background: none;
                                        border: none;
                                        cursor: pointer;
                                        padding: 4px 8px;
                                        border-radius: 6px;
                                        color: var(--color-primary, #3B82F6);
                                        transition: background 0.2s;
                                    "
                                    onmouseenter="this.style.background='var(--color-bg, #f1f5f9)'"
                                    onmouseleave="this.style.background='transparent'"
                                    title="Editar">
                                    <span class="material-icons" style="font-size:18px;">edit</span>
                                </button>
                                <button onclick="window.removerPessoa('${p.id}')" 
                                    style="
                                        background: none;
                                        border: none;
                                        cursor: pointer;
                                        padding: 4px 8px;
                                        border-radius: 6px;
                                        color: #EF4444;
                                        transition: background 0.2s;
                                    "
                                    onmouseenter="this.style.background='#FEE2E2'"
                                    onmouseleave="this.style.background='transparent'"
                                    title="Excluir">
                                    <span class="material-icons" style="font-size:18px;">delete</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += `
                </div>
                <div style="
                    margin-top: 16px;
                    padding: 12px 16px;
                    background: var(--color-primary, #3B82F6);
                    border-radius: 10px;
                    color: white;
                    text-align: center;
                    font-weight: 600;
                    font-size: 0.9rem;
                ">
                    Total: ${pessoasFiltradas.length} funcionário${pessoasFiltradas.length > 1 ? 's' : ''}
                </div>
            `;
            conteudo.innerHTML = html;
        }
    }

    if (total) total.textContent = `Total: ${pessoasFiltradas.length}`;
    overlay.classList.add('ativo');
}

export function fecharPopup() {
    const overlay = document.getElementById('popupOverlay') || document.getElementById('popupGenerico');
    if (overlay) {
        overlay.classList.remove('ativo');
    }
}