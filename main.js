import http from 'http';
import  fs  from 'fs';
import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import { swaggerUi, specs } from './modules/swagger.js'
import { connection } from './mysql.js';

const app = express();
const port = 3000;
app.use(bodyParser.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

app.get('/', async(req, res)=>{
  res.send('Hello World!');
  // 즐겨찾는 아티스트
  //const favArtist = await client.query('select photo, groupName from artist', [req.body.id, ]);

  // 폴꾸 Hot10
  // const hot10 = await client.query(`
  //   SELECT * 
  //   FROM posts
  //   ORDER BY likeNum DESC
  //   LIMIT 10;
  // `, [req.body.id, ]);
})

app.listen(port, ()=>{
  console.log(`Example app listening on ${port}`);
})

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));

// const app = http.createServer((request,response)=>{
//   const url = request.url;
//   if(request.url == '/'){
//     url = '/index.html';
//   }
//   if(request.url == '/favicon.ico'){
//     response.writeHead(404);
//     response.end();
//     return;
//   }
//   response.writeHead(200);
//   response.end(fs.readFileSync(__dirname + url));

// });
// app.listen(3000);

app.get('/mainpage', (req, res)=>{
  const num = getRandomInt(1,4) //4 = record quant
  //const anArtist = connection.query(`select enterComp, photo, groupName from artists WHERE artistId = $${num}` );
  const anArtist = connection.query(`SELECT enterComp, photo, groupName from artists WHERE artistId = $3` );
  console.log(anArtist);

})




