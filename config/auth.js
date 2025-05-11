import { model } from 'mongoose'
import { compare } from 'bcryptjs'
import { Strategy as localStrategy } from 'passport-local'


import '../models/Usuario.js'
const Usuario = model('usuarios')

export default function(passport){
    passport.use(new localStrategy({usernameField:'email',passwordField: 'senha'},(email, senha, done)=>{
        Usuario.findOne({email:email}).then((usuario)=>{
            if(!usuario){
                return done(null, false, {message: 'Está conta não existe'})
            }

            compare(senha, usuario.senha,(erro, batem)=>{
                if(batem){
                    return done(null, usuario)
                } else {
                    return done(null, false, {message: 'Senha incorreta'})
                }
            })
        })
    }))

    passport.serializeUser((usuario, done)=>{
        done(null, usuario.id)
    })

    passport.deserializeUser(async(id, done)=>{
       try{
        const usuario = await Usuario.findById(id)
        done(null, usuario)
        
       } catch(err){
        done(err, null)
       }
    })
}