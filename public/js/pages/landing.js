// public/js/pages/landing.js

export function renderLandingPage() {
    return `
        <div class="hero-section">
            <div class="hero-content">
                <h1 class="hero-title">Bem-vindo à OLIMCAR 2026</h1>
                <p class="hero-subtitle">Acompanhe os resultados, veja o quadro de medalhas e vibre pela sua equipe na maior competição esportiva da empresa.</p>
                <div class="hero-actions">
                    <a href="#/agenda" class="btn btn-hero">
                        <i data-lucide="calendar"></i> Ver Agenda
                    </a>
                    <a href="#/ranking" class="btn btn-outline" style="color: white; border-color: rgba(255,255,255,0.5);">
                        <i data-lucide="medal"></i> Quadro de Medalhas
                    </a>
                </div>
            </div>
        </div>

        <div class="container">
            <h2 class="section-title">Modalidades em Disputa</h2>
            
            <div class="modalidades-grid">
                <div class="modalidade-card">
                    <div class="mod-icon">⚽</div>
                    <h3 class="mod-title">Futebol Society</h3>
                    <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-top: 0.5rem;">Masculino e Feminino</p>
                </div>
                <div class="modalidade-card">
                    <div class="mod-icon">🏐</div>
                    <h3 class="mod-title">Voleibol</h3>
                    <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-top: 0.5rem;">Equipes Mistas</p>
                </div>
                <div class="modalidade-card">
                    <div class="mod-icon">🏀</div>
                    <h3 class="mod-title">Basquetebol</h3>
                    <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-top: 0.5rem;">Livre</p>
                </div>
                <div class="modalidade-card">
                    <div class="mod-icon">🏊</div>
                    <h3 class="mod-title">Natação</h3>
                    <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-top: 0.5rem;">100m Livre</p>
                </div>
            </div>

            <h2 class="section-title">Resultados Recentes</h2>
            
            <div class="glass-panel">
                <div class="table-container" style="box-shadow: none; border: none; background: transparent;">
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Modalidade</th>
                                <th>Time A</th>
                                <th style="text-align: center;">Placar</th>
                                <th>Time B</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Hoje, 10:00</td>
                                <td>Futebol Society</td>
                                <td style="font-weight: 600;">Tigres do Vale</td>
                                <td style="text-align: center; font-size: 1.25rem; font-weight: 800; color: var(--color-primary-600);">3 x 1</td>
                                <td>Dragões de Fogo</td>
                                <td><span class="badge badge-success">Encerrado</span></td>
                            </tr>
                            <tr>
                                <td>Ontem, 16:30</td>
                                <td>Voleibol</td>
                                <td>Leões Dourados</td>
                                <td style="text-align: center; font-size: 1.25rem; font-weight: 800; color: var(--color-primary-600);">2 x 3</td>
                                <td style="font-weight: 600;">Águias Livres</td>
                                <td><span class="badge badge-success">Encerrado</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div style="text-align: center; margin-top: 2rem;">
                    <a href="#/resultados" class="btn btn-outline">Ver todos os resultados</a>
                </div>
            </div>
        </div>
    `;
}
