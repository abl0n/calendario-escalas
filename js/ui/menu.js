// =====================================================
// MENU - Alternância do Menu Lateral
// =====================================================

export function toggleMenu() {
    const menu = document.getElementById('menuLateral');
    const overlay = document.getElementById('menuOverlay');
    
    if (!menu || !overlay) {
        console.error('❌ Menu ou overlay não encontrados!');
        return;
    }
    
    menu.classList.toggle('ativo');
    overlay.classList.toggle('ativo');
    
    // 🔥 Forçar reflow para animação suave
    void menu.offsetWidth;
}

export function fecharMenu() {
    const menu = document.getElementById('menuLateral');
    const overlay = document.getElementById('menuOverlay');
    
    if (menu) menu.classList.remove('ativo');
    if (overlay) overlay.classList.remove('ativo');
}