const express = require('express');
const { v4: uuidv4 } = require("uuid"); // v4 gera identificador único universal 
const dateFormat = require('date-and-time'); //formatar data em DD/MM/YYYY

const app = express();

const customers = [];

app.use(express.json()); //inicializando express

//Middlewares
function verifyIfExistsAccountCPF(request, response, next) {
    const { cpf } = request.headers;

    //buscar statement dentro do customers e verifica se cpf já é existente
    //precisa retornar a informação completa do objeto com o customers.find
    const customer = customers.find(customers => customers.cpf === cpf);

    //verifica se conta é existente
    if (!customer) {
        return response.status(400).json({ error: "Customer not found"});
    }

    //passar o customer pras demais rotas que estão chamando a middleware
    request.customer = customer;

    return next();
}

// Balanço
function getBalance (statement) {
    // faz o balanço entradas - saídas e sempre que for fazendo a operação atribui a balance
    // reduce soma de todos os elementos do array, excluindo furos 
    const balance = statement.reduce((acc, operation) => {
        if(operation.type === 'credit'){
            return acc + operation.amount;
        }else {
            return acc - operation.amount;
        }
    }, 0);
    return balance;
}

// cria conta e verifica cpf existente 
app.post("/accounts", (request, response) => {
    const { cpf, name, address } = request.body;

    //função que verifica se cpf já é existente 
    const customersAlreadyExist = customers.some(
        (customer) => customer.cpf === cpf 
    );

    if(customersAlreadyExist){
        return response.status(400).json({error: "Customer already exists"});
    }

    //const id = uuidv4();
    customers.push({
        cpf,
        name,
        address,
        id: uuidv4(),
        statement: []
    });

    return response.json(customers[customers.length-1]).status(201).send();
});

//Se todas as rotas a seguir usarem esse middleware pode usar dessa forma
//app.use(verifyIfExistsAccountCPF);

// listando extrato = statement
app.get("/accounts/statement", verifyIfExistsAccountCPF, (request, response) => {
    //acessar customer verificado no middleware
    const{ customer } = request;

    return response.json(customer.statement);
});

// Fazer depósito
app.post ("/accounts/deposit", verifyIfExistsAccountCPF, (request, response) => {

    // pega descrição e valor para inserir dentro da operação
    const { description, amount } = request.body;

    // Recupera o customer
    const { customer } = request;


    const statementOperation = {
        description,
        amount,
        created_at: dateFormat.format(new Date(),'DD/MM/YYYY'),
        type: "credit"
    }

    // Passa a operação para o statement do customer
    customer.statement.push(statementOperation);

    return response.json(statementOperation).status(201).send();
});

// Fazer saque
app.post("/accounts/withdraw",verifyIfExistsAccountCPF, (request, response) => {
    
    //pega quantidade do corpo da requição
    const { description,amount } = request.body;
    const { customer } = request;

    //chama o balanço
    const balance = getBalance(customer.statement);

    if(balance < amount) {
        return response.status(400).json({error: "Insufficient funds!"})
    }

    const statementOperation = {
        description,
        amount,
        created_at:dateFormat.format(new Date(),'DD/MM/YYYY'),
        type: "debit"
    };

    customer.statement.push(statementOperation);

    return response.json(statementOperation).status(201).send();
});

// Filtra extrato por data
app.get("/accounts/statement/date", verifyIfExistsAccountCPF, (request, response) => {
    //acessar customer verificado no middleware
    const{ customer } = request;
    //pega parâmetro do query
    const { date } = request.query;
    
    // filtra e retorna extrato bancário  comparando exatamente a data com o dia solicitado
    const statement = customer.statement.filter(
        (statement) => statement.created_at === date
    );

    return response.json(statement);
});

//Atualiza nome e endereço
app.patch("/accounts", verifyIfExistsAccountCPF, (request, response) => {
    const { name } = request.body;
    const { address } = request.body;
    const { customer } = request;


    if (name !== undefined && customer.name !== name) {
        customer.name = name;
    };

    if (address !== undefined && customer.address !== address) {
        customer.address = address;
    };

    return response.json(customer).status(200).send();

});

// Lista Cliente
app.get("/accounts", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;

    return response.json(customer);
});

// Deleta Cliente
app.delete("/accounts", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request;

    //splice 
    customers.splice(customer, 1);

    return response.status(200).json(customers);
}); 

//Listar Balanço
app.get("/accounts/balance", verifyIfExistsAccountCPF, (request, response) => {
    const { customer} = request;

    const balance = getBalance(customer.statement);

    return response.json(balance);
});

app.listen(3333, function () {
    console.log("Rodando...")
});