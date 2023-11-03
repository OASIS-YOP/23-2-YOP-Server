import mysql from 'mysql';
import { rds_password } from './pw';

const connection = mysql.createConnection({
  host     : 'ohnpol.cso5gnftja7i.ap-northeast-2.rds.amazonaws.com',
  user     : 'admin',
  password : rds_password,
  database : 'ohnpol_rds'
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