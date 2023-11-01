import { DataTypes, Model, Sequelize } from "sequelize";

const sequelize = new Sequelize(
  'ohnpol',
  'root',
  '',
  {
    dialect: 'mysql',
    storage: 'ohnpol.db'
});



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
      photocard: DataTypes.STRING,
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
      albumJacket: DataTypes.STRING,
      photoCardQuant: DataTypes.INTEGER,
      activeDateTime: DataTypes.DATE,
      // artistId: {
      //   type: DataTypes.INTEGER,
      //   references: {
      //     model: Artist,  // Polaroid 모델을 참조
      //     key: 'artistId' // Polaroid 모델의 기본 키를 참조
      //   }
      // }
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

//포스트
class Post extends Model {
}
Post.init(
    {
      postId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
      },
      post: DataTypes.STRING,
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
    favoriteQuant: {
      type: DataTypes.INTEGER,
      // autoIncrement: true,
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

// 포토카드: 도안 = 일대일
Polaroid.belongsTo(PhotoCard, 
//   {
//   foreignKey: 'photocardId' 
// }
);
// 도안:포스트 = 일대일
Post.belongsTo(Polaroid);

// 아티스트:컬렉션 = 일대일
Collection.belongsTo(Artist, 
//   {
//   foreignKey: 'artistId'
// }
);

Polaroid.sync();
Post.sync();
Collection.sync();

// 컬렉션: 포토카드 = 일대다
Collection.hasMany(PhotoCard, {
  foreignKey: 'collectionId'
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
    photo: '',
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
    photo: '',
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
    photo: '',
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
    photo: '',
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

//-------favorite----------




//----------------------saved---------------------------------
// await BTS.save();
// await aespa.save();
// await IU.save();
// await newJeans.save();

// await userTemp.save();



