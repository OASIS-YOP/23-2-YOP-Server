import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import con from './mysql.js';
import multer from 'multer';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// import { Strategy as JwtStrategy } from 'passport-jwt';
// import { ExtractJwt as ExtracJwt } from 'passport-jwt';
// import { DataTypes, Model, Sequelize } from 'sequelize';
// import { Artist, 
//   Favorite, 
//   Collection, 
//   Like,
//   PhotoCard,
//   Polaroid,
//   Post,
//   User } from './db.js';

const randomImgName = (bytes=32)=> crypto.randomBytes(bytes).toString('hex');

const bucketName = process.env.BUCKET_NAME;
const region = process.env.S3_REGION;
const accessKey = process.env.S3_KEYID;
const secretAccessKey = process.env.S3_PRIVATEKEY;

console.log('Region:', region);
console.log('Access Key:', accessKey);
console.log('Secret Access Key:', secretAccessKey);

const s3 = new S3Client({
  credentials:{
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey
  },
  region: region
});

const app = express();
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage});

// //로그인 관련
// const options = {
//   jwtFromRequest: ExtracJwt.fromAuthHeaderAsBearerToken(),
//   secretOrkey: 'secret',
//   algorithms: ['RS256']
// }

// const strategy = new JwtStrategy(options, (payload, done)=>{
//   User.findOne({where: {id: payload.sub}})
//   .then((user)=>{
//     if(user){
//       return done(null, user);
//     }else{
//       return done(null, false);
//     }
//   })
//   .catch(err => done(err, null));
// });

// module.exports = (passport)=>{
//   passport.use(strategy);
// }

app.use(bodyParser.json());
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}

app.get('/', async(req, res)=>{
  res.send('Hello World!');
})

// 회원
// app.get('/protected', async(req, res, next)=>{

// });

// app.post('/login', async(req, res, next)=>{

// });

// app.post('/register', async(req, res, next)=>{

// });


//mainpage
//즐겨찾는 아티스트
app.get('/mainpage/:userId/favArtist', async (req, res) => {
  const userId = req.params.userId; // 요청된 userId

  const sql = `SELECT artists.photo, artists.artistId, artists.groupName
              FROM Favorites
              INNER JOIN artists ON Favorites.artistId = artists.artistId
              WHERE Favorites.userId = ?;`;
  con.query(sql, [userId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      favArtistList: result // 여기에서 result는 변수명입니다. 원하는 결과 데이터로 대체되어야 합니다.
    };
    res.status(200).send(r);
  })
});

//hot10
// app.get('/mainpage/:userId/hot10', async (req, res) => {
//   const sql = `SELECT l.postId, COUNT(*) AS thisisnothing,
//                 pl.polaroid, 
//                 pc.enterComp, pc.groupName, pc.memberName, pc.albumName,
//                 p.userId, u.nickname
//               FROM Likes l
//               INNER JOIN Posts p ON p.postId = l.postId
//               INNER JOIN Polaroids pl ON pl.polaroidId = p.polaroidId
//               INNER JOIN photoCards pc ON pl.photocardId = pc.photocardId
//               INNER JOIN users u ON l.userId = u.userId
//               GROUP BY l.postId
//               ORDER BY thisisnothing DESC
//               LIMIT 10;`;
//   con.query(sql, (err, result, fields)=>{
//     if(err) throw err;
//     const r = {
//       hot10List: result
//     }
//     res.status(200).send(r);
//   }) 
// });

// //hot10 좋아요
// app.get('/mainpage/:userId/hot10/:postId/like', async(req, res)=>{
//   const postId = req.params.postId;
//   const sql = `SELECT postId, COUNT(*) AS likeQuant
//               FROM Likes
//               WHERE postId = ?
//               GROUP BY postId;`;
//   con.query(sql, [postId], (err, result, fields)=>{
//     if(err) throw err;
//     const r = {
//       hot10LikeList : result
//     }
//     res.status(200).send(r);
//   })
// })

//hot 10 좋아요 합친 버전
app.get('/mainpage/:userId/hot10', async(req, res)=>{
  const sql = `SELECT l.postId, COUNT(*) AS likeQuant,
                      pl.polaroid, 
                      pc.enterComp, pc.groupName, pc.memberName, pc.albumName,
                      p.userId, u.nickname
                    FROM Likes l
                    INNER JOIN Posts p ON p.postId = l.postId
                    INNER JOIN Polaroids pl ON pl.polaroidId = p.polaroidId
                    INNER JOIN photoCards pc ON pl.photocardId = pc.photocardId
                    INNER JOIN users u ON p.userId = u.userId
                    GROUP BY l.postId
                    ORDER BY likeQuant DESC
                    LIMIT 10;`;
  con.query(sql, (err, result, fields)=>{
    if(err) throw err;
    const r={
      hot10List:result
    }
    res.status(200).send(r);
  })
})


//실시간도안
app.get('/mainpage/:userId/now5', async (req, res) => {
  
  const sql = `
              SELECT p.postId, pl.polaroid
              FROM Posts p
              INNER JOIN Polaroids pl ON p.polaroidId = pl.polaroidId
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
app.get('/mainpage/:userId/randomArtist', async (req, res) => {
  const sql = `SELECT DISTINCT enterComp FROM artists;`;
  
  con.query(sql, (err, results, fields) => {
    if (err) throw err;
    
    const randomEnterComp = results[getRandomInt(results.length)].enterComp;
    //console.log("소속사",randomEnterComp);
    const sql2 = `SELECT artistId, groupName, photo
                  FROM artists
                  WHERE enterComp = ?`;
    
    con.query(sql2, [randomEnterComp], (err, result, fields) => {
      if (err) throw err;
      
      const r = {
        randomArtistList: result
      };
      
      res.status(200).send(r);
      console.log("랜덤아티스트", result);
    });
  });
});


//artistpage
app.get('/artistpage/allArtist', async (req, res) => {
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

// 아티스트 프로필 조회
// const artistProfile = (artistId) => {
//   return new Promise((resolve, reject) => {
//     con.query(
//       `SELECT 
//         artists.groupName,
//         artists.photo,
//         artists.enterComp,
//         artists.collectionQuant
//       FROM artists
//       WHERE artists.artistId = ?
//       ;`, [artistId], (err, result) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(result[0]);
//         }
//       }
//     );
//   });
// };

// // 아티스트 즐겨찾기 수 조회
// const artistFavoriteQuant = (artistId) => {
//   return new Promise((resolve, reject) => {
//     con.query(
//       `SELECT COUNT(*) AS favoriteQuant
//       FROM Favorites
//       WHERE artistId = ?; `, [artistId], (err, result) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(result[0]);
//         }
//       }
//     );
//   });
// };

// app.get('/community/:artistId/artistProfile', async (req, res) => {
//   const artistId = req.params.artistId;

//   try {
//     const profile = await artistProfile(artistId);
//     const favoriteQuant = await artistFavoriteQuant(artistId);
//     const result = {...profile, ...favoriteQuant};

//     const r = {
//       artistProfile: result
//     };

//     res.status(200).send(r);
//     console.log('r', r);
//   } catch (error) {
//     console.error('에러:', error);
//     res.status(500).send('내부 서버 오류');
//   }
// });

// //아티스트 즐겨찾기 수 조회
// app.get('/community/:artistId/favoriteQuant', async (req, res) => {
//   const artistId = req.params.artistId; 
//   const sql = `SELECT COUNT(*) AS favoriteQuant
//                 FROM Favorites
//               WHERE artistId = ?; `;
//   con.query(sql,[artistId], (err, result, fields)=>{
//     if(err) throw err;
//     const r = {
//       ArtistFavoriteQuant: result[0]
//     };
//     res.status(200).send(r);
//     //console.log("아티스트페이지", result);
//   })
// });

// 아티스트 프로필 조회
app.get('/community/:artistId/artistProfile', async (req, res) => {
  const artistId = req.params.artistId; 
  const sql = `SELECT 
                artists.groupName,
                artists.photo,
                artists.enterComp,
                artists.collectionQuant
              FROM artists
              WHERE artists.artistId = ? `;
  con.query(sql,[artistId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      ArtistProfile: result[0]
    };
    res.status(200).send(r);
    //console.log("아티스트페이지", result);
  })
});

//아티스트 즐겨찾기 수 조회
app.get('/community/:artistId/favoriteQuant', async (req, res) => {
  const artistId = req.params.artistId; 
  const sql = `SELECT COUNT(*) AS favoriteQuant
                FROM Favorites
              WHERE artistId = ?; `;
  con.query(sql,[artistId], (err, result, fields)=>{
    if(err) throw err;
    // const r = {
    //   ArtistFavoriteQuant: result[0]
    // };

    res.status(200).send(result[0]);
  });
});

//아티스트 즐겨찾기 해제
app.delete('/community/:artistId/notFavorite/:userId', async(req,res)=>{
  const artistId = req.params.artistId;
  const userId = req.params.userId;
  const sql = `DELETE 
              FROM Likes
              WHERE (artistId=? AND userId=?);
  `
  con.query(sql, [artistId, userId], (err, result, fields)=>{
    if(err) throw err;
    res.status(200).send(result);
    console.log(result);
  })
});

//아티스트 내가 가진 컬렉션 조회
app.get('/community/:artistId/:userId/collectionQuant', async (req, res) => {
  const userId = req.params.userId;
  const artistId = req.params.artistId;
  const sql = `SELECT COUNT(*) AS collectionQuant
                FROM UserCollections uc
                INNER JOIN collections c ON uc.albumName = c.albumName
              WHERE uc.userId = ? AND c.artistId = ?; `;
  con.query(sql,[userId, artistId], (err, result, fields)=>{
    if(err) throw err;
    // const r = {
    //   collectionQuantThatIHave: result[0]
    // };
    res.status(200).send(result[0]);
  })
});

//멤버별 이름 및 사진 조회
app.get('/community/:artistId/members', async (req, res) => {
  const artistId = req.params.artistId;
  //const artistId = 1;
  const sql = `SELECT 
                memberNum,
                memberPhoto
              FROM artists
              WHERE artistId = ?; `;
  con.query(sql, [artistId], (err, result, fields) => {
    if(err) throw err;

    if (result.length > 0) {
      const memberNum = result[0].memberNum;
      const memberPhoto = JSON.parse(result[0].memberPhoto); // memberPhoto는 배열이 아니라 ''문자열!!
      console.log('memphoto',memberPhoto);
      // const members = [];
      // for (let i = 0; i < memberNum; i++) {
      //   const nameAndPhoto = {
      //     name: memberPhoto[i].name, 
      //     memPhoto: memberPhoto[i].memPhoto 
      //   };
      //   members.push(nameAndPhoto);
      // }
      const r = { memberPhoto }; // Wrap the members array in an object
      res.status(200).send(r);
      console.log("멤버별 이름과 사진", members);
    } else {
      res.status(404).send("No members found for the given artist ID.");
    }
  });
});

//아티스트 멤버별 도안 조회
app.get('/community/:memberName/memberPost', async (req, res) => { 
  const memberName = req.params.memberName;
  const sql = `SELECT 
                p.postId,
                pl.polaroid,
                pc.enterComp,
                pc.groupName,
                pc.memberName,
                pc.albumName,
                p.userId,
                u.nickname
              FROM Posts p
              INNER JOIN users u ON p.userId = u.userId
              INNER JOIN Polaroids pl ON p.polaroidId = pl.polaroidId
              INNER JOIN photoCards pc ON pc.photocardId = pl.photocardId
              WHERE  pc.memberName = ?
              ORDER BY p.postId DESC
              ; `;
  con.query(sql, [memberName], async (err, result, fields) => {
    if (err) throw err;
    
    const finalResult = [];

    for (let i = 0; i < result.length; i++) {
      const postId = result[i].postId;

      const sql2 = `SELECT l.postId, COUNT(*) AS likeQuant
                    FROM Likes l
                    WHERE l.postId = ?
                    GROUP BY l.postId
                    ORDER BY l.postId DESC`;
      
      const likeQuantResult = await new Promise((resolve, reject) => {
        con.query(sql2, [postId], (err, result, fields) => {
          if (err) reject(err);
          resolve(result.length > 0 ? result[0].likeQuant : 0);
          // if (result.length > 0) {
          //   resolve(result[0].likeQuant);
          // } else {
          //   resolve(0);
          // }
          //만약 결과가 있고, likeQuant 속성이 있다면 해당 값을 사용하고, 그렇지 않으면 기본값으로 0을 사용한다
        });
      });

      const r = {
          ...result[i],
          likeQuant: likeQuantResult
      };

      finalResult.push(r);
    }
    const r = {
      memberPostList:finalResult
    }
    
    res.status(200).send(r);
  });
});

// // 아티스트 멤버 별 도안 좋아요 수 조회
// app.get('/community/:memberName/memberPost/:postId/like', async(req, res)=>{
//   const memberName = req.params.memberName;
//   const postId = req.params.postId;
//   const sql = `SELECT postId, COUNT(*) AS likeQuant
//               FROM Likes
//               WHERE postId = ?;`;
//   con.query( sql, [postId], (err, result, fields)=>{
//     if(err) throw err;
//     const r = {
//       postLikeQuantList: result
//     }
//     res.status(200).send(r);
//   })
// });

//아티스트 전체 도안 조회
app.get('/community/:artistId/allPost', async (req, res) => {
  const artistId = req.params.artistId; 
  const sql = `SELECT
                p.postId,
                pl.polaroid,
                pc.enterComp,
                pc.groupName,
                pc.memberName,
                pc.albumName,
                p.userId,
                u.nickname
              FROM Posts p
              INNER JOIN users u ON p.userId = u.userId
              INNER JOIN Polaroids pl ON p.polaroidId = pl.polaroidId
              INNER JOIN photoCards pc ON pc.photocardId = pl.photocardId
              INNER JOIN artists a ON pc.enterComp = a.enterComp
              WHERE a.artistId = ?
              ORDER BY p.postId DESC; `
  con.query(sql, [artistId], async (err, result, fields) => {
    if (err) throw err;
    
    const finalResult = [];

    for (let i = 0; i < result.length; i++) {
      const postId = result[i].postId;

      const sql2 = `SELECT l.postId, COUNT(*) AS likeQuant
                    FROM Likes l
                    WHERE l.postId = ?
                    GROUP BY l.postId
                    ORDER BY l.postId DESC`;
      
      const likeQuantResult = await new Promise((resolve, reject) => {
        con.query(sql2, [postId], (err, result, fields) => {
          if (err) reject(err);
          resolve(result.length > 0 ? result[0].likeQuant : 0);
          // if (result.length > 0) {
          //   resolve(result[0].likeQuant);
          // } else {
          //   resolve(0);
          // }
          //만약 결과가 있고, likeQuant 속성이 있다면 해당 값을 사용하고, 그렇지 않으면 기본값으로 0을 사용한다
        });
      });

      const r = {
          ...result[i],
          likeQuant: likeQuantResult
      };

      finalResult.push(r);
    }
    const r = {
      allPostList:finalResult
    }
    
    res.status(200).send(r);
  });
});

// 아티스트 전체 도안 좋아요 수 조회
app.get('/community/:artistId/allPost/:postId/like', async(req, res)=>{
  const artistId = req.params.artistId;
  const postId = req.params.postId;
  const sql = `SELECT postId, COUNT(*) AS likeQuant
              FROM Likes
              WHERE postId =?;`;
  con.query( sql, [postId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      allPostLikeQuantList: result
    }
    res.status(200).send(r);
  })
});

// //도안 게시 - 컬렉션 선택
// app.get('/community/:userId/uploadPost/collection', async (req, res) => {
//   const artistId = req.params.artistId; 
//   const sql = `SELECT 
//                 memberNum,
//                 memberPhoto
//               FROM artists
//               WHERE artistId = ?; `;
//   con.query(sql,[artistId], (err, result, fields)=>{
//     if(err) throw err;
//     const r = {
//       memberNumandPhoto: result
//     };
//     res.status(200).send(r);
//     //console.log("아티스트페이지", result);
//   })
// });

// //도안 게시 - 도안 선택
// app.get('/community/:artistId/uploadPost/post', async (req, res) => {
//   const artistId = req.params.artistId; 
//   const sql = `SELECT 
//                 memberNum,
//                 memberPhoto
//               FROM artists
//               WHERE artistId = ?; `;
//   con.query(sql,[artistId], (err, result, fields)=>{
//     if(err) throw err;
//     const r = {
//       memberNumandPhoto: result
//     };
//     res.status(200).send(r);
//     //console.log("아티스트페이지", result);
//   })
// });

// 도안 게시(포스팅)
app.post('/community/:userId/uploadPost/:polaroidId/upload', async(req, res)=>{
  
  let today = new Date();   

  let year = today.getFullYear(); // 년도
  let month = today.getMonth() + 1;  // 월
  let date = today.getDate();  // 날짜

  let nowdate = `${year}-${month}-${date}`;

  let hours = today.getHours(); // 시
  let minutes = today.getMinutes();  // 분
  let seconds = today.getSeconds();  // 초

  let time = `${hours}:${minutes}:${seconds}`;
  let dateTime = `${nowdate} ${time}`;

  //const image = `https://${process.env.BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/polaroid/${imgName}`;
  const userId = req.params.userId;
  const polaroidId = req.params.polaroidId;
  const sql = `INSERT into Posts( postId, postDateTime, userId, polaroidId)
              VALUES ( NULL, ?, ?, ?) `
  con.query(sql, [ dateTime, userId, polaroidId ], (err, result, fields)=>{
    if(err) throw err;
    const msg = "포스팅 완료"
    result.message = msg;
    res.status(201).send(result);
    console.log(result);
  })
});

//mypage
//프로필 정보 조회
app.get('/mypage/:userId/myProfile', async(req, res)=>{
  const userId = req.params.userId;
  const sql = `SELECT userId, avatar, nickname, biography
              FROM users
              WHERE userId = ?
              
              ;`;
  con.query(sql, [userId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      userProfileInfo : result[0]
    };
    res.status(200).send(r);
    console.log(result[0]);
  })

});

//아티스트 탭 조회(포스트 유무 기준)
app.get('/mypage/:userId/myPost/artistTab', async(req, res)=>{
  const userId = req.params.userId;
  const sql =  `SELECT DISTINCT pc.groupName, a.artistId
                FROM Posts p
                INNER JOIN Polaroids pl ON p.polaroidId = pl.polaroidId
                INNER JOIN photoCards pc ON pl.photocardId = pc.photocardId
                INNER JOIN artists a ON a.groupName = pc.groupName
                WHERE p.userId = ?;
              `;
  
  con.query(sql, [userId], (err, result, fields)=>{
    if(err) throw err;
    result.forEach(item => {
      item.groupName = item.groupName.replace(/\([^)]*\)/, '').trim();
    });
    const r = {
      postArtistList: result 
    }
    res.status(200).send(r);
  })
});

//아티스트 별 포스트(게시 도안) 모아보기
app.get('/mypage/:userId/myPost/:artistId/post', async (req, res)=>{
  const userId = req.params.userId;
  const artistId = req.params.artistId;
  const sql = `SELECT DISTINCT p.postId, p.postDateTime, pl.polaroid, 
              pc.enterComp, pc.groupName, pc.memberName, pc.albumName,
              u.userId, u.nickname
              FROM Posts p
              INNER JOIN Polaroids pl ON pl.polaroidId = p.polaroidId
              INNER JOIN photoCards pc ON pl.photocardId = pc.photocardId
              INNER JOIN artists a ON a.groupName = pc.groupName
              INNER JOIN users u ON p.userId = u.userId
              WHERE p.userId = ? AND a.artistId=?
              ORDER BY p.postId DESC;`;
  con.query(sql, [userId, artistId], async (err, result, fields) => {
    if (err) throw err;
    
    const finalResult = [];

    for (let i = 0; i < result.length; i++) {
      const postId = result[i].postId;

      const sql2 = `SELECT l.postId, COUNT(*) AS likeQuant
                    FROM Likes l
                    WHERE l.postId = ?
                    GROUP BY l.postId;`;
      
      const likeQuantResult = await new Promise((resolve, reject) => {
        con.query(sql2, [postId], (err, result, fields) => {
          if (err) reject(err);
          resolve(result.length > 0 ? result[0].likeQuant : 0);
          // if (result.length > 0) {
          //   resolve(result[0].likeQuant);
          // } else {
          //   resolve(0);
          // }
          //만약 결과가 있고, likeQuant 속성이 있다면 해당 값을 사용하고, 그렇지 않으면 기본값으로 0을 사용한다
        });
      });

      const r = {
          ...result[i],
          likeQuant: likeQuantResult
      };

      finalResult.push(r);
    }
    const r = {
      myPostList:finalResult
    }
    
    res.status(200).send(r);
  });
});
//아티스트 별 게시 도안 좋아요 개수
app.get('/mypage/:userId/myPost/:artistId/:postId/like', async(req, res)=>{
  const userId = req.params.userId;
  const artistId = req.params.artistId;
  const postId = req.params.postId;
  const sql = `SELECT COUNT(*) AS LikeQuant
                FROM Likes
                WHERE postId = ?;`;
  con.query(sql, [postId], (err, result, fields)=>{
    if(err) throw err;
    // const r = {
    //   postOfArtistList: result
    // }
    res.status(200).send(result[0]);
  });
});

//포스트 삭제하기
app.delete('/mypage/:userId/myPost/delete/:postId', async (req, res)=>{
  const postId = req.params.postId;
  const sql =  `DELETE FROM Posts WHERE postId = ?;`;
  con.query(sql, [postId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      postDeleted: result
    }
    res.status(200).send(r);
    console.log(r);
  })
});

//아티스트 탭 정보 조회(즐겨찾기 기준)
app.get('/mypage/:userId/myCollection/artistTab', async (req, res)=>{
  const userId = req.params.userId;
  const sql = `SELECT f.artistId, a.groupName
              FROM Favorites f
              INNER JOIN artists a ON f.artistId = a.artistId
              WHERE userId = ?;`;
  con.query(sql, [userId], (err, result, fields)=>{
    if(err) throw err;
    result.forEach(item => {
      item.groupName = item.groupName.replace(/\([^)]*\)/, '').trim();
    });
    const r = {
      collectionArtistList: result
    }
    console.log(r);
    res.status(200).send(r);
  })
});

//활성화한 컬렉션 정보 조회
app.get('/mypage/:userId/myCollection/:artistId/active', async (req, res)=>{
  const userId = req.params.userId;
  const artistId = req.params.artistId;
  const sql = `SELECT c.albumJacket, c.albumName, c.activeDateTime, c.photoCardQuant
              FROM collections c
              INNER JOIN UserCollections uc ON uc.albumName = c.albumName 
              INNER JOIN users u ON u.userId = uc.userId
              WHERE uc.userId = ? AND c.artistId = ?;`;
  con.query(sql, [userId, artistId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      activeCollectionList: result
    }
    res.status(200).send(r);
  })
});

//전체 컬렉션 정보 조회
app.get('/mypage/:userId/myCollection/:artistId/allCollection', async(req, res)=>{
  //const userId = req.params.userId;
  const artistId = req.params.artistId;
  const sql = `SELECT DISTINCT c.albumJacket, c.albumName
              FROM collections c
              WHERE c.artistId = ?;`;
  con.query(sql, [artistId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      allCollectionList: result
    }
    res.status(200).send(r);
  })
});

//선택한 컬렉션 전체 포토카드 정보 조회
app.get('/mypage/:userId/myCollection/:albumName/allPhotocard', async (req, res)=>{
  const userId = req.params.userId;
  //const artistId = req.params.artistId;
  const albumName = req.params.albumName;
  const sql = `SELECT pc.photocardId, pc.photocard, pc.version, pc.memberName
              FROM UserCollections uc
              INNER JOIN collections c ON uc.albumName = c.albumName
              INNER JOIN photoCards pc ON pc.albumName = uc.albumName
              INNER JOIN UserPhotoCards upc ON uc.userId = upc.userId
              WHERE uc.userId =?  AND uc.albumName=?;`;
    con.query(sql, [userId, albumName], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      collectionPhotocardList: result
    }
    res.status(200).send(r);
  })

});

//선택한 컬렉션 활성화된 포토카드 정보 조회
app.get('/mypage/:userId/myCollection/:albumName/activePhotocard', async (req, res)=>{
  const userId = req.params.userId;
  //const artistId = req.params.artistId;
  const albumName = req.params.albumName;
  const sql = `SELECT upc.photocardId, pc.photocard, pc.version, pc.memberName
              FROM UserPhotoCards upc
              INNER JOIN photoCards pc ON pc.photocardId = upc.photocardId
              WHERE upc.userId =? AND pc.albumName=?;`;
    con.query(sql, [userId, albumName], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      ActivePhotocardList: result
    }
    res.status(200).send(r);
  })
});

//아티스트 탭 정보 조회(도안이 하나라도 있는 경우)
app.get('/mypage/:userId/myPolaroid/artistTab', async(req, res)=>{
  const userId = req.params.userId;
  const sql =  `SELECT DISTINCT a.artistId, a.groupName FROM artists a
                INNER JOIN photoCards pc ON pc.enterComp = a.enterComp
                INNER JOIN Polaroids pl ON pl.photocardId = pc.photocardId
                WHERE pl.userUserId = ?`;
  con.query(sql, [userId], (err, result, fields)=>{
    if(err) throw err;
    result.forEach(item => {
      item.groupName = item.groupName.replace(/\([^)]*\)/, '').trim();
    });
    const r = {
      polaroidArtistTabList: result
    }
    res.status(200).send(r);
  })
});

//아티스트 별 활성화한 컬렉션 조회
app.get('/mypage/:userId/myPolaroid/:artistId/collection', async(req, res)=>{
  const userId = req.params.userId;
  const artistId = req.params.artistId;
  const sql = `SELECT c.albumJacket, c.albumName
              FROM collections c
              INNER JOIN UserCollections uc ON uc.albumName = c.albumName 
              INNER JOIN users u ON u.userId = uc.userId
              WHERE uc.userId = ? AND c.artistId = ?;`;
  con.query(sql, [userId, artistId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      collectionsList:result
    }
    res.status(200).send(r);
  })
});

// 컬렉션 별 도안 개수 조회
app.get('/mypage/:userId/myPolaroid/:albumName/polaroidQuant', async(req, res)=>{
  const userId = req.params.userId;
  const albumName = req.params.albumName;
  const sql =  `SELECT COUNT(*) AS polaroidBackupQuant
                FROM polaroidBackups plb
                INNER JOIN photoCards pc ON pc.photocardId = plb.photocardId
                WHERE plb.userId = ? AND pc.albumName = ?`;
  con.query(sql, [userId, albumName], (err, result, fields)=>{
    if(err) throw err;
    res.status(200).send(result[0]);
  })
})

//내 도안 보기
app.get('/mypage/:userId/myPolaroid/:albumName/polaroids', async(req, res)=>{
  const userId = req.params.userId;
  const albumName = req.params.albumName;
  const sql = `SELECT polaroidId, polaroid, saveDateTime
              FROM polaroidBackups plb
              INNER JOIN photoCards pc ON pc.photocardId = plb.photocardId
              WHERE plb.userId = ? AND pc.albumName = ?`;
  con.query(sql, [userId, albumName], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      myPolariodBackupList: result
    }
    res.status(200).send(r);
  })
});

//내 도안 삭제하기
app.delete('/mypage/:userId/myPolaroid/delete/:polaroidId', async(req, res)=>{
  const userId = req.params.userId;
  //const albumName = req.params.albumName;
  const polaroidId = req.params.polaroidId;
  const sql = `DELETE FROM polaroidBackups WHERE polaroidId = ?;`;
  con.query(sql, [polaroidId],(err, result, fields)=>{
    if(err) throw err;
    const msg = "백업 도안 삭제 완료"
    result.message = msg;
    res.status(200).send(result);
    console.log(result);
  } )
})

// 좋아요한 포스트 모아보기
app.get('/mypage/:userId/myLike', async(req, res)=>{
  const userId = req.params.userId;
  const sql = `SELECT DISTINCT p.postId, p.postDateTime, pl.polaroid, 
              pc.enterComp, pc.groupName, pc.memberName, pc.albumName,
              u.userId, u.nickname
              FROM Posts p
              INNER JOIN Polaroids pl ON pl.polaroidId = p.polaroidId
              INNER JOIN photoCards pc ON pl.photocardId = pc.photocardId
              INNER JOIN artists a ON a.groupName = pc.groupName
              INNER JOIN users u ON p.userId = u.userId
              INNER JOIN Likes l ON p.postId = l.postId
              WHERE l.userId = ?
              ORDER BY l.likeId DESC;`;
  con.query(sql, [userId], async (err, result, fields) => {
    if (err) throw err;
    
    const finalResult = [];

    for (let i = 0; i < result.length; i++) {
      const postId = result[i].postId;

      const sql2 = `SELECT l.postId, COUNT(*) AS likeQuant
                    FROM Likes l
                    WHERE l.postId = ?
                    GROUP BY l.postId
                    `;
      
      const likeQuantResult = await new Promise((resolve, reject) => {
        con.query(sql2, [postId], (err, result, fields) => {
          if (err) reject(err);
          resolve(result.length > 0 ? result[0].likeQuant : 0);
          // if (result.length > 0) {
          //   resolve(result[0].likeQuant);
          // } else {
          //   resolve(0);
          // }
          //만약 결과가 있고, likeQuant 속성이 있다면 해당 값을 사용하고, 그렇지 않으면 기본값으로 0을 사용한다
        });
      });

      const r = {
          ...result[i],
          likeQuant: likeQuantResult
      };

      finalResult.push(r);
    }
    const r = {
      myLikeList:finalResult
    }
    
    res.status(200).send(r);
  });
});

// // 좋아요한 포스트 좋아요 개수 조회
// app.get('/mypage/:userId/:postId/likeQuant', async(req, res)=>{
//   //const userId = req.params.userId;
//   const postId = req.params.postId;
//   const sql = `SELECT COUNT(*) AS postLikeQuant
//               FROM Likes
//               WHERE postId = ?`;
//   con.query(sql, [postId], (err, result, fields)=>{
//     if(err) throw err;
//     res.status(200).send(result[0]);
//   })
// })

// 포스트 좋아요 누르기
app.post('/post/:userId/:postId/updateLike', async(req, res)=>{
  try {
    const userId = req.params.userId;
    const postId = req.params.postId;

    // Use prepared statement to prevent SQL injection
    const sql = 'INSERT INTO Likes (userId, postId) VALUES ( ?, ?)';
    con.query(sql, [userId, postId], (err, result, fields) => {
      if (err) {
        // Handle SQL error
        console.error('SQL error:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Send a meaningful response to the client
      res.status(201).send({
        success: true,
        message: 'Like added successfully',
        data: result,
      });
    });
  } catch (error) {
    // Handle other errors
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

//포스트 좋아요 클릭 해제하기
app.delete('/post/notLike/:userId/:postId', async(req, res)=>{
  const postId = req.params.artistId;
  const userId = req.params.userId;
  const sql = `DELETE 
              FROM Likes
              WHERE (postId=? AND userId=?);
  `
  con.query(sql, [postId, userId], (err, result, fields)=>{
    if(err) throw err;
    const msg = "삭제 완료"
    result.message = msg;
    res.status(200).send(result);
    console.log(result);
  })
});

//아티스트 즐겨찾기 누르기
app.post('/community/:artistId/updateFavorite/:userId', async(req, res)=>{
  try {
    const userId = req.params.userId;
    const artistId = req.params.artistId;

    // Use prepared statement to prevent SQL injection
    const sql = 'INSERT INTO Favorites (userId, artistId) VALUES (?, ?)';
    con.query(sql, [userId, artistId], (err, result, fields) => {
      if (err) {
        // Handle SQL error
        console.error('SQL error:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      // Send a meaningful response to the client
      res.status(201).send({
        success: true,
        message: 'Favorite added successfully',
        data: result,
      });
    });
  } catch (error) {
    // Handle other errors
    console.error('Error:', error);
    res.status(500).send('Internal Server Error');
  }
})

//edit
//polaroid 도안 저장
app.post('/edit/save/:userId/:photocardId', upload.single('image'), async(req, res)=>{
  console.log("req.body", req.body);
  console.log("req.file", req.file);

  //req.file.buffer

  const imgName = randomImgName();
  const params = {
    Bucket: bucketName,
    Key: `polaroid/${imgName}`,
    //Body: req.file.buffer,
    Body: req.file.buffer,
    ACL: 'public-read',
    ContentType: req.file.mimetype
  }

  const command = new PutObjectCommand(params);
  await s3.send(command);
  console.log(command);

  let today = new Date();   

  let year = today.getFullYear();
  let month = today.getMonth() + 1; 
  let date = today.getDate(); 

  let nowdate = `${year}-${month}-${date}`;

  let hours = today.getHours(); 
  let minutes = today.getMinutes();  
  let seconds = today.getSeconds();  

  let time = `${hours}:${minutes}:${seconds}`;
  let dateTime = `${nowdate} ${time}`;
  console.log(dateTime);

  const image = `https://${process.env.BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/polaroid/${imgName}`;
  const userId = req.params.userId;
  const photocardId = req.params.photocardId;
  const sql = `INSERT into Polaroids( polaroidId, polaroid, saveDateTime, userUserId, photocardId)
              VALUES ( NULL, ?, ?, ?, ?)`;

  const sql2 = `INSERT into polaroidBackups ( polaroidId, polaroid, saveDateTime, userId, photocardId)
                  VALUES ( NULL, ?, ?, ?, ?)`;

  con.query(sql, [image, dateTime, userId, photocardId], (err, result1, fields) => {
    if (err) {
      throw err;
    }

    const msg = "도안 저장 완료";

    // 첫 번째 쿼리 결과를 처리하거나 필요에 따라 조정

    console.log(result1);

    con.query(sql2, [image, dateTime, userId, photocardId], (err, result2, fields) => {
      if (err) {
        throw err;
      }

      const backupMsg = "백업 도안 저장 완료";

      // 두 번째 쿼리 결과를 처리하거나 필요에 따라 조정

      console.log(result2);

      // 결합된 응답을 보냄
      const response = {
        originalResult: result1,
        backupResult: result2,
        message: `${msg} / ${backupMsg}`,
      };

      res.status(201).send(response);
      console.log(response);
    });
  });
});

//컬렉션 활성화
app.post('/mypage/:userId/myCollection/:albumName/collectionActivation', async(req, res)=>{
  const userId = req.params.userId;
  const albumName = req.params.albumName;
  const code = req.body.code;

  const sql = `INSERT INTO UserCollections
              VALUES (1, ?, ?)`;
  con.query( sql, [userId, albumName], (err, result, fields)=>{
    if(err) throw err;
    const msg = "컬렉션 활성화됨"
    result.message  = msg;
    res.status(201).send(result);
    console.log(result);
  })
});

//포토카드 랜덤 부여(활성화 임시 버전)
app.post('/mypage/:userId/myCollection/:albumName/cardActivationRandomly', async(req, res)=>{
  const userId = req.params.userId;
  const albumName = req.params.albumName;
  const sql = `SELECT photocardId
              FROM photoCards
              WHERE albumName = ?`
  con.query(sql, [albumName], (err, result, fields)=>{
    if(err) throw err;
    console.log(result);
    const randomIndex = getRandomInt(result.length);
    const randomCard = parseInt(result[randomIndex-1].photocardId);
    const sql2 = `INSERT UserPhotoCards
                  VALUES (1, ?, ?)`;
    con.query(sql2, [userId, randomCard], (err, result, fields)=>{
      if(err) throw err;
      
      const msg = "랜덤 포토카드 부여"
      result.message = msg;
      res.status(201).send(result);
      console.log(result);
    })
  })
});

app.listen(port, ()=>{
  console.log(`Example app listening on ${port}`);
});

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