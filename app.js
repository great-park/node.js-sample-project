const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const nunjucks = require("nunjucks");
const dotenv = require("dotenv");

dotenv.config(); //process.env에 설정값들이 들어감
const pageRouter = require("./routes/page");

const app = express();
app.set("port", process.env.PORT || 8001); //배포할 때는 .env파일에 포트 번호 명시, 없다면 개발 환경인 8001으로 서버 실행
//템플릿 엔진 넌적스 설정
app.set("view engine", "html");
nunjucks.configure("views", {
  express: app,
  watch: true,
});

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
//세션 설정
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false,
    },
  })
);

app.use("/", pageRouter);

//모든 라우터 이후에 실시 -> 404
//다음 미들웨어인 에러 미들웨어로 넘어감
app.use((req, res, next) => {
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {}; //배포할 때는 빈 값 나오도록 설정/
  res.status(err.status || 500);
  res.render("error");
});

//포트에서 대기
app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기중");
});
