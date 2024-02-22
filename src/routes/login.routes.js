import { Router } from "express";
import UsersDBManager from "../dao/dbManagers/UsersDBManager.js";
import session from "express-session";
import passport from "passport";

const loginRouter = Router();
const DBUsersManager = new UsersDBManager();

loginRouter.get('/login', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.render('login', {
            title: `Acceso de usuarios`
        })
    } res.redirect('/api/sessions/profile')
})

loginRouter.post('/login',
    passport.authenticate('login', { failureRedirect: '/fail-login' }),
    async (req, res) => {
        try {
        req.session.user = {
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            role: req.user.role,
        }

            res.json({ status: 'Success', message: 'Logged' })
        } catch (error) {
            res.status(500).json({ status: 'error', error: 'Internal Server Error' })
        }
    }
)

loginRouter.get(
    '/githubLogin',
    passport.authenticate('github', { scope: ['user: email'] }, (req, res) => { })
)

loginRouter.get('/github-auth', passport.authenticate('github', { failureRedirect: '/api/sessions/login' }),
    (req, res) => {
        req.session.user = req.user
        res.redirect('/api/sessions/profile')
    }
)

loginRouter.get('/profile', async (req, res) => {
    if (!req.session || !req.session.user) {
        return res.redirect('/api/sessions/login');
    }
    try {
        let email = req.session.user.email;
        let user = await DBUsersManager.getUserByEmail({ email: email });

        if (user.role == 'admin') {
            let users = await DBUsersManager.getUsers();
            res.render('adminSection', {
                users,
                title: `Listado de usuarios`
            });
        }

        res.render('userProfile', {
            user,
            title: `Perfil de ${user.first_name} ${user.last_name}`
        });
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

loginRouter.get('/register', (req, res) => {
    res.render('register', {
        title: `Formulario de registro`
    })
})

loginRouter.post('/register', passport.authenticate('register', {
    failureRedirect: '/users/fail-register',
}),
    async (req, res) => {
    try {
        res
            .status(201)
            .json({ status: 'Success', message: 'User has been register' })
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
    }
)

loginRouter.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/api/sessions/login');
});


loginRouter.get('/fail-login', (req, res) => {
    res.json({ status: 'error', error: 'Login failed' })
})

loginRouter.get('/fail-register', (req, res) => {
    res.status(400).json({ status: 'error', error: 'Bad request' })
})

loginRouter.post('/forgot-password', async (req, res) => {
    try {
        const { email, password } = req.body
        const passwordEncrypted = createHash(password)
        await Users.updateOne({ email }, { password: passwordEncrypted })
        res.status(200).json({ status: 'Success', message: 'Password updated' })
    } catch (error) {
        res.status(500).json({ status: 'error', error: 'Internal Server Error' })
    }
})


export default loginRouter;