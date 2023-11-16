import bodyParser from 'body-parser';
import express from 'express';
import cors from 'cors';
import { swaggerUi, specs } from './modules/swagger.js';
import con from './mysql.js';
// import { Artist, 
//   Favorite, 
//   Collection, 
//   Like,
//   PhotoCard,
//   Polaroid,
//   Post,
//   User } from './db.js';

const app = express();
const port = 3000;
app.use(bodyParser.json());
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
};
app.use(cors(corsOptions));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))


const getRandomInt = (max) => {
  return Math.floor(Math.random() * max);
}

app.get('/', async(req, res)=>{
  res.send('Hello World!');
})

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
      favArtist: result // 여기에서 result는 변수명입니다. 원하는 결과 데이터로 대체되어야 합니다.
    };
    res.status(200).send(r);
  })
});

//hot10
app.get('/mainpage/:userId/hot10', async (req, res) => {
  const hotPostsQuery = `SELECT postId, COUNT(likeQuant) AS likeCount
                          FROM Likes
                          GROUP BY postId
                          ORDER BY likeCount DESC
                          LIMIT 10;`;

  try {
    const hotPosts = await new Promise((resolve, reject) => {
      con.query(hotPostsQuery, (err, result, fields) => {
        if (err) reject(err);
        resolve(result);
        console.log('1: ', result);
      });
    });

    const getPostDetails = async (postId) => {
      const postDetailsQuery = `SELECT 
                                  pc.photocard,
                                  pc.enterComp,
                                  pc.groupName,
                                  pc.memberName,
                                  pc.albumName,
                                  l.postId,
                                FROM Likes l
                                INNER JOIN Posts p ON l.postId = p.postId
                                INNER JOIN Polaroids pl ON p.polaroidId = pl.polaroidId
                                INNER JOIN photoCards pc ON pl.photocardMemberName = pc.memberName
                                WHERE l.postId = ?;`;

      return new Promise((resolve, reject) => {
        con.query(postDetailsQuery, [postId], (err, result, fields) => {
          if (err) reject(err);
          resolve(result);
          console.log('2: ', result);
        });
      });
    };

    const finalResult = [];

    for (let i = 0; i < hotPosts.length; i++) {
      const postDetails = await getPostDetails(hotPosts[i].postId);
      finalResult.push(postDetails);
    }

    console.log(finalResult);
    res.status(200).send(finalResult);
    console.log('3: ', finalResult);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});


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
  const sql = `SELECT COUNT(*)
                FROM Favorites
              WHERE artistId = ?; `;
  con.query(sql,[artistId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      ArtistFavoriteQuant: result[0]
    };

    res.status(200).send(r);
  });
});

//아티스트 즐겨찾기 해제
app.delete('/community/:artistId/notFavorite/:userId', async(req,res)=>{
  const artistId = req.params.artistId;
  const userId = req.params.userId;
  const sql = `DELETE 
              FROM Likes
              WHERE (artistId=? AND userID=?);
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

//아티스트 멤버별 이름 및 사진 조회
// app.get('/community/:artistId/members', async (req, res) => {
//   const artistId = req.params.artistId; 
//   const sql = `SELECT 
//                 memberNum,
//                 memberPhoto
//               FROM artists
//               WHERE artistId = ?; `;
//   con.query(sql,1, (err, result, fields)=>{
//     if(err) throw err;
//     for(let i=0; i<memberNum; i++){
//       const namdAndPhoto = {
//         name: memberPhoto[i].name,
//         memPhoto: memberPhoto[i].memPhoto
//       }
//     }
//     const r = nameAndPhoto;
//     res.status(200).send(r);
//     console.log("멤버별 이름과 사진", result);
//   })
// });
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
app.get('/community/:memberName/membersPost', async (req, res) => { 
  const memberName = req.params.memberName;
  const sql = `SELECT 
                p.postId,
                pl.polaroid,
                p.userId,
                pc.enterComp,
                pc.groupName,
                pc.memberName,
                pc.albumName,
                u.nickname
              FROM Posts p
              INNER JOIN users u ON p.userId = u.userId
              INNER JOIN Polaroids pl ON p.polaroidId = pl.polaroidId
              INNER JOIN photoCards pc ON pc.memberName = pl.photocardMemberName
              WHERE  pc.memberName = ?; `;
  con.query(sql,[memberName], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      memberPostList: result
    };
    res.status(200).send(r);
  })
});

// 아티스트 멤버 별 도안 좋아요 수 조회
app.get('/community/:memberName/memberPost/:postId/like', async(req, res)=>{
  const memberName = req.params.memberName;
  const postId = req.params.postId;
  const sql = `SELECT postId, COUNT(*) AS likeQuant
              FROM Likes
              WHERE postId = ?;`;
  con.query( sql, [postId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      postLikeQuantList: result
    }
    res.status(200).send(r);
  })
});

//아티스트 전체 도안 조회
app.get('/community/:artistId/allPost', async (req, res) => {
  const artistId = req.params.artistId; 
  const sql = `SELECT 
                a.artistId,
                p.postId,
                pl.polaroid,
                p.userId,
                pc.enterComp,
                pc.groupName,
                pc.memberName,
                pc.albumName,
                u.nickname
              FROM artists a
              INNER JOIN photoCards pc ON pc.enterComp = a.enterComp
              INNER JOIN Polaroids pl ON pc.memberName = pl.photocardMemberName
              INNER JOIN Posts p ON p.polaroidId = pl.polaroidId
              INNER JOIN users u ON p.userId = u.userId
              WHERE artistId = ?; `
  con.query(sql,[artistId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      allPostList: result
    };
    res.status(200).send(r);
    console.log("아티스트 전체 도안", result);
  })
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


//도안 게시 - 컬렉션 선택
app.get('/community/:userId/uploadPost/collection', async (req, res) => {
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

//도안 게시 - 도안 선택
app.get('/community/:artistId/uploadPost/post', async (req, res) => {
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
                INNER JOIN photoCards pc ON pl.photocardMemberName = pc.memberName
                INNER JOIN artists a ON a.groupName = pc.groupName
                WHERE p.userId = ?;
              `;
  con.query(sql, [userId], (err, result, fields)=>{
    if(err) throw err;
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
              u.nickname, u.userId
              FROM Posts p
              INNER JOIN Polaroids pl ON pl.polaroidId = p.polaroidId
              INNER JOIN photoCards pc ON pl.photocardMemberName = pc.memberName
              INNER JOIN artists a ON a.groupName = pc.groupName
              INNER JOIN users u ON p.userId = u.userId
              WHERE p.userId = ? AND a.artistId=?;`;
  con.query(sql, [userId, artistId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      postOfArtistList: result
    }
    res.status(200).send(r);
    console.log(r);
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
  const sql = `SELECT albumJacket, albumName, activeDateTime, photoCardQuant
              FROM collections c
              INNER JOIN UserCollections uc ON uc.albumName = c.albumName 
              INNER JOIN users a ON u.userId = uc.userId
              WHERE userId = ? AND artistId = ?;`;
  con.query(sql, [userId, artistId], (err, result, fields)=>{
    if(err) throw err;
    const r = {
      activeCollectionList: result
    }
    res.status(200).send(r);
  })
});

//비활성화 컬렉션 정보 조회
app.get('/mypage/:userId/myCollection/:artistId/notActive', async(req, res)=>{
  const userId = req.params.userId;
  const artistId = req.params.artistId;
});

//선택한 컬렉션 정보 조회
app.get('/mypage/:userId/myCollection/:artistId/:collectionId', async (req, res)=>{
  const userId = req.params.userId;
  const artistId = req.params.artistId;
  const collectionId = req.params.collectionId;
  const sql = `SELECT ;`;

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