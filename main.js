import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import { swaggerUi, specs } from './modules/swagger.js'
import mysql from 'mysql';
import { config } from 'dotenv';
config();
import { Artist, 
  Favorite, 
  Collection, 
  Like,
  PhotoCard,
  Polaroid,
  Post,
  User } from './db.js';

const app = express();
const port = 3000;
app.use(bodyParser.json());
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

const con = mysql.createConnection({
  host     : process.env.DB_HOST,
  user     : process.env.DB_USER,
  password : process.env.DB_PASSWORD,
  database : process.env.DB_DATABASE
});

con.connect();

con.query('SELECT * from users', (error, results, fields)=> {
  if (error){
    console.log(error);
  };
  console.log(results);
  //console.log(process.env.DB_HOST);
});

//connection.end();


app.get('/', async(req, res)=>{
  res.send('Hello World!');
})

//mainpage
//즐겨찾는 아티스트
app.get('/mainpage/:userId', async (req, res) => {
  const userId = req.params.userId; // 요청된 userId

  const sql = `SELECT artists.photo, artists.artistId, artists.groupName
              FROM Favorites
              INNER JOIN artists ON Favorites.artistId = artists.artistId
              WHERE Favorites.userId = ?;`;
  con.query(sql, [userId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      favArtist: result // 여기에서 result는 변수명입니다. 원하는 결과 데이터로 대체되어야 합니다.
    };
    res.status(200).send(r);
  })
});
//hot10
app.get('/mainpage/:userId/hot10', async (req, res) => {
  
  const sql = `SELECT 
              pc.photocard,
              pc.enterComp,
              pc.groupName,
              pc.memberName,
              pc.albumName,
              l.userId,
              l.postId
            FROM (
              SELECT postId, userId
              FROM Likes
              ORDER BY likeQuant DESC
              LIMIT 10
            ) l
            INNER JOIN Posts p ON l.postId = p.postId
            INNER JOIN Polaroids pr ON p.PolaroidPolaroidId = pr.PhotoCardMemberName
            INNER JOIN photoCards pc ON pr.photoCardMemberName = pc.memberName;`;
  con.query(sql, (err, result, fields)=>{
    if(err) throw err;
    const r = {
      hot10List: result // 여기에서 result는 변수명입니다. 원하는 결과 데이터로 대체되어야 합니다.
    };
    res.status(200).send(r);
    console.log("hot10", result);
  })
});
//실시간도안
app.get('/mainpage/:userId/now5', async (req, res) => {
  
  const sql = `
              SELECT postId, post
              FROM Posts
              ORDER BY postId DESC
              LIMIT 5;
            `
  con.query(sql, (err, result, fields)=>{
    if(err) throw err;
    const r = {
      now5List: result // 여기에서 result는 변수명입니다. 원하는 결과 데이터로 대체되어야 합니다.
    };
    res.status(200).send(r);
    console.log("실시간도안", result);
  })
  
});

//랜덤 아티스트
app.get('/mainpage/:userId/artist', async (req, res) => {
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  const randomInt = getRandomInt(4)+1 //
  const sql = `SELECT 
              enterComp,
              groupName,
              photo
            FROM artists
            WHERE artistId=?;`;
  con.query(sql,[randomInt], (err, result, fields)=>{
    if(err) throw err;
    //res.status(200).send(`randomArtistList: ${result}`);
    const r = {
      randomArtistList: result // 여기에서 result는 변수명입니다. 원하는 결과 데이터로 대체되어야 합니다.
    };
    res.status(200).send(r);
    console.log("랜덤아티스트", result);
  })
});

//artistpage
app.get('/artistpage', async (req, res) => {
  const sql1 = `SELECT enterComp FROM artists ORDER BY enterComp DESC`;
  con.query(sql1, (err, result1) => {
    if (err) throw err;

    const enterComp = result1; 
    const allResults = [];

    // 모든 비동기 쿼리가 완료될 때까지 대기하기 위한 카운터 변수
    let queryCounter = 0;

    for (let i = 0; i < enterComp.length; i++) {
      const sql = `SELECT artistId, groupName, photo FROM artists WHERE enterComp = "${enterComp[i].enterComp}"`;
      con.query(sql, (err, result) => {
        if (err) throw err;

        const r = {
          enterComp: enterComp[i].enterComp,
          artistList: result
        };
        
        allResults.push(r);

        queryCounter++;
        const resultSending = {
          allArtistList: allResults
        };

        // 모든 쿼리가 완료되면 결과를 전송
        if (queryCounter === enterComp.length) {
          res.status(200).send(resultSending);
        }
      });
    }
  });
});



//community page
//아티스트 프로필 조회
app.get('/community/:artistId', async (req, res) => {
  const artistId = req.params.artistId; 
  const sql = `SELECT 
                artists.groupName,
                artists.photo,
                artists.enterComp,
                artists.collectionQuant
              FROM artists
              INNER JOIN Favorites f ON artists.artistId = f.artistId
              WHERE artists.artistId = ? `;
  con.query(sql,[artistId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      ArtistProfile: result
    };
    res.status(200).send(r);
    //console.log("아티스트페이지", result);
  })
});

//아티스트 즐겨찾기 수 조회
app.get('/community/:artistId/favoriteQuant', async (req, res) => {
  const artistId = req.params.artistId; 
  const sql = `SELECT 
                favoriteQuant
              FROM Favorites
              WHERE artistId = ? ;`;
  con.query(sql,[artistId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      ArtistFavoriteQuant: result
    };
    res.status(200).send(r);
    //console.log("아티스트페이지", result);
  })
});

//아티스트 즐겨찾기 수 조회
app.get('/community/:artistId/favoriteQuant', async (req, res) => {
  const artistId = req.params.artistId; 
  const sql = `SELECT COUNT(*)
                FROM Favorites
              WHERE artistId = ?; `;
  con.query(sql,[artistId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      ArtistFavoriteQuant: result
    };
    res.status(200).send(r);
    //console.log("아티스트페이지", result);
  })
});

//아티스트 즐겨찾기 해제
//app.delete

//아티스트 내가 가진 컬렉션 조회
app.get('/community/:artistId/collectionQuant', async (req, res) => {
  const userId = req.params.artistId; 
  const sql = `SELECT COUNT(*)
                FROM UserCollections
              WHERE userId = ?; `;
  con.query(sql,[userId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      collectionQuantThatIHave: result
    };
    res.status(200).send(r);
    //console.log("아티스트페이지", result);
  })
});

//아티스트 멤버별 이름 및 사진 조회
app.get('/community/:artistId/members', async (req, res) => {
  const artistId = req.params.artistId; 
  const sql = `SELECT 
                memberNum,
                memberPhoto
              FROM artists
              WHERE artistId = ?; `;
  con.query(sql,[artistId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      memberNumandPhoto: result
    };
    res.status(200).send(r);
    //console.log("아티스트페이지", result);
  })
});


app.listen(port, ()=>{
  console.log(`Example app listening on ${port}`);
})

// 데이터베이스 연결 종료
// 이는 종료가 필요한 경우에 사용되어야 합니다.
// 프로세스가 종료될 때 실행되도록 하는 것이 아니라 코드 내에서 필요한 시점에 직접 호출되어야 합니다.
function closeDatabaseConnection() {
  con.end(function(err) {
    if (err) throw err;
    console.log('Database connection closed');
  });
}

// 예를 들어 서버 종료 시에 호출되어야 하는 경우
process.on('SIGINT', function() {
  closeDatabaseConnection();
  process.exit(0);
});