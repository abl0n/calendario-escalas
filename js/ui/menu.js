// =====================================================
// MENU - Alternância do Menu Lateral
// =====================================================

export function toggleMenu() {
    const menu = document.getElementById('menuLateral');
    const overlay = document.getElementById('menuOverlay');
    if (menu) menu.classList.toggle('aberto');
    if (overlay) overlay.classList.toggle('ativo');
}

export function fecharMenu() {
    const menu = document.getElementById('menuLateral');
    const overlay = document.getElementById('menuOverlay');
    if (menu) menu.classList.remove('aberto');
    if (overlay) overlay.classList.remove('ativo');
}