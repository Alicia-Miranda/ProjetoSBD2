const mongoose = require('mongoose');

const dbUri = 'mongodb://localhost:27017/cadastro_fornecedores';

mongoose.connect(dbUri, {
    useNewUrlParser: true,
})
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log('Database connected successfully');
});
//.then(() => console.log("Conectado ao MongoDB"))
//.catch(err => console.error("Erro ao conectar ao MongoDB:", err));

module.exports = mongoose;

