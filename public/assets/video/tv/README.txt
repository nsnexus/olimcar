Vídeos do Painel de TV (public/tv.html)
========================================

Coloque aqui os vídeos que devem entrar no loop da TV (aberturas,
patrocinadores, retrospectivas, etc).

Depois de colocar o arquivo, edite public/js/tv.js e adicione o caminho
na lista VIDEOS, no topo do arquivo. Exemplo:

    const VIDEOS = [
        '/assets/video/tv/abertura.mp4',
        '/assets/video/tv/patrocinadores.mp4',
    ];

A ordem da lista é a ordem de exibição no loop. Sem nenhum vídeo na
lista, o painel mostra uma tela com a marca Olimcar no lugar do vídeo.

Recomendado: MP4 (H.264), até ~50MB por vídeo, resolução Full HD (1920x1080).
