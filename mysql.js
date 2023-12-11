import mysql from 'mysql';
import { config } from 'dotenv';
config();

const con = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_DATABASE
});

con.connect();

// con.query('SELECT * from users', (error, results, fields)=> {
//   if (error){
//     console.log(error);
//   };
//   console.log(results);
//   //console.log(process.env.DB_HOST);
// });

//connection.end();

export default con;