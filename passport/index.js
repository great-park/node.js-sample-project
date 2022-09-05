const passport = require("passport");
const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const User = require("../models/user");

//전략 : 로그인을 어떻게 할 지 적어둔 것
module.exports = () => {
  //메모리에 id만 저장하기 위해 serialize, deserialize 작성

  passport.serializeUser((user, done) => {
    done(null, user.id); // 세션에 user의 id만 저장, 메모리 효율을 위함
  });

  //세션 - 메모리에 저장됨, 메모리용 db 만들기도 함
  //{ id:3, 'connect.sid' : s%1231241230123} <-여기있는 문자열이 쿠키

  passport.deserializeUser((id, done) => {
    User.findOne({ where: { id } }) //찾아서
      .then((user) => done(null, user)) //필요하면 다시 user가져오기 -> req.user로 접근 가능, req.isAuthenticated() : 로그인 했다면 true 반환
      .catch((err) => done(err));
  });

  local();
  kakao();
};
