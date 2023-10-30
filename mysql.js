import mysql from 'mysql';
import { DataTypes, Model, Sequelize } from "sequelize";

const sequelize = new Sequelize(
  'ohnpol',
  'root',
  '',
  {
    dialect: 'mysql',
    storage: 'ohnpol.db'
});

// const connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : '',
//   database : 'ohnpol'
// });

// connection.connect();

// connection.query('SELECT * from topic', (error, results, fields)=> {
//   if (error){
//     console.log(error);
//   };
//   console.log(results);
// });

// connection.end();

sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((error) => {
  console.error('Unable to connect to the database: ', error);
});

//회원
//userId, email, nickname, password, avatar, biography
class User extends Model {}
User.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
        email: DataTypes.STRING,
        nickname: DataTypes.STRING,
        password: DataTypes.STRING,
        avatar: DataTypes.STRING,
        biography: DataTypes.TEXT,
    }
    ,
    {
        sequelize, 
        modelName: "user", 
        timestamps: false
    }
);


//아티스트
//artistId, enterComp, groupName, memberNum, members, photo, collectionQuant
class Artist extends Model {}
Artist.init(
    {
      artistId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
        enterComp: DataTypes.STRING,
        groupName: DataTypes.STRING,
        memberNum: DataTypes.INTEGER,
        members: DataTypes.JSON,
        photo: DataTypes.STRING,
        collectionQuant: DataTypes.INTEGER,
    }
    ,
    {
        sequelize,
        modelName: "artist", 
        timestamps: false
    }
);



//포토카드
//enterComp, groupName, memberName, albumName, version
class PhotoCard extends Model {
}
PhotoCard.init(
    {
      memberName: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      version: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      albumName: DataTypes.STRING,
      enterComp: DataTypes.STRING,
      groupName: DataTypes.STRING,
      activeDateTime: DataTypes.DATE
    }
    ,
    {
        sequelize,
        modelName: "photoCard", 
        timestamps: false
    }
);

//컬렉션
//enterComp, groupName, memberName, albumName, version
class Collection extends Model {
}
Collection.init(
    {
      albumName: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      photoCardQuant: DataTypes.INTEGER,
      activeDateTime: DataTypes.DATE
    }
    ,
    {
        sequelize,
        modelName: "collection", 
        timestamps: false
    }
);

//도안
class Polaroid extends Model {
}
Polaroid.init(
    {
      polaroidId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      saveDateTime: DataTypes.DATE,
    }
    ,
    {
        sequelize,
        modelName: "Polaroid", 
        timestamps: false
    }
);

//포스트
class Post extends Model {
}
Post.init(
    {
      postId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      postDateTime: DataTypes.DATE,
    }
    ,
    {
        sequelize,
        modelName: "Post", 
        timestamps: false
    }
);

// 릴레이션
// 회원 : 도안 = 일대다
User.hasMany(Polaroid, {
  foreignKey: 'userId'
})

// 회원: 포스트 = 일대다
User.hasMany(Post, {
  foreignKey: 'userId'
})

// 좋아요 ( 회원: 포스트 = 다대다)
class Like extends Model {
}
Like.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User, 
        key: 'id'
      }
    },
    postId: {
      type: DataTypes.INTEGER,
      references: {
        model: Post,
        key: 'id'
      }
    },
    likeNum: DataTypes.INTEGER,
  }
  ,
  {
      sequelize,
      modelName: "Like", 
      timestamps: false
  }
);

User.belongsToMany(Post, {
  through: 'Like',
  })
Post.belongsToMany(User, {
  through: 'Like',
  })



// 즐겨찾기 (회원: 아티스트 = 다대다)
class Favorite extends Model {
}
Favorite.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      references: {
        model: User, 
        key: 'id'
      }
    },
    artistId: {
      type: DataTypes.INTEGER,
      references: {
        model: Artist,
        key: 'id'
      }
    },
    favoriteNum: DataTypes.INTEGER,
  }
  ,
  {
      sequelize,
      modelName: "favorite", 
      timestamps: false
  }
);

User.belongsToMany(Artist, {
  through: 'Favorite',
  })
Artist.belongsToMany(User, {
  through: 'Favorite',
  })


// 포토카드
User.hasMany(PhotoCard, {
  foreignKey: 'userId'
})
// 컬렉션
User.hasMany(Collection, {
  foreignKey: 'userId'
})



//---------DATA------------------------------
// 아티스트 
Artist.create({
  userId: '1',
  enterComp: 'Big Hit Entertainment',
  groupName: '방탄소년단',
  memberNum: 7,
  members: {
    "group" : "방탄소년단",
    "member" : ["정국", "뷔", "지민", "슈가", "진", "RM", "제이홉"]
  },
  collectionQuant: 18
})
.then(result => {
  res.json(result);
})
.catch(err => {
  console.error(err);
});

Artist.create({
  userId: '2',
  enterComp: 'SM Entertainment',
  groupName: '에스파',
  memberNum: 4,
  members: {
    "group" : "에스파",
    "member" : ["카리나", "윈터", "지젤", "닝닝"]
  },
  collectionQuant: 6
})
.then(result => {
  res.json(result);
})
.catch(err => {
  console.error(err);
});

Artist.create({
  userId: '3',
  enterComp: 'ADOR Entertainment',
  groupName: '뉴진스',
  memberNum: 4,
  members: {
    "group" : "뉴진스",
    "member" : ["하니", "해린", "민지", "다니엘"]
  },
  collectionQuant: 3
})
.then(result => {
  res.json(result);
})
.catch(err => {
  console.error(err);
});

Artist.create({
  userId: '4',
  enterComp: 'EDAM Entertainment',
  groupName: '아이유',
  memberNum: 1,
  members: {
    "group" : "아이유",
    "member" : ["아이유"]
  },
  collectionQuant: 16
})
.then(result => {
  res.json(result);
})
.catch(err => {
  console.error(err);
});


// Dummy data
// 유저
User.create({userID: '1', email: 'ohnpol1004@naver.com', nickname: 'ohnpol1004', 
  password: '1234', avatar: '', biography: '자기소개'
})
.then(result => {
  res.json(result);
})
.catch(err => {
  console.error(err);
});

  //await sequelize.sync({alter:true});
//await sequelize.sync();