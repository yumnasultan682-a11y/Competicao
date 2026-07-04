const { calcularAlerta } = require("./alertas");
const bairros = require("./bairros.json");

async function analisarBairros() {
    const resultados = bairros.bairros.map(bairro => ({
        bairro: bairro.nome,
        nivel: bairro.nivel_agua,
        alerta: calcularAlerta(bairro.nivel_agua)
    }));

    console.log("=== ALERTAS POR BAIRRO ===");
    resultados.forEach(r => {
        console.log(`📍 ${r.bairro}: ${r.alerta.mensagem} (${r.alerta.cor})`);
    });
}

analisarBairros();