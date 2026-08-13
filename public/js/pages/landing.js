// public/js/pages/landing.js

export function renderLandingPage() {
    return `
        <!-- Hero Section Premium -->
        <section class="hero-section">
            <video id="hero-video" class="hero-video-bg" playsinline preload="auto" disablepictureinpicture disableremoteplayback controlslist="nodownload noremoteplayback nofullscreen">
                <source src="/assets/video/hero.mp4" type="video/mp4">
            </video>
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
                            </div>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_volei.png" class="feature-img" alt="Voleibol"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Vôlei</h3>
                            </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_basquete.png" class="feature-img" alt="Basquete"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Basquetebol</h3>
                            </div>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_atletismo.png" class="feature-img" alt="Atletismo"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Atletismo</h3>
                            </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_natacao.png" class="feature-img" alt="Natação"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Natação</h3>
                            </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_tenis.png" class="feature-img" alt="Tênis"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Beach Tênis</h3>
                            </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_handebol.png" class="feature-img" alt="Handebol"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Handebol</h3>
                            </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_ciclismo.png" class="feature-img" alt="Ciclismo"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Ciclismo</h3>
                            </div>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_peteca.png" class="feature-img" alt="Peteca"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Peteca</h3>
                            </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_salao.png" class="feature-img" alt="Jogos de Salão"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">Jogos de Salão</h3>
                            </div>
                    </div>
                    
                    <div class="feature-card">
                        <div class="feature-img-wrapper"><img src="/assets/art/mod_esports.png" class="feature-img" alt="FIFA"></div>
                        <div class="feature-content">
                            <h3 class="feature-title">FIFA</h3>
                            </div>
                    </div>

                </div>
            </div>
        </section>

        <div class="container">
            </div>

        </div>
    `;
}
