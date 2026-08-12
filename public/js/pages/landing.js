// public/js/pages/landing.js

export function renderLandingPage() {
    return `
        <!-- Hero Section Premium -->
        <section class="hero-section">
            <div class="container hero-content">
                <img src="/assets/logo.png" alt="Olimcar Animais" class="hero-logo-img">
                <p class="hero-subtitle">Acompanhe os resultados, veja o quadro de medalhas e vibre pela sua equipe na maior competição esportiva da empresa.</p>
                
                <div class="hero-buttons">
                    <a href="#/agenda" class="btn btn-primary" style="font-size: 1.1rem; padding: 1rem 2rem; border-radius: 50px;">Ver Agenda Completa</a>
                </div>
            </div>
        </section>

        <section class="features-section">
            <div class="container">
                <div class="features-header">
                    <h2>Modalidades em Disputa</h2>
                    <p style="color: var(--color-text-muted); font-size: 1.1rem;">As categorias oficiais das nossas olimpíadas</p>
                </div>
                
                <div class="features-grid">
                    
                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_futebol.png" class="feature-img" alt="Futebol"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Futebol & Futsal</h3>
                            <p class="feature-desc">Campo, Society e Salão. Times vibrando em campo.</p>
                        </div>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_volei.png" class="feature-img" alt="Voleibol"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Voleibol & Areia</h3>
                            <p class="feature-desc">Cortadas na quadra e futevôlei na areia.</p>
                        </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_basquete.png" class="feature-img" alt="Basquete"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Basquetebol</h3>
                            <p class="feature-desc">As tradicionais disputas em trio na quadra externa.</p>
                        </div>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_atletismo.png" class="feature-img" alt="Atletismo"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Atletismo</h3>
                            <p class="feature-desc">Corridas de 100m, 400m e grandes revezamentos.</p>
                        </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_natacao.png" class="feature-img" alt="Natação"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Natação</h3>
                            <p class="feature-desc">Baterias intensas na piscina, estilo livre e misto.</p>
                        </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_tenis.png" class="feature-img" alt="Tênis"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Tênis de Quadra</h3>
                            <p class="feature-desc">Tênis tradicional e Beach Tênis masculino e feminino.</p>
                        </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_handebol.png" class="feature-img" alt="Handebol"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Handebol</h3>
                            <p class="feature-desc">As disputas mais elétricas no ginásio esportivo.</p>
                        </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_ciclismo.png" class="feature-img" alt="Ciclismo"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Ciclismo M.T.B.</h3>
                            <p class="feature-desc">Provas de resistência e velocidade no circuito de trilha.</p>
                        </div>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_peteca.png" class="feature-img" alt="Peteca"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Peteca</h3>
                            <p class="feature-desc">O esporte raiz nas quadras externas da empresa.</p>
                        </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_salao.png" class="feature-img" alt="Jogos de Salão"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Jogos de Salão</h3>
                            <p class="feature-desc">Sinuca, Truco, Dominó, Dama e Xadrez.</p>
                        </div>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_esports.png" class="feature-img" alt="E-Sports"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">E-Sports</h3>
                            <p class="feature-desc">Disputas acirradas nos videogames de última geração.</p>
                        </div>
                    </div>

                </div>
            </div>
        </section>

        <div class="container">
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
