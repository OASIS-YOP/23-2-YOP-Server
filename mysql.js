import mysql from 'mysql';

const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'ohnpol',
  database : 'ohnpol'
});

//connection.connect();

connection.query('SELECT * from artists', (error, results, fields)=> {
  if (error){
    console.log(error);
  };
  console.log(results);
});

//connection.end();

export {connection};