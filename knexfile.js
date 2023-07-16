require('dotenv').config();

module.exports = {
    client: 'pg',
    connection: {
        host: process.env.PGSQL_HOST,
        port: process.env.PGSQL_PORT,
        database: process.env.PGSQL_DATABASE,
        user: process.env.PGSQL_USERNAME,
        password: process.env.PGSQL_PASSWORD,
    },
    migrations: {
        directory: './migrations' // Migration dosyalarının konumu
    },
    seeds: {
        directory: './seeds' // Seed dosyalarının konumu (isteğe bağlı)
    }
};
