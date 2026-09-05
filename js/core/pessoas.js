// =====================================================
// PESSOAS - CRUD de funcionários
// =====================================================

import { carregarPessoasStorage, salvarPessoasStorage } from '../utils/storage.js';
import { mostrarToast } from '../utils/helpers.js';

let pessoas = [];
let equipeSelecionada = null;
let atualizarContadoresCallback = null;

export function initPessoas(equipe, callback) {
    equipeSelecionada = equipe;
    atualizarContadoresCallback = callback;
    pessoas = carregarPessoasStorage();
    console.log('✅ Pessoas inicializadas:', pessoas.length);
}

export function getPessoas() {
    // 🔥 Garantir que sempre retorna os dados mais recentes
    if (pessoas.length === 0) {
        pessoas = carregarPessoasStorage();
    }
    return pessoas;
}

export function getPessoasPorEscala(escalaId) {
    const todas = getPessoas();
    return todas.filter(p => p.escalaId === escalaId);
}

export function getPessoaPorId(id) {
    const todas = getPessoas();
    return todas.find(p => p.id === id);
}

export function salvarPessoa(nome, contato, escalaId, turno, editando) {
    if (!nome) {
        mostrarToast('❌ Digite o nome do funcionário!', 'erro');
        return false;
    }

    // Verificar duplicado
    const duplicado = pessoas.find(p => p.nome.toLowerCase() === nome.toLowerCase() && p.escalaId === escalaId);
    if (duplicado && !editando) {
        mostrarToast('⚠️ Funcionário já cadastrado nesta escala!', 'erro');
        return false;
    }

    if (editando) {
        const index = pessoas.findIndex(p => p.id === parseInt(editando));
        if (index !== -1) {
            pessoas[index] = {
                ...pessoas[index],
                nome: nome,
                contato: contato,
                escalaId: escalaId,
                turno: turno
            };
        }
        mostrarToast('✅ Funcionário atualizado com sucesso!', 'sucesso');
    } else {
        const novaPessoa = {
            id: Date.now(),
            nome: nome,
            contato: contato,
            escalaId: escalaId,
            turno: turno
        };
        pessoas.push(novaPessoa);
        mostrarToast('✅ Funcionário cadastrado com sucesso!', 'sucesso');
    }

    salvarPessoasStorage(pessoas);
    if (atualizarContadoresCallback) atualizarContadoresCallback();
    return true;
}

export function removerPessoa(id) {
    if (confirm('Tem certeza que deseja remover este funcionário?')) {
        pessoas = pessoas.filter(p => p.id !== id);
        salvarPessoasStorage(pessoas);
        if (atualizarContadoresCallback) atualizarContadoresCallback();
        mostrarToast('🗑️ Funcionário removido', 'info');
        return true;
    }
    return false;
}

// 🔥 Função para recarregar os dados do storage
export function recarregarPessoas() {
    pessoas = carregarPessoasStorage();
    if (atualizarContadoresCallback) atualizarContadoresCallback();
    return pessoas;
}