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

//await sequelize.sync({force: true});

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
        memberName: DataTypes.STRING,
        collectionQuant: DataTypes.INTEGER,
    }
    ,
    {
        sequelize,
        modelName: "artist", 
        timestamps: false
    }
);

//await sequelize.sync();
