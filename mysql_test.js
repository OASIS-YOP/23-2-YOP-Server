import mysql from 'mysql';

const connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'opentutorials'
});

connection.connect();

connection.query('SELECT * from topic', (error, results, fields)=> {
  if (error){
    console.log(error);
  };
  console.log(results);
});

connection.end();