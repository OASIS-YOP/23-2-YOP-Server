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

User.hasMany(PhotoCard);

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
User.belongsToMany(Post, {
  through: 'Like',
  })
Post.belongsToMany(User, {
  through: 'Like',
  })

class Like extends Model {
}
Like.init(
    {
      likeDateTime: DataTypes.DATE,
    }
    ,
    {
        sequelize,
        modelName: "Like", 
        timestamps: false
    }
);


// 즐겨찾기 (회원: 아티스트 = 다대다)
User.belongsToMany(Artist, {
  through: 'Like',
  })
Artist.belongsToMany(User, {
  through: 'Like',
  })

class Favorite extends Model {
}
Favorite.init(
    {
      favoriteDateTime: DataTypes.DATE,
    }
    ,
    {
        sequelize,
        modelName: "Favorite", 
        timestamps: false
    }
);

await sequelize.sync({force: true});