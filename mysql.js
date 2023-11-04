// import mysql from 'mysql';
// import configFile from './db-config.json' assert { type: 'json' };

// const { database, user, password, host } = configFile; // configFile에서 필요한 변수 추출

// const connection = mysql.createConnection({
//   host     : host,
//   user     : user,
//   password : password,
//   database : database
// });

// //connection.connect();

// connection.query('SELECT * from artists', (error, results, fields)=> {
//   if (error){
//     console.log(error);
//   };
//   //console.log(results);
// });

// //connection.end();

// export {connection};

// //3.35.139.153:3000