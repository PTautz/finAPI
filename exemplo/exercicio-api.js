const express = require('express');

//inicializando express
const app = express();

//middleware
app.use(express.json());

app.get("/",(request,response) => {

    //envia mensagem pra quem está requisitando
    //return response.send("Opa, tudo tranquilo que nem esquilo?")

    // Pode aceitar mais que objeto
    return response.json({ message: "Opa, suave na nave? de leve na neve? de boa na lagoa? tranquilo como um grilo? firmão no busão? beleza na represa? Ta manso no ganço? na moral no matagal? Tudo certo no deserto? Só no sossego do morcego? Relax no durex? relaxa na bolacha? "});
});

app.get ("/courses", function (req, res) {
    const query = req.query;
    console.log (query);
    return res.json([
        "Curso 1",
        "Curso 2", 
        "Curso 3",
    ]);
});

app.post ("/courses", function (req, res) {
    const body = req.body;
    console.log ("Corpo da requisição, amém " + JSON.stringify(body));
    return res.json([
        "Curso 1",
        "Curso 2", 
        "Curso 3",
        "Curso 4"
    ]);
});

app.put ("/courses/:id", function (req, res) {
    const params = req.params.id;
    console.log("O id da request é de: " + (params));
    return res.json([
        "Cursos 6",
        "Cursos 2", 
        "Cursos 3",
        "Cursos 4"
    ]);
});

app.patch ("/courses/:id", function (req, res) {
    return res.json([
        "Cursos 6",
        "Cursos 7", // Alteração específica
        "Cursos 3",
        "Cursos 4"
    ]);
});

app.delete ("/courses/:id", function (req, res) {
    return res.json([
        "Curso 6",
        "Curso 7",
        "Curso 4"
    ]);
});

//definir porta aonde a plicação estará rodando
//escutando : localhost:3333
app.listen(3333, function () {
        console.log("Rodando...")
});

