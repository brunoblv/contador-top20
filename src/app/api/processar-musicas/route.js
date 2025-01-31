export async function POST(request) {
    const { texto, opcao } = await request.json();

    if (!texto) {
        return new Response(JSON.stringify({ error: 'Nenhum texto enviado.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const pontuacaoMusicas = new Map();
    const regexExtra = /\s+\d+\(×\d+\)\s+\d+|\s+\d+\s+\d+/;

    texto.split('\n').forEach((linha) => {
        const linhaLimpa = linha.trim();
        if (!linhaLimpa) return;

        const partes = linhaLimpa.split("–");
        if (partes.length < 2) return;

        const dadosIniciais = partes[0].trim().split(/\s+/);
        const musica = partes[1].replace(regexExtra, '').trim();

        if (dadosIniciais.length < 3 || !/^\d+$/.test(dadosIniciais[1])) return;

        const posicaoAtual = parseInt(dadosIniciais[1], 10);
        const artista = dadosIniciais.slice(2).join(' ');

        // Calcula a pontuação com base na opção selecionada
        let pontos;
        if (opcao === "Bang") {
            // Pontuação para "Bang":
            // 1ª posição = 25 pontos
            // 2ª posição = 19 pontos
            // 3ª posição = 18 pontos
            // ...
            // 20ª posição = 1 ponto
            pontos = posicaoAtual === 1 ? 25 : Math.max(20 - posicaoAtual + 1, 1);
        } else {
            // Pontuação padrão para "9095": 21 - posição
            pontos = 21 - posicaoAtual;
        }

        const chave = `${artista.trim()} - ${musica.trim()}`;

        if (pontuacaoMusicas.has(chave)) {
            pontuacaoMusicas.set(chave, pontuacaoMusicas.get(chave) + pontos);
        } else {
            pontuacaoMusicas.set(chave, pontos);
        }
    });

    const top30 = Array.from(pontuacaoMusicas.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 200);

    return new Response(JSON.stringify({ musicas: top30 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
    });
}