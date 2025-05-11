const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const {isAdmin} = require("../helpers/isAdmin");
require("../models/Categoria");
const Categoria = mongoose.model("categoria");
require("../models/Postagem");
const Postagem = mongoose.model("postagem");

router.get("/", isAdmin,(req, res) => {
  res.render("adm/index");
});
router.get("/posts", isAdmin,(req, res) => {
  res.send("Pagina de posts");
});
router.get("/categorias", isAdmin,(req, res) => {
  Categoria.find({autor: req.user.id})
    .lean()
    .sort({ date: "desc" })
    .then((categorias) => {
      res.render("adm/categorias", { categorias: categorias });
    })
    .catch(() => {
      req.flash("error_msg", "Houve um erro ao listas as categorias");
      res.redirect("/adm");
    });
});
router.get("/categorias/addCategorias", isAdmin,(req, res) => {
  res.render("adm/addCategorias");
});
router.post("/categorias/nova", isAdmin,(req, res) => {
  var erros = [];

  if (
    !req.body.nome ||
    typeof req.body.nome === undefined ||
    req.body.nome === null
  ) {
    erros.push({ texto: "Nome ínvalido" });
  }
  if (
    !req.body.slug ||
    typeof req.body.slug === undefined ||
    req.body.slug === null
  ) {
    erros.push({ texto: "Slug ínvalido" });
  }

  if (erros.length > 0) {
    res.render("adm/addCategorias", { erros: erros });
  } else {
    const novaCategoria = {
      nome: req.body.nome,
      slug: req.body.slug,
      autor: req.user.id
    };

    new Categoria(novaCategoria)
      .save()
      .then(() => {
        req.session.success_msg = "Categoria criada com sucesso!"; // Armazena na sessão
        res.redirect("/adm/categorias");
      })
      .catch((err) => {
        req.session.error_msg = "Erro: " + err.message;
        res.redirect("/adm/categorias");
      });
  }
});

router.get("/categorias/edit/:id", isAdmin,(req, res) => {
  Categoria.findOne({ _id: req.params.id })
    .lean()
    .then((categoria) => {
      res.render("adm/editCategorias", { categoria: categoria });
    })
    .catch((err) => {
      req.session.error_msg = "Esta categoria não existe";
      res.redirect("/adm/categorias");
    });
});

router.post("/categorias/edit", isAdmin,(req, res) => {
  Categoria.findOne({ _id: req.body.id }).then((categoria) => {
    categoria.nome = req.body.nome;
    categoria.slug = req.body.slug;

    categoria.save().then(() => {
      req.flash("success_msg", "Categoria editada com sucesso!");
      res.redirect("/adm/categorias");
    });
  });
});

router.post("/categorias/delete", isAdmin,(req, res) => {
  Categoria.deleteOne({ _id: req.body.id })
    .then(() => {
      req.flash("success_msg", "Categoria deletada com sucesso");
      res.redirect("/adm/categorias");
    })
    .catch(() => {
      req.flash("error_msg", "Erro");
    });
});

router.get("/postagens", isAdmin,(req, res) => {
  Postagem.find({autor: req.user.id})
    .populate("categoria")
    .sort({ data: "desc" })
    .lean()
    .then((postagens) => {
      res.render("adm/postagens", { postagens: postagens });
    })
    .catch((err) => {
      req.flash("error_msg", "Erro ao lista postagens");
      res.redirect("/adm");
      console.log(err);
    });
});
router.get("/postagens/addPostagem", isAdmin,(req, res) => {
  Categoria.find()
    .lean()
    .then((categorias) => {
      res.render("adm/addPostagem", { categorias: categorias });
    });
});

router.post("/postagens/nova", isAdmin,(req, res) => {
  var erros = [];
  if (req.body.categoria === 0) {
    erros.push({ text: "Erro, insira um valor existente" });
  }

  if (erros.length > 0) {
    res.render("adm/addPostagem", { erros: erros });
  } else {
    const novaPostagem = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      conteudo: req.body.conteudo,
      slug: req.body.slug,
      categoria: req.body.categoria,
      autor: req.user.id
    };

    new Postagem(novaPostagem)
      .save()
      .then(() => {
        req.flash("success_msg", "Sucesso ao criar postagem!");
        res.redirect("/adm/postagens");
      })
      .catch((err) => {
        req.flash("error_msg", "Erro ao criar postagem");
        console.log(err);
      });
  }
});

router.get("/postagens/edit/:id", isAdmin,(req, res) => {
  Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {
    Categoria.find().lean().then((categorias) => {
      res.render("adm/editPostagem",{categorias:categorias, postagem:postagem});
    }).catch(()=>{
      req.flash('error_msg','Erro ao listar categorias')
      res.redirect('/adm/postagens')
    })
  });
});

router.post('/postagens/edit', isAdmin,(req, res)=>{
  Postagem.findOne({_id: req.body.id}).then((postagem)=>{
    postagem.titulo = req.body.titulo,
    postagem.slug = req.body.slug,
    postagem.conteudo = req.body.conteudo,
    postagem.descricao = req.body.descricao,
    postagem.categoria = req.body.categoria

    postagem.save().then(()=>{
      req.flash('success_msg','Sucesso ao editar postagem')
      res.redirect('/adm/postagens')
    }).catch((err)=>{
      console.log(err)
      req.flash('error_msg','Erro ao editar postagem')
      res.redirect('/adm/postagens')
    })
  }).catch(()=>{
    req.flash('error_msg','Erro ao salvar edição')
    res.redirect('/adm/postagens')
  })
})

router.get('/postagens/delete/:id',(req,res)=>{
  Postagem.deleteOne({_id: req.params.id}).then(()=>{
    res.redirect('/adm/postagens')
    req.flash('success_msg','Postagem deletada')
  }).catch((err)=>{
    req.flash('error_msg','Erro ao deletar postagem')
    res.redirect('/adm/postagens')
  })
})
module.exports = router;
