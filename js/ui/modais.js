// =====================================================
// MODAIS - Gerenciamento de Janelas Modais
// =====================================================

import { getPessoas } from '../core/pessoas.js';

let modalPessoaCallback = null;

export function initModais(callback) {
    modalPessoaCallback = callback;
}

export function abrirModalPessoa(pessoaId = null) {
    const modal = document.getElementById('modalPessoa');
    if (!modal) {
        console.error('❌ Modal pessoa não encontrado!');
        return;
    }
    modal.classList.add('ativo');

    const inputNome = document.getElementById('inputNomePessoa');
    const inputContato = document.getElementById('inputContatoPessoa');
    const inputEscala = document.getElementById('inputEscalaPessoa');
    const inputTurno = document.getElementById('inputTurnoPessoa');
    const titulo = document.getElementById('modalPessoaTitulo');
    const subtitulo = document.getElementById('modalPessoaSubtitulo');

    if (pessoaId) {
        const pessoas = getPessoas();
        const pessoa = pessoas.find(p => p.id === pessoaId || p.id === String(pessoaId));
        if (pessoa) {
            if (inputNome) inputNome.value = pessoa.nome;
            if (inputContato) inputContato.value = pessoa.contato || '';
            if (inputEscala) inputEscala.value = pessoa.escalaId;
            if (inputTurno) inputTurno.value = pessoa.turno;
            if (titulo) titulo.textContent = '✏️ Editar Funcionário';
            if (subtitulo) subtitulo.textContent = 'Edite os dados do funcionário';
            modal.dataset.editando = pessoaId;
        }
    } else {
        if (inputNome) inputNome.value = '';
        if (inputContato) inputContato.value = '';
        if (inputEscala) inputEscala.value = '1';
        if (inputTurno) inputTurno.value = 'M';
        if (titulo) titulo.textContent = '👤 Cadastrar Funcionário';
        if (subtitulo) subtitulo.textContent = 'Vincule o funcionário à escala e turno';
        modal.dataset.editando = '';
    }
}

export function fecharModalPessoa() {
    const modal = document.getElementById('modalPessoa');
    if (modal) modal.classList.remove('ativo');
}

export function abrirModalExtra() {
    const modal = document.getElementById('modalExtra');
    if (!modal) {
        console.error('❌ Modal extra não encontrado!');
        return;
    }
    modal.classList.add('ativo');

    const hoje = new Date();
    const inputData = document.getElementById('inputDataExtra');
    if (inputData) {
        inputData.value = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;
    }
    const inputInicio = document.getElementById('inputInicioExtra');
    if (inputInicio) inputInicio.value = '08:00';
    const inputFim = document.getElementById('inputFimExtra');
    if (inputFim) inputFim.value = '18:00';
}

export function fecharModalExtra() {
    const modal = document.getElementById('modalExtra');
    if (modal) modal.classList.remove('ativo');
}