const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development"; //없으면 development로
const config = require("../config/config")[env];
const User = require("./user");
const Post = require("./post");
const Hashtag = require("./hashtag");

const db = {};
//연결 객체
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.User = User;
db.Post = Post;
db.Hashtag = Hashtag;

User.init(sequelize);
Post.init(sequelize);
Hashtag.init(sequelize);

User.associate(db);
Post.associate(db);
Hashtag.associate(db);

module.exports = db;
