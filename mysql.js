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
//   host     : '3.34.95.156',
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
//artistId, enterComp, groupName, memberName, collectionQuant
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
        memberNum: DataTypes.STRING,
        members: DataTypes.JSON,
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
    // userId: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: User, 
    //     key: 'userId'
    //   }
    // },
    // postId: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: Post,
    //     key: 'postId'
    //   }
    // },
    likeQuant: DataTypes.INTEGER,
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
  foreignKey: 'userId',
  })
Post.belongsToMany(User, {
  through: 'Like',
  foreignKey: 'postId',
  })



// 즐겨찾기 (회원: 아티스트 = 다대다)
class Favorite extends Model {
}
Favorite.init(
  {
    // userId: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: User, 
    //     key: 'userId'
    //   }
    // },
    // artistId: {
    //   type: DataTypes.INTEGER,
    //   references: {
    //     model: Artist,
    //     key: 'artistId'
    //   }
    // },
    favoriteQuant: DataTypes.INTEGER,
  }
  ,
  {
      sequelize,
      modelName: "Favorite", 
      timestamps: false
  }
);

User.belongsToMany(Artist, {
  through: 'Favorite',
  foreignKey: 'userId',
  })
Artist.belongsToMany(User, {
  through: 'Favorite',
  foreignKey: 'artistId',
  })


// 포토카드
User.hasMany(PhotoCard, {
  foreignKey: 'userId'
})
// 컬렉션
User.hasMany(Collection, {
  foreignKey: 'userId'
})


//await sequelize.sync({alter:true});
await sequelize.sync();


//-------------------DATA-----------------------
// const jane = User.build({ firstName: "Jane", lastName: "Doe" });

// // "jane" has not been saved to the database yet!
// // You can change any of its properties here, and call `save()` later to persist them all at once.

// await jane.save();

// // "jane" is now saved to the database!

// ------artist-------
const BTS = Artist.build(
  {
    // artistId: 1,
    enterComp: '빅히트 엔터테인먼트(Big Hit Entertainment)',
    groupName: '방탄소년단(BTS)',
    memberNum: 7,
    members: {
      "name": ["정국", "뷔", "지민", "슈가", "진","RM", "제이홉"],
    },
    collectionQuant: 18
  }
);

const aespa = Artist.build(
  {
    // artistId: 2,
    enterComp: '에스엠 엔터테인먼트(SM Entertainment)',
    groupName: '에스파(aespa)',
    memberNum: 4,
    members: {
      "name": ["카리나", "닝닝", "윈터", "지젤"],
    },
    collectionQuant: 6
})

const IU = Artist.build(
  {
    // artistId: 3,
    enterComp: '이담 엔터테인먼트(EDAM Entertainment)',
    groupName: '아이유(IU)',
    memberNum: 1,
    members: {
      "name": ["아이유"],
    },
    collectionQuant: 16
})

const newJeans = Artist.build(
  {
    // artistId: 4,
    enterComp: '어도어 엔터테인먼트(ADOR Entertainment)',
    groupName: '뉴진스(New Jeans)',
    memberNum: 4,
    members: {
      "name": ["다니엘", "민지", "해린", "하니"],
    },
    collectionQuant: 3
})


// ------collection-------

//-------user----------
const userTemp = User.build(
  {
    // userId: 1,
    email: 'ohnpol1004@naver.com',
    nickname: 'ohnpol1004',
    password: '1111',
    avatar: '',
    biography: '자기소개'
})




// await BTS.save();
// await aespa.save();
// await IU.save();
// await newJeans.save();
await userTemp.save();

