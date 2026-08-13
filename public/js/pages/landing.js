// public/js/pages/landing.js

export function renderLandingPage() {
    return `
        <!-- Hero Section Premium -->
        <section class="hero-section">
            <video id="hero-video" class="hero-video-bg" autoplay muted playsinline preload="auto" disablepictureinpicture disableremoteplayback controlslist="nodownload noremoteplayback nofullscreen" style="cursor: pointer;" title="Clique para reproduzir novamente">
                <source src="/assets/video/hero.mp4" type="video/mp4">
            </video>
        </section>

        <div class="led-divider-wrapper">
            <div class="led-divider"></div>
        </div>

        <section class="features-section">
            <div class="container">
                <div class="features-header">
                    <h2>Modalidades em Disputa</h2>
                    <p style="color: var(--color-text-muted); font-size: 1.1rem;">As categorias oficiais das nossas olimpíadas</p>
                </div>
            </div>
            
            <div class="carousel-wrapper">
                <div class="carousel-track">
                    <!-- Grupo 1 -->
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_futebol.png" class="feature-img" alt="Futebol"></div><div class="feature-content"><h3 class="feature-title">Futebol & Futsal</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_volei.png" class="feature-img" alt="Voleibol"></div><div class="feature-content"><h3 class="feature-title">Vôlei</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_basquete.png" class="feature-img" alt="Basquete"></div><div class="feature-content"><h3 class="feature-title">Basquetebol</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_atletismo.png" class="feature-img" alt="Atletismo"></div><div class="feature-content"><h3 class="feature-title">Atletismo</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_natacao.png" class="feature-img" alt="Natação"></div><div class="feature-content"><h3 class="feature-title">Natação</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_tenis.png" class="feature-img" alt="Tênis"></div><div class="feature-content"><h3 class="feature-title">Beach Tênis</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_handebol.png" class="feature-img" alt="Handebol"></div><div class="feature-content"><h3 class="feature-title">Handebol</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_ciclismo.png" class="feature-img" alt="Ciclismo"></div><div class="feature-content"><h3 class="feature-title">Ciclismo</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_peteca.png" class="feature-img" alt="Peteca"></div><div class="feature-content"><h3 class="feature-title">Peteca</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_salao.png" class="feature-img" alt="Jogos de Salão"></div><div class="feature-content"><h3 class="feature-title">Jogos de Salão</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_esports.png" class="feature-img" alt="FIFA"></div><div class="feature-content"><h3 class="feature-title">FIFA</h3></div></div>

                    <!-- Grupo 2 (Cópia para o scroll infinito) -->
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_futebol.png" class="feature-img" alt="Futebol"></div><div class="feature-content"><h3 class="feature-title">Futebol & Futsal</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_volei.png" class="feature-img" alt="Voleibol"></div><div class="feature-content"><h3 class="feature-title">Vôlei</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_basquete.png" class="feature-img" alt="Basquete"></div><div class="feature-content"><h3 class="feature-title">Basquetebol</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_atletismo.png" class="feature-img" alt="Atletismo"></div><div class="feature-content"><h3 class="feature-title">Atletismo</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_natacao.png" class="feature-img" alt="Natação"></div><div class="feature-content"><h3 class="feature-title">Natação</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_tenis.png" class="feature-img" alt="Tênis"></div><div class="feature-content"><h3 class="feature-title">Beach Tênis</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_handebol.png" class="feature-img" alt="Handebol"></div><div class="feature-content"><h3 class="feature-title">Handebol</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_ciclismo.png" class="feature-img" alt="Ciclismo"></div><div class="feature-content"><h3 class="feature-title">Ciclismo</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_peteca.png" class="feature-img" alt="Peteca"></div><div class="feature-content"><h3 class="feature-title">Peteca</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_salao.png" class="feature-img" alt="Jogos de Salão"></div><div class="feature-content"><h3 class="feature-title">Jogos de Salão</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/art/mod_esports.png" class="feature-img" alt="FIFA"></div><div class="feature-content"><h3 class="feature-title">FIFA</h3></div></div>
                </div>
            </div>
        </section>

        <section class="cta-section">
            <div class="container" style="text-align: center;">
                <h2>Mais que uma competição.<br><span>Uma celebração.</span></h2>
                <p class="cta-text">
                   A Olimcar nasceu da crença de que o esporte transforma. 
                   Ele une equipes, fortalece vínculos e revela talentos que 
                   o dia a dia não mostra. Cada modalidade é uma chance de 
                   superar limites, fazer amigos e criar memórias.
                </p>
                <p class="cta-highlight">
                   Sua equipe conta com você. Vista a camisa. Entre em campo.
                </p>
                <a href="#/agenda" class="btn btn-primary" style="font-size: 1.1rem; padding: 0.85rem 2rem; border-radius: var(--radius-md);">Ver Agenda e Participar</a>
            </div>
        </section>
    `;
}
