import http from 'http';
import  fs  from 'fs';
import { DataTypes, Model, Sequelize } from 'sequelize';


const app = http.createServer((request,response)=>{
  const url = request.url;
  if(request.url == '/'){
    url = '/index.html';
  }
  if(request.url == '/favicon.ico'){
    response.writeHead(404);
    response.end();
    return;
  }
  response.writeHead(200);
  response.end(fs.readFileSync(__dirname + url));

});
app.listen(3000);




