const express = require("express");
const { engine } = require("express-handlebars");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const adm = require("./routes/adm");
const user = require("./routes/user");
const app = express();
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const {isAdmin} = require("./helpers/isAdmin");
const db = require("./config/db");
require("./models/Postagem");
const Postagem = mongoose.model("postagem");
require("./models/Categoria");
const Categoria = mongoose.model("categoria");
require("./config/auth").default(passport);
//Configurações
//Session

app.use(
  session({
    secret: "seu-segredo-aqui",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

//Flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});
//Body Parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//Handlebars
app.engine("handlebars", engine({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//Mongoose
mongoose
  .connect(db.mongoURI)
  .then(console.log("Sucesso"))
  .catch((err) => console.log(err));

//Public
app.use(express.static(path.join(__dirname, "public")));

//Rotas
app.get('/', async (req, res) => {
  try {
    let postagens = [];

    // Só busca postagens para quem está logado
    if (req.isAuthenticated && req.isAuthenticated()) {
      postagens = await Postagem.find({ autor: req.user.id })
        .lean()
        .populate('categoria')
        .sort({ data: 'desc' });
    }

    res.render('home_page/index', { postagens });
  } catch (err) {
    req.flash('error_msg', 'Houve um erro ao carregar a página');
    res.redirect('/404');
  }
});


app.get("/postagens/:slug", (req, res) => {
  Postagem.findOne({ slug: req.params.slug })
    .lean()
    .then((postagens) => {
      if (postagens) {
        res.render("postagem/index", { postagens: postagens });
      } else {
        res.redirect("/");
        req.flash("error_msg", "Nenhuma resultado encontrado");
      }
    })
    .catch((err) => {
      req.flash("error_msg", "Houve um erro interno");
      res.redirect("/");
    });
});

app.get("/categorias", isAdmin,(req, res) => {
  Categoria.find({autor:req.user.id})
    .lean()
    .then((categorias) => {
      res.render("categorias/index", { categorias: categorias });
    })
    .catch(() => {
      req.flash("error_msg", "Erro ao listar categorias");
      res.redirect("/");
    });
});

app.get("/categorias/:slug", (req, res) => {
  Categoria.findOne({ slug: req.params.slug })
    .lean()
    .then((categoria) => {
      if (categoria) {
        Postagem.find({ categoria: categoria._id })
          .lean()
          .then((postagens) => {
            res.render("categorias/postagens", {
              categoria: categoria,
              postagens: postagens,
            });
          })
          .catch(() => {
            req.flash("error_msg", "Houve um erro ao listar os posts");
            res.redirect("/");
          });
      } else {
        req.flash("error_msg", "Esta categoria não existe");
        res.redirect("/");
      }
    })
    .catch(() => {
      req.flash(
        "error_msg",
        "Houve um erro interno ao carregar a página categorias"
      );
      res.redirect("/");
    });
});

app.get("/404", (req, res) => {
  res.send("Erro 404, rota não encontrada");
});

app.use("/adm", adm);
app.use("/user", user);
const PORT = process.env.PORT || 8001
app.listen(PORT, () => {
  console.log("Api rodando em http://localhost:8001/");
});
