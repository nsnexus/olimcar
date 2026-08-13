// public/js/pages/landing.js

export function renderLandingPage() {
    return `
        <!-- Hero Section Premium -->
        <section class="hero-section">
            <video id="hero-video" class="hero-video-bg" autoplay muted loop playsinline preload="auto" disablepictureinpicture disableremoteplayback controlslist="nodownload noremoteplayback nofullscreen" style="cursor: pointer;" title="Olimcar">
                <source src="/assets/video/new_hero.mp4" type="video/mp4">
            </video>
            
            <div class="hero-overlay">
                <div class="hero-content container">
                    <div class="hero-logo-wrapper">
                        <img src="/assets/logo-transparent.png" alt="Olimcar Logo" class="hero-logo">
                    </div>
                    <div class="hero-countdown-wrapper">
                        <p class="hero-countdown-label">Os jogos começam em:</p>
                        <div class="hero-countdown" id="hero-countdown">
                            <div class="countdown-item"><span id="cd-days">00</span><small>Dias</small></div>
                            <div class="countdown-separator">:</div>
                            <div class="countdown-item"><span id="cd-hours">00</span><small>Horas</small></div>
                            <div class="countdown-separator">:</div>
                            <div class="countdown-item"><span id="cd-minutes">00</span><small>Min</small></div>
                            <div class="countdown-separator">:</div>
                            <div class="countdown-item"><span id="cd-seconds">00</span><small>Seg</small></div>
                        </div>
                        <p class="hero-countdown-date">19 de Setembro de 2026 às 08:00</p>
                    </div>
                </div>
            </div>
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
