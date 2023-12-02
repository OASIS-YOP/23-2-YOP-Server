import dotenv from 'dotenv';
import passport from 'passport';

import { Strategy as LocalStrategy } from 'passport-local';
import { ExtractJwt, Strategy as JWTStrategy } from 'passport-jwt';
import { User } from './db.js';
dotenv.config();

const JWTConfig = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET_KEY,
};

const JWTVerify = async (jwtPayload, done) => {
  try {
    // jwtPayload에 유저 정보가 담겨있다.
    // 해당 정보로 유저 식별 로직을 거친다.
		const user = await User.findOne({where: {email: jwtPayload.username}});
    // 유효한 유저라면
    if (user) {
      done(null, user);
      return;
    }
    // 유저가 유효하지 않다면
    done(null, false, { message: 'inaccurate token.' });
  } catch (error) {
    console.error(error);
    done(error);
  }
};

passport.use('jwt', new JWTStrategy(JWTConfig, JWTVerify));

// 토큰에 담길 유저명의 key를 지정하는 옵션. 패스워드도 지정할 수 있다.
const passportConfig = { usernameField: 'username', passwordField: 'password'};

passport.use(
  'signup',
  new LocalStrategy({ ...passportConfig, passReqToCallback: true }, async (req, username, password, done) => {
    // 유저 생성
    const nickname = req.body.nickname;
    console.log(nickname);
    const emailExist = await User.findAll({where:{ email: username}, raw: true});
    const nicknameExist = await User.findAll({where: {nickname: nickname}, raw: true});
		console.log("emailExist length", emailExist.length);
    console.log("nicknameExist length",nicknameExist.length);
    console.log("nicknameExist",nicknameExist);
    let user = false;
    if((emailExist.length===0) && (nicknameExist.length===0)){
      user = await User.create({ userId: null, 
			email: username, nickname: nickname, password: password, 
			avatar: "https://ohnpol.s3.ap-northeast-2.amazonaws.com/users/avatar.png", 
			biography: "자기소개", id: null });
    }
    console.log("userCreated?", user);
    // 성공하면
		if(user){
			return done(null, user);
		}
    // 실패하면 혹은 중복
		// if(!user){
		// 	return done(null, false, { message: 'User creation fail.' });
		// }
    
    if(!user && (emailExist.length > 0)){
      return done(null, false, {message: "이미 가입한 이메일입니다."})
    }
    if(!user && (nicknameExist.length > 0)){
      return done(null, false, {message: "닉네임이 중복됩니다."})
    }
  })
);

passport.use(
  'signin',
  new LocalStrategy(passportConfig, async (username, password, done) => {
    // 유저가 db 에 존재한다면
		const user = await User.findOne({where: {email: username, password: password}});
		if(user){
			return done(null, user, { message: 'Sign in Successful' });
		}
    // 없다면
		if(!user){
			return done(null, false, { message: 'Wrong password' });
		}
    
  })
);

export { passport };