const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const { isLoggedIn, isNotLoggedIn } = require("./middlewares");
const User = require("../models/user");

const router = express.Router();

router.post("/join", isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect("/join?error=exist"); //error를 쿼리스트링으로 전달
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect("/");
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post("/login", isNotLoggedIn, (req, res, next) => {
  //미들웨어 확장 패턴 6장
  //먼저 localStrategy를 찾는다. local()
  passport.authenticate("local", (authError, user, info) => {
    //done()함수 호출 이후 (서버에러, 로그인 성공 시 유저, 실패 메시지)
    if (authError) {
      console.error(authError);
      return next(authError);
    }
    if (!user) {
      return res.redirect(`/?loginError=${info.message}`);
    }
    //로그인 성공 경우 여기로
    //req.login -> passport/index.js로 이동 -> serializeUser실행
    //그 안에 done()실행 이후 다시 여기로
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      // + 세션 쿠키를 브라우저로 전송한다.
      return res.redirect("/"); // @ 로그인 성공 완료 @
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

//세션 삭제
router.get("/logout", isLoggedIn, (req, res) => {
  req.logout();
  req.session.destroy();
  res.redirect("/");
});

//카카오 로그인 -> kakaoStrategy로 이동(실제 웹에서 카카오 로그인) 첫번째 실행
router.get("/kakao", passport.authenticate("kakao"));

//카카오 로그인 성공하면 카카오가 리다이렉트 설정한 url로 요청을 쏴주고, 우리는 data를 받게 된다.
//받은 데이터로  passport.authenticate 실행
//두번째 실행 -> 그 다음 콜백이 실행되어 회원가입 유무에 따라 로그인 실행
router.get(
  "/kakao/callback",
  passport.authenticate("kakao", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("/");
  }
);

module.exports = router;
