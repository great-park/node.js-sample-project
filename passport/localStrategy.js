const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

const User = require("../models/user");

module.exports = () => {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email", //req.body.email
        passwordField: "password", //req.body.password
      },
      //done(서버 에러, 로그인 성공 시 유저 객체, 로그인 실패 시 에러 메시지)
      async (email, password, done) => {
        try {
          const exUser = await User.findOne({ where: { email } });
          //이메일이 있다면
          if (exUser) {
            //비밀번호 확인
            const result = await bcrypt.compare(password, exUser.password);

            //비밀번호 일치
            if (result) {
              done(null, exUser); //호출 시 auth.js의 'local' 다음 미들웨어로 간다.
            }
            //비밀번호 불일치
            else {
              done(null, false, { message: "비밀번호가 일치하지 않습니다." });
            }
          }
          //이메일이 없다면
          else {
            done(null, false, { message: "가입되지 않은 회원입니다." });
          }
        } catch (error) {
          console.error(error);
          done(error);
        }
      }
    )
  );
};
