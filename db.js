import { DataTypes, Model, Sequelize } from 'sequelize';
import { config } from "dotenv";
config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
  }
);


sequelize.authenticate().then(() => {
  console.log('Connection has been established successfully.');
}).catch((error) => {
  console.error('Unable to connect to the database: ', error);
});

//회원
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
await sequelize.sync();

//아티스트
class Artist extends Model {}
Artist.init(
    {
      artistId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
        photo: DataTypes.STRING,
        enterComp: DataTypes.STRING,
        groupName: DataTypes.STRING,
        memberNum: DataTypes.STRING,
        members: DataTypes.JSON,
        memberPhoto: DataTypes.JSON,
        collectionQuant: DataTypes.INTEGER,
    }
    ,
    {
        sequelize,
        modelName: "artist", 
        timestamps: false
    }
);
await sequelize.sync();

//포토카드
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
      },
      photocard: 
        {
          type: DataTypes.STRING,
          primaryKey: true,
        },
      albumName: DataTypes.STRING,
      enterComp: DataTypes.STRING,
      groupName: DataTypes.STRING
    }
    ,
    {
        sequelize,
        modelName: "photoCard", 
        timestamps: false
    }
);
await sequelize.sync();

//컬렉션
class Collection extends Model {
}
Collection.init(
    {
      albumName: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      albumJacket: DataTypes.STRING,
      photoCardQuant: DataTypes.INTEGER,
      activeDateTime: DataTypes.DATE,
      activationCode: DataTypes.STRING
    }
    ,
    {
        sequelize,
        modelName: "collection", 
        timestamps: false
    }
);
await sequelize.sync();

//도안
class Polaroid extends Model {
}
Polaroid.init(
    {
      polaroidId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      polaroid: DataTypes.STRING,
      saveDateTime: DataTypes.DATE,
      // photocardId: {
      //   type: DataTypes.INTEGER,
      //   references: {
      //     model: PhotoCard,  // Polaroid 모델을 참조
      //     key: 'photocardId' // Polaroid 모델의 기본 키를 참조
      //   }
      // }
    }
    ,
    {
        sequelize,
        modelName: "Polaroid", 
        timestamps: false
    }
);
await sequelize.sync();

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
      // polaroidId: {
      //   type: DataTypes.INTEGER,
      //   references: {
      //     model: Polaroid,  // Polaroid 모델을 참조
      //     key: 'polaroidId' // Polaroid 모델의 기본 키를 참조
      //   }
      // }
    }
    ,
    {
        sequelize,
        modelName: "Post", 
        timestamps: false
    }
);
await sequelize.sync();

// 릴레이션
// 회원 : 도안 = 일대다
User.hasMany(Polaroid);
Polaroid.belongsTo(User);

// 회원: 포스트 = 일대다
User.hasMany(Post, {
  foreignKey: 'userId'
})
Post.belongsTo(User,{
  foreignKey: 'userId'
});
await sequelize.sync();

// 좋아요 ( 회원: 포스트 = 다대다)
class Like extends Model {
}
Like.init(
  {
    likeQuant: {
      type: DataTypes.INTEGER,
      //autoIncrement: true,
    }
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
});

Post.belongsToMany(User, {
  through: 'Like',
  foreignKey: 'postId',
});
await sequelize.sync();

// 즐겨찾기 (회원: 아티스트 = 다대다)
class Favorite extends Model {
}
Favorite.init(
  {
    favoriteQuant: {
      type: DataTypes.INTEGER,
      //autoIncrement: true,
    }
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
});

Artist.belongsToMany(User, {
  through: 'Favorite',
  foreignKey: 'artistId',
});
await sequelize.sync();

// 포토카드
User.hasMany(PhotoCard, {
  foreignKey: 'userId'
});
PhotoCard.belongsTo(User,{
  foreignKey:'userId'
})
// 컬렉션
User.hasMany(Collection, {
  foreignKey: 'userId'
});
Collection.hasMany(User,{
  foreignKey: 'userId'
});

// 포토카드: 도안 = 일대일
Polaroid.belongsTo(PhotoCard, 
  {
  foreignKey: 'photocardMemberName' 
}
);
// 도안:포스트 = 일대일
Post.belongsTo(Polaroid,
  {
    foreignKey: 'polaroidId' 
});

// 아티스트: 컬렉션 = 일대다
Artist.hasMany(Collection,{
  foreignKey: 'artistId'
});
Collection.belongsTo(Artist,{
  foreignKey: 'artistId'
});

// 컬렉션: 포토카드 = 일대다
Collection.hasMany(PhotoCard,{
  foreignKey: 'collectionId'
});
PhotoCard.belongsTo(Collection,{
  foreignKey: 'collectionId'
});

await sequelize.sync();

// 회원: 컬렉션 = 다대다
class UserCollection extends Model {
}
UserCollection.init(
  {
    collectionQuant: {
      type: DataTypes.INTEGER,
      // autoIncrement: true,
    }
  },
  {
      sequelize,
      modelName: "UserCollection", 
      timestamps: false
  }
);

User.belongsToMany(Collection, {
  through: 'UserCollection',
  foreignKey: 'userId',
});
Collection.belongsToMany(User, {
  through: 'UserCollection',
  foreignKey: 'albumName',
});
await sequelize.sync();

// 회원: 포토카드 = 다대다
class UserPhotoCard extends Model {
}
UserPhotoCard.init(
  {
    collectionQuant: {
      type: DataTypes.INTEGER,
      // autoIncrement: true,
    }
  },
  {
      sequelize,
      modelName: "UserPhotoCard", 
      timestamps: false
  }
);

User.belongsToMany(PhotoCard, {
  through: 'UserPhotoCard',
  foreignKey: 'userId',
});
PhotoCard.belongsToMany(User, {
  through: 'UserPhotoCard',
  foreignKey: 'photoCardId',
});
await sequelize.sync();

// //----일대일----
// Polaroid.sync();
// Post.sync();
// Collection.sync();
// User.sync();
// PhotoCard.sync();
// Artist.sync();

// //------------------EXPORT---------------------
// // export { Artist, 
// //   Collection, 
// //   Favorite, 
// //   Like, 
// //   PhotoCard, 
// //   Polaroid, 
// //   Post, 
// //   User}





// //-------------------DATA-----------------------
// // const jane = User.build({ firstName: "Jane", lastName: "Doe" });

// // // "jane" has not been saved to the database yet!
// // // You can change any of its properties here, and call `save()` later to persist them all at once.

// // await jane.save();

// // // "jane" is now saved to the database!

// ------artist-------
const BTS = Artist.build(
  {
    // artistId: 1,
    photo: 'https://ohnpol.s3.ap-northeast-2.amazonaws.com/artist/bts.jpg',
    enterComp: '빅히트 엔터테인먼트(Big Hit Entertainment)',
    groupName: '방탄소년단(BTS)',
    memberNum: 7,
    members: {
      "name": ["정국", "뷔", "지민", "슈가", "진","RM", "제이홉"],
    },
    memberPhoto: 
      [
        {
          "name": "정국",
          "memphoto":""
        },
        {
          "name": "뷔",
          "memphoto":""
        },
        {
          "name": "지민",
          "memphoto":""
        },
        {
          "name": "슈가",
          "memphoto":""
        },
        {
          "name": "진",
          "memphoto":""
        },
        {
          "name": "RM",
          "memphoto":""
        },
        {
          "name": "제이홉",
          "memphoto":""
        }
      ]
    ,
    collectionQuant: 18
  }
);

const aespa = Artist.build(
  {
    // artistId: 2,
    photo: 'https://ohnpol.s3.ap-northeast-2.amazonaws.com/artist/aespa.jpeg',
    enterComp: '에스엠 엔터테인먼트(SM Entertainment)',
    groupName: '에스파(aespa)',
    memberNum: 4,
    members: {
      "name": ["카리나", "닝닝", "윈터", "지젤"],
    },
    memberPhoto: 
      [
        {
          "name": "카리나",
          "memphoto":""
        },
        {
          "name": "닝닝",
          "memphoto":""
        },
        {
          "name": "윈터",
          "memphoto":""
        },
        {
          "name": "지젤",
          "memphoto":""
        }
      ]
    ,
    collectionQuant: 6
})

const IU = Artist.build(
  {
    // artistId: 3,
    photo: 'https://ohnpol.s3.ap-northeast-2.amazonaws.com/artist/IU.png',
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
    photo: 'https://ohnpol.s3.ap-northeast-2.amazonaws.com/artist/NewJeans.jpeg',
    enterComp: '어도어 엔터테인먼트(ADOR Entertainment)',
    groupName: '뉴진스(New Jeans)',
    memberNum: 4,
    members: {
      "name": ["다니엘", "민지", "해린", "하니"],
    },
    memberPhoto: 
      [
        {
          "name": "다니엘",
          "memphoto":""
        },
        {
          "name": "민지",
          "memphoto":""
        },
        {
          "name": "해린",
          "memphoto":""
        },
        {
          "name": "하니",
          "memphoto":""
        }
      ]
    ,
    collectionQuant: 3
})


// ------collection-------
// ------Photocard-----------
const pc1 = PhotoCard.build({
  memberName: '민지',
  version: 'A',
  photocard: 'fff',
  albumName: 'GET UP(The 2nd EP)',
  enterComp: '어도어 엔터테인먼트(ADOR Entertainment)',
  groupName: '뉴진스(New Jeans)',
  userId:1
})
// const pc2 = PhotoCard.build({
//   memberName: '하니',
//   version: 'A',
//   photocard: 'ff',
//   albumName: 'GET UP(The 2nd EP)',
//   enterComp: '어도어 엔터테인먼트(ADOR Entertainment)',
//   groupName: '뉴진스(New Jeans)'
// })
// const pc3 = PhotoCard.build({
//   memberName: '지민',
//   version: 'A',
//   photocard: 'f',
//   albumName: '[싱글] <Butter>',
//   enterComp: '빅히트 엔터테인먼트(Big Hit Entertainment)',
//   groupName: '방탄소년단(BTS)'
// })
// ------Polaroid-----------
const pol1 = Polaroid.build({
  polaroidId:1,
  polaroid:'https://ohnpol.s3.ap-northeast-2.amazonaws.com/polaroid/YOP_1.png',
  saveDateTime: '2023-11-12 00:00:01'
})
// const pol2 = Polaroid.build({
//   polaroidId:2,
//   polaroid:'https://ohnpol.s3.ap-northeast-2.amazonaws.com/polaroid/YOP_2.png',
//   saveDateTime: '2023-11-12 00:00:22'
// })
// const pol3 = Polaroid.build({
//   polaroidId:3,
//   polaroid:'https://ohnpol.s3.ap-northeast-2.amazonaws.com/polaroid/YOPdd.png',
//   saveDateTime: '2023-11-12 00:00:33'
// })
// ------Post-----------
const post1 = Post.build({
  postId:1,
  post:'',
  postDateTime: '2023-11-23 00:00:01' ,
  userId: 1,
  
  polaroidId: 1
})

// const post2 = Post.build({
//   postId:2,
//   post:'',
//   postDateTime: '2023-11-23 00:00:22' ,
//   userId: 1,
  
//   PolaroidPolaroidId: 2
// })

// const post3 = Post.build({
//   postId:3,
//   post:'',
//   postDateTime: '2023-11-23 00:00:33' ,
//   userId: 1,
  
//   PolaroidPolaroidId: 3
// })

//-------user----------
const userTemp = User.build(
  {
    // userId: 1,
    email: 'ohnpol1004@naver.com',
    nickname: 'ohnpol1004',
    password: '1111',
    avatar: 'https://ohnpol.s3.ap-northeast-2.amazonaws.com/users/avatar.png',
    biography: '자기소개'
})

//-------favorite----------

const fav1 = Favorite.build(
  {
    favoriteQuant: 1,
    userId: 1,
    artistId: 1
  }
)
//------like---------------
const like1 = Like.build({
  likeQuant: 1,
  userId:1,
  postId:1
})

//----------------------saved---------------------------------
// await BTS.save();
// await aespa.save();
// await IU.save();
// await newJeans.save();

// await userTemp.save();

// await fav1.save();


// await pc1.save();
// // await pc2.save();
// // await pc3.save();
// await pol1.save();
// // await pol2.save();
// // await pol3.save();
// await post1.save();
// await post2.save();
// await post3.save();

// // await like1.save();

//---------------------drop------------------------------------
// await sequelize.drop();
// console.log('All tables dropped!');

// await Collection.truncate();
// await Artist.truncate();


