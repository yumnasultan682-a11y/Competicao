// Função que calcula o nível de alerta
function calcularAlerta(nivelAgua) {
    if (nivelAgua < 30) {
        return { estado: "normal", cor: "verde", mensagem: "Sem perigo" };
    } else if (nivelAgua < 60) {
        return { estado: "atencao", cor: "amarelo", mensagem: "Fique atento" };
    } else if (nivelAgua < 80) {
        return { estado: "perigo", cor: "laranja", mensagem: "Prepare-se para evacuar" };
    } else {
        return { estado: "critico", cor: "vermelho", mensagem: "EVACUE AGORA!" };
    }
}

// Testar
console.log(calcularAlerta(75));

module.exports = { calcularAlerta };