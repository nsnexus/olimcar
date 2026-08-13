import { TABELA_PONTUACAO } from '../../services/db.js';

export function renderModalidadesPage() {
    return `
        <div class="container" style="padding-top: 2rem; padding-bottom: 4rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h2>Modalidades e Regulamento</h2>
                <button onclick="window.history.back()" class="btn btn-outline">Voltar ao Painel</button>
            </div>

            <p style="color: var(--color-text-muted); font-size: 1.1rem; margin-bottom: 2rem;">
                Abaixo estão listadas as modalidades oficiais da Olimcar 2026 e o quadro de pontuação para o Ranking.
            </p>

            <div class="modalidades-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
                
                <div class="card" style="overflow: hidden;">
                    <div style="height: 180px; overflow: hidden;"><img src="/assets/art/mod_futebol.png" style="width: 100%; height: 100%; object-fit: cover; object-position: center;"></div>
                    <div style="padding: 1.5rem;">
                        <h3 style="margin-bottom: 0.5rem; color: var(--color-primary-800);">Futebol & Futsal</h3>
                        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Campo, Society e Salão. Coletivo Plus (Acima de 4 participantes).</p>
                        <span class="badge" style="background: var(--color-primary-100); color: var(--color-primary-800);">1º: 50pts | 2º: 35pts | 3º: 20pts</span>
                    </div>
                </div>

                <div class="card" style="overflow: hidden;">
                    <div style="height: 180px; overflow: hidden;"><img src="/assets/art/mod_volei.png" style="width: 100%; height: 100%; object-fit: cover; object-position: top;"></div>
                    <div style="padding: 1.5rem;">
                        <h3 style="margin-bottom: 0.5rem; color: var(--color-primary-800);">Voleibol & Areia</h3>
                        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Vôlei de Quadra e Areia. Coletivo (Até 4 participantes).</p>
                        <span class="badge" style="background: var(--color-primary-100); color: var(--color-primary-800);">1º: 35pts | 2º: 25pts | 3º: 15pts</span>
                    </div>
                </div>

                <div class="card" style="overflow: hidden;">
                    <div style="height: 180px; overflow: hidden;"><img src="/assets/art/mod_basquete.png" style="width: 100%; height: 100%; object-fit: cover; object-position: center;"></div>
                    <div style="padding: 1.5rem;">
                        <h3 style="margin-bottom: 0.5rem; color: var(--color-primary-800);">Basquetebol</h3>
                        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Disputas em trio na quadra. Coletivo (Até 4 participantes).</p>
                        <span class="badge" style="background: var(--color-primary-100); color: var(--color-primary-800);">1º: 35pts | 2º: 25pts | 3º: 15pts</span>
                    </div>
                </div>

                <div class="card" style="overflow: hidden;">
                    <div style="height: 180px; overflow: hidden;"><img src="/assets/art/mod_atletismo.png" style="width: 100%; height: 100%; object-fit: cover; object-position: top;"></div>
                    <div style="padding: 1.5rem;">
                        <h3 style="margin-bottom: 0.5rem; color: var(--color-primary-800);">Atletismo</h3>
                        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Corridas de pista e revezamento. Pontuação Individual.</p>
                        <span class="badge" style="background: var(--color-primary-100); color: var(--color-primary-800);">1º: 25pts | 2º: 15pts | 3º: 10pts</span>
                    </div>
                </div>

                <div class="card" style="overflow: hidden;">
                    <div style="height: 180px; overflow: hidden;"><img src="/assets/art/mod_natacao.png" style="width: 100%; height: 100%; object-fit: cover; object-position: center;"></div>
                    <div style="padding: 1.5rem;">
                        <h3 style="margin-bottom: 0.5rem; color: var(--color-primary-800);">Natação</h3>
                        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Baterias na piscina. Pontuação Individual / Coletiva (revezamento).</p>
                        <span class="badge" style="background: var(--color-primary-100); color: var(--color-primary-800);">Ind: 25pts | Col: 35pts</span>
                    </div>
                </div>

                <div class="card" style="overflow: hidden;">
                    <div style="height: 180px; overflow: hidden;"><img src="/assets/art/mod_tenis.png" style="width: 100%; height: 100%; object-fit: cover; object-position: center;"></div>
                    <div style="padding: 1.5rem;">
                        <h3 style="margin-bottom: 0.5rem; color: var(--color-primary-800);">Esportes de Raquete</h3>
                        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Tênis, Tênis de Mesa e Beach Tênis. Individual e Duplas.</p>
                        <span class="badge" style="background: var(--color-primary-100); color: var(--color-primary-800);">Ind: 25pts | Dupla: 35pts</span>
                    </div>
                </div>

                <div class="card" style="overflow: hidden;">
                    <div style="height: 180px; overflow: hidden;"><img src="/assets/art/mod_handebol.png" style="width: 100%; height: 100%; object-fit: cover; object-position: center;"></div>
                    <div style="padding: 1.5rem;">
                        <h3 style="margin-bottom: 0.5rem; color: var(--color-primary-800);">Handebol</h3>
                        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Disputas no ginásio esportivo. Coletivo Plus.</p>
                        <span class="badge" style="background: var(--color-primary-100); color: var(--color-primary-800);">1º: 50pts | 2º: 35pts | 3º: 20pts</span>
                    </div>
                </div>

                <div class="card" style="overflow: hidden;">
                    <div style="height: 180px; overflow: hidden;"><img src="/assets/art/mod_ciclismo.png" style="width: 100%; height: 100%; object-fit: cover; object-position: center;"></div>
                    <div style="padding: 1.5rem;">
                        <h3 style="margin-bottom: 0.5rem; color: var(--color-primary-800);">Ciclismo M.T.B.</h3>
                        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Trilha e resistência. Pontuação Individual.</p>
                        <span class="badge" style="background: var(--color-primary-100); color: var(--color-primary-800);">1º: 25pts | 2º: 15pts | 3º: 10pts</span>
                    </div>
                </div>

                <div class="card" style="overflow: hidden;">
                    <div style="height: 180px; overflow: hidden;"><img src="/assets/art/mod_salao.png" style="width: 100%; height: 100%; object-fit: cover; object-position: center;"></div>
                    <div style="padding: 1.5rem;">
                        <h3 style="margin-bottom: 0.5rem; color: var(--color-primary-800);">Jogos de Salão</h3>
                        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Sinuca, Truco, Dominó e Xadrez. Recreativo.</p>
                        <span class="badge" style="background: var(--color-primary-100); color: var(--color-primary-800);">1º: 80pts | 2º: 60pts | 3º: 40pts</span>
                    </div>
                </div>

                <div class="card" style="overflow: hidden;">
                    <div style="height: 180px; overflow: hidden;"><img src="/assets/art/mod_esports.png" style="width: 100%; height: 100%; object-fit: cover; object-position: center;"></div>
                    <div style="padding: 1.5rem;">
                        <h3 style="margin-bottom: 0.5rem; color: var(--color-primary-800);">E-Sports</h3>
                        <p style="color: var(--color-text-muted); font-size: 0.9rem; margin-bottom: 1rem;">Competições digitais individuais e duplas.</p>
                        <span class="badge" style="background: var(--color-primary-100); color: var(--color-primary-800);">Ind: 25pts | Col: 35pts</span>
                    </div>
                </div>
            </div>
            
            <div class="card" style="padding: 2rem;">
                <h3 style="margin-bottom: 1.5rem;">Resumo da Tabela de Pontuação</h3>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="border-bottom: 2px solid var(--color-border); text-align: left;">
                            <th style="padding: 1rem 0;">Categoria</th>
                            <th style="padding: 1rem 0;">1º Lugar</th>
                            <th style="padding: 1rem 0;">2º Lugar</th>
                            <th style="padding: 1rem 0;">3º Lugar</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style="border-bottom: 1px solid var(--color-border);">
                            <td style="padding: 1rem 0; font-weight: 500;">Coletivo Plus (Ex: Futebol, Handebol)</td>
                            <td>50 pts</td><td>35 pts</td><td>20 pts</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--color-border);">
                            <td style="padding: 1rem 0; font-weight: 500;">Coletivo (Ex: Vôlei, Basquete, Duplas)</td>
                            <td>35 pts</td><td>25 pts</td><td>15 pts</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--color-border);">
                            <td style="padding: 1rem 0; font-weight: 500;">Individual (Ex: Atletismo, Natação)</td>
                            <td>25 pts</td><td>15 pts</td><td>10 pts</td>
                        </tr>
                        <tr style="border-bottom: 1px solid var(--color-border);">
                            <td style="padding: 1rem 0; font-weight: 500;">Recreativa (Jogos de Salão)</td>
                            <td>80 pts</td><td>60 pts</td><td>40 pts</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    `;
}
