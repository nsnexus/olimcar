// public/js/pages/landing.js

export function renderLandingPage() {
    return `
        <!-- ===================== HERO ===================== -->
        <section class="hero">
            <!-- camadas de fundo -->
            <video id="hero-video" class="hero__bg" autoplay muted loop playsinline preload="auto" disablepictureinpicture disableremoteplayback controlslist="nodownload noremoteplayback nofullscreen" style="cursor: pointer; object-fit: cover;" title="Olimcar">
                <source src="/assets/video/new_hero.mp4" type="video/mp4">
            </video>
            <div class="hero__overlay"></div>
            <div class="hero__aurora"></div>
            <div class="hero__grid"></div>
            <!-- folhas flutuantes -->
            <div class="leaves" id="leaves"></div>

            <div class="hero__content">
            <!-- COLUNA ESQUERDA -->
            <div class="hero__left">
                <span class="hero__badge">
                <span class="hero__badge-dot"></span>
                EDIÇÃO OFICIAL · CARAJÁS
                </span>

                <h1 class="hero__title">
                <span class="hero__title-main">OLIMCAR</span>
                <span class="hero__title-year">2026</span>
                </h1>

                <div class="hero__rings">
                <span class="ring ring--blue"></span>
                <span class="ring ring--yellow"></span>
                <span class="ring ring--black"></span>
                <span class="ring ring--green"></span>
                <span class="ring ring--red"></span>
                </div>

                <p class="hero__subtitle">
                A grande olimpíada corporativa da floresta. Força, união e superação
                no coração da Amazônia. <strong>Sua equipe está pronta?</strong>
                </p>

                <div class="hero__actions">
                <a href="#/agenda" class="hero__btn hero__btn--primary">
                    Ver Agenda
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </a>
                <button type="button" class="hero__btn hero__btn--ghost" id="btn-teaser">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
                    Assistir teaser
                </button>
                </div>

                <div class="hero__stats">
                <div class="stat"><span class="stat__num">12</span><span class="stat__label">Equipes</span></div>
                <div class="stat__divider"></div>
                <div class="stat"><span class="stat__num">28</span><span class="stat__label">Modalidades</span></div>
                <div class="stat__divider"></div>
                <div class="stat"><span class="stat__num">+500</span><span class="stat__label">Atletas</span></div>
                </div>
            </div>

            <!-- COLUNA DIREITA - COUNTDOWN -->
            <div class="hero__right">
                <div class="countdown-card">
                <div class="countdown-card__glow"></div>
                <div class="countdown-card__header">
                    <span class="live-tag"><span class="live-tag__pulse"></span>EM CONTAGEM</span>
                    <h2 class="countdown-card__title">Os jogos começam em</h2>
                </div>

                <div class="countdown" id="countdown">
                    <div class="cd-unit">
                    <div class="cd-unit__box"><span id="cd-days">00</span></div>
                    <span class="cd-unit__label">Dias</span>
                    </div>
                    <span class="cd-sep">:</span>
                    <div class="cd-unit">
                    <div class="cd-unit__box"><span id="cd-hours">00</span></div>
                    <span class="cd-unit__label">Horas</span>
                    </div>
                    <span class="cd-sep">:</span>
                    <div class="cd-unit">
                    <div class="cd-unit__box"><span id="cd-mins">00</span></div>
                    <span class="cd-unit__label">Min</span>
                    </div>
                    <span class="cd-sep">:</span>
                    <div class="cd-unit">
                    <div class="cd-unit__box"><span id="cd-secs">00</span></div>
                    <span class="cd-unit__label">Seg</span>
                    </div>
                </div>

                <div class="countdown-card__footer">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="2.5" stroke="currentColor" stroke-width="1.8"/><path d="M3 9h18M8 2v4M16 2v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
                    <span>19 de Setembro de 2026 · 08:00</span>
                </div>

                <div class="progress">
                    <div class="progress__bar" id="progressBar"></div>
                </div>
                </div>
            </div>
            </div>

            <!-- indicador de scroll -->
            <div class="scroll-cue">
            <span>Explore</span>
            <div class="scroll-cue__mouse"><span></span></div>
            </div>
        </section>

        <!-- MODAL TEASER -->
        <div class="teaser-modal" id="teaser-modal">
            <div class="teaser-modal__content">
                <button type="button" class="teaser-modal__close" id="teaser-close">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    Fechar
                </button>
                <video id="teaser-video" width="100%" height="100%" controls style="object-fit: cover;">
                    <source src="/assets/video/hero.mp4" type="video/mp4">
                </video>
            </div>
        </div>

        <!-- ===================== AGENDA HOME SECTION ===================== -->
        <section class="agenda-home-section">
            <div class="container">
                <div class="agenda-home-header">
                    <div class="agenda-home-title-area">
                        <span class="hero__badge" style="margin-bottom: 16px;">
                            <span class="hero__badge-dot"></span>
                            PROGRAMAÇÃO
                        </span>
                        <h2 class="agenda-home-title">Agenda dos Jogos</h2>
                    </div>
                    <a href="#/agenda" class="hero__btn hero__btn--ghost" style="border-radius: 12px; padding: 12px 24px;">
                        Ver agenda completa 
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="margin-left: 8px;"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </a>
                </div>

                <div class="agenda-home-grid">
                    <!-- 19 SET -->
                    <div class="agenda-day-card">
                        <div class="agenda-day-header">
                            <div>
                                <div class="agenda-day-date"><span class="agenda-day-num">19</span> SET</div>
                                <div class="agenda-day-weekday">Sexta-feira</div>
                            </div>
                            <span class="agenda-day-badge" style="color: var(--yellow); border-color: rgba(236, 177, 31, 0.3);">ABERTURA</span>
                        </div>
                        <div class="agenda-day-divider"></div>
                        <ul class="agenda-event-list">
                            <li><span class="agenda-time">08h</span> <span class="agenda-event">Abertura oficial</span></li>
                            <li><span class="agenda-time">10:30</span> <span class="agenda-event">Início dos jogos</span></li>
                            <li><span class="agenda-time highlight">13h</span> <span class="agenda-event highlight"><i data-lucide="music" style="width: 16px; height: 16px;"></i> Felipe de Lucaa</span></li>
                            <li><span class="agenda-time">21h</span> <span class="agenda-event">Encerramento</span></li>
                        </ul>
                    </div>

                    <!-- 20 SET -->
                    <div class="agenda-day-card">
                        <div class="agenda-day-header">
                            <div>
                                <div class="agenda-day-date"><span class="agenda-day-num">20</span> SET</div>
                                <div class="agenda-day-weekday">Sábado</div>
                            </div>
                            <span class="agenda-day-badge" style="color: var(--yellow); border-color: rgba(236, 177, 31, 0.3);">DIA 2</span>
                        </div>
                        <div class="agenda-day-divider"></div>
                        <ul class="agenda-event-list">
                            <li><span class="agenda-time">08h</span> <span class="agenda-event">Abertura</span></li>
                            <li><span class="agenda-time highlight">13h</span> <span class="agenda-event highlight"><i data-lucide="music" style="width: 16px; height: 16px;"></i> Voz e Violão</span></li>
                            <li><span class="agenda-time">20h</span> <span class="agenda-event">Encerramento</span></li>
                        </ul>
                    </div>

                    <!-- 26 SET -->
                    <div class="agenda-day-card">
                        <div class="agenda-day-header">
                            <div>
                                <div class="agenda-day-date"><span class="agenda-day-num">26</span> SET</div>
                                <div class="agenda-day-weekday">Sexta-feira</div>
                            </div>
                            <span class="agenda-day-badge" style="color: var(--yellow); border-color: rgba(236, 177, 31, 0.3);">DIA 3</span>
                        </div>
                        <div class="agenda-day-divider"></div>
                        <ul class="agenda-event-list">
                            <li><span class="agenda-time">08h</span> <span class="agenda-event">Abertura</span></li>
                            <li><span class="agenda-time highlight">13h</span> <span class="agenda-event highlight"><i data-lucide="music" style="width: 16px; height: 16px;"></i> Nilde Campelo</span></li>
                            <li><span class="agenda-time">21h</span> <span class="agenda-event">Encerramento</span></li>
                        </ul>
                    </div>

                    <!-- 27 SET -->
                    <div class="agenda-day-card">
                        <div class="agenda-day-header">
                            <div>
                                <div class="agenda-day-date"><span class="agenda-day-num">27</span> SET</div>
                                <div class="agenda-day-weekday">Sábado</div>
                            </div>
                            <span class="agenda-day-badge" style="color: var(--yellow); border-color: rgba(236, 177, 31, 0.3);">FINAL</span>
                        </div>
                        <div class="agenda-day-divider"></div>
                        <ul class="agenda-event-list">
                            <li><span class="agenda-time">08h</span> <span class="agenda-event">Abertura</span></li>
                            <li><span class="agenda-time highlight">12h</span> <span class="agenda-event highlight"><i data-lucide="music" style="width: 16px; height: 16px;"></i> Fabi Almeida</span></li>
                            <li><span class="agenda-time highlight">14:30</span> <span class="agenda-event highlight"><i data-lucide="trophy" style="width: 16px; height: 16px;"></i> Premiação</span></li>
                            <li><span class="agenda-time highlight">16h</span> <span class="agenda-event highlight"><i data-lucide="party-popper" style="width: 16px; height: 16px;"></i> Samba Haw</span></li>
                            <li><span class="agenda-time">19h</span> <span class="agenda-event">Encerramento</span></li>
                        </ul>
                    </div>
                </div>

                <div class="agenda-home-footer">
                    <span style="color: #e5484d;">📍</span> Praça de Alimentação · <strong style="color: var(--green-light);">Shows no palco secundário</strong>
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
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/atletismo.png" class="feature-img" alt="Atletismo"></div><div class="feature-content"><h3 class="feature-title">Atletismo</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/basquete.png" class="feature-img" alt="Basquete"></div><div class="feature-content"><h3 class="feature-title">Basquete</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/beach-tenis.png" class="feature-img" alt="Beach Tênis"></div><div class="feature-content"><h3 class="feature-title">Beach Tênis</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/ciclismo.png" class="feature-img" alt="Ciclismo"></div><div class="feature-content"><h3 class="feature-title">Ciclismo</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/corrida-de-rua.png" class="feature-img" alt="Corrida de Rua"></div><div class="feature-content"><h3 class="feature-title">Corrida de Rua</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/dama.png" class="feature-img" alt="Dama"></div><div class="feature-content"><h3 class="feature-title">Dama</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/domino.png" class="feature-img" alt="Dominó"></div><div class="feature-content"><h3 class="feature-title">Dominó</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/fifa.png" class="feature-img" alt="FIFA"></div><div class="feature-content"><h3 class="feature-title">FIFA</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/futebol.png" class="feature-img" alt="Futebol"></div><div class="feature-content"><h3 class="feature-title">Futebol</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/futsal.png" class="feature-img" alt="Futsal"></div><div class="feature-content"><h3 class="feature-title">Futsal</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/handebol.png" class="feature-img" alt="Handebol"></div><div class="feature-content"><h3 class="feature-title">Handebol</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/natacao.png" class="feature-img" alt="Natação"></div><div class="feature-content"><h3 class="feature-title">Natação</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/peteca.png" class="feature-img" alt="Peteca"></div><div class="feature-content"><h3 class="feature-title">Peteca</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/sinuca.png" class="feature-img" alt="Sinuca"></div><div class="feature-content"><h3 class="feature-title">Sinuca</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/tenis-de-mesa.png" class="feature-img" alt="Tênis de Mesa"></div><div class="feature-content"><h3 class="feature-title">Tênis de Mesa</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/truco.png" class="feature-img" alt="Truco"></div><div class="feature-content"><h3 class="feature-title">Truco</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/volei-de-areia.png" class="feature-img" alt="Vôlei de Areia"></div><div class="feature-content"><h3 class="feature-title">Vôlei de Areia</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/volei-de-quadra.png" class="feature-img" alt="Vôlei de Quadra"></div><div class="feature-content"><h3 class="feature-title">Vôlei de Quadra</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/xadrez.png" class="feature-img" alt="Xadrez"></div><div class="feature-content"><h3 class="feature-title">Xadrez</h3></div></div>

                    <!-- Grupo 2 (Cópia para o scroll infinito) -->
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/atletismo.png" class="feature-img" alt="Atletismo"></div><div class="feature-content"><h3 class="feature-title">Atletismo</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/basquete.png" class="feature-img" alt="Basquete"></div><div class="feature-content"><h3 class="feature-title">Basquete</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/beach-tenis.png" class="feature-img" alt="Beach Tênis"></div><div class="feature-content"><h3 class="feature-title">Beach Tênis</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/ciclismo.png" class="feature-img" alt="Ciclismo"></div><div class="feature-content"><h3 class="feature-title">Ciclismo</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/corrida-de-rua.png" class="feature-img" alt="Corrida de Rua"></div><div class="feature-content"><h3 class="feature-title">Corrida de Rua</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/dama.png" class="feature-img" alt="Dama"></div><div class="feature-content"><h3 class="feature-title">Dama</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/domino.png" class="feature-img" alt="Dominó"></div><div class="feature-content"><h3 class="feature-title">Dominó</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/fifa.png" class="feature-img" alt="FIFA"></div><div class="feature-content"><h3 class="feature-title">FIFA</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/futebol.png" class="feature-img" alt="Futebol"></div><div class="feature-content"><h3 class="feature-title">Futebol</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/futsal.png" class="feature-img" alt="Futsal"></div><div class="feature-content"><h3 class="feature-title">Futsal</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/handebol.png" class="feature-img" alt="Handebol"></div><div class="feature-content"><h3 class="feature-title">Handebol</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/natacao.png" class="feature-img" alt="Natação"></div><div class="feature-content"><h3 class="feature-title">Natação</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/peteca.png" class="feature-img" alt="Peteca"></div><div class="feature-content"><h3 class="feature-title">Peteca</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/sinuca.png" class="feature-img" alt="Sinuca"></div><div class="feature-content"><h3 class="feature-title">Sinuca</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/tenis-de-mesa.png" class="feature-img" alt="Tênis de Mesa"></div><div class="feature-content"><h3 class="feature-title">Tênis de Mesa</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/truco.png" class="feature-img" alt="Truco"></div><div class="feature-content"><h3 class="feature-title">Truco</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/volei-de-areia.png" class="feature-img" alt="Vôlei de Areia"></div><div class="feature-content"><h3 class="feature-title">Vôlei de Areia</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/volei-de-quadra.png" class="feature-img" alt="Vôlei de Quadra"></div><div class="feature-content"><h3 class="feature-title">Vôlei de Quadra</h3></div></div>
                    <div class="feature-card"><div class="feature-img-wrapper"><img src="/assets/modalidades/xadrez.png" class="feature-img" alt="Xadrez"></div><div class="feature-content"><h3 class="feature-title">Xadrez</h3></div></div>
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
