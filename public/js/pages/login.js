// public/js/pages/login.js
export function renderLoginPage() {
    return `
        <div class="container" style="display: flex; justify-content: center; align-items: center; min-height: 70vh;">
            <div class="card" style="width: 100%; max-width: 400px; padding: 2rem;">
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div class="logo" style="justify-content: center; margin-bottom: 1rem;">
                        <img src="/assets/logo.png" alt="OLIMCAR Logo" class="logo-img" style="height: 60px;">
                    </div>
                    <h2 style="font-size: 1.5rem; color: var(--color-text-main);">Acesse sua conta</h2>
                    <p style="color: var(--color-text-muted); font-size: 0.9rem;">Painel Administrativo e Arbitragem</p>
                </div>
                
                <form id="login-form">
                    <div class="form-group">
                        <label class="form-label" for="email">E-mail Corporativo</label>
                        <input type="email" id="email" class="form-control" placeholder="nome@empresa.com" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label" for="password">Senha</label>
                        <input type="password" id="password" class="form-control" placeholder="••••••••" required>
                    </div>
                    
                    <div id="login-error" style="color: var(--color-danger); font-size: 0.85rem; margin-bottom: 1rem; display: none;">
                        Credenciais inválidas. Tente novamente.
                    </div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 0.75rem;" id="btn-submit">
                        Entrar no Sistema
                    </button>
                </form>
                
                <div style="margin-top: 1.5rem; text-align: center; font-size: 0.85rem; color: var(--color-text-muted);">
                    Não possui acesso? Procure o RH ou o administrador do torneio.
                </div>
            </div>
        </div>
    `;
}
