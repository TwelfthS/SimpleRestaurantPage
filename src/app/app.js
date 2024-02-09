const express = require('express')
const methodOverride = require('method-override')
const { Sequelize, DataTypes } = require('sequelize')
const session = require('express-session')
const FileStore = require('session-file-store')(session)
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const fileStoreOptions = {}



const config = require('./config/config.json').development

const sequelize =
    new Sequelize(config.database,
    config.username,
    config.password, {
        host: 'localhost',
        dialect: 'mysql'
    })

const models = require('./models/index.js')

const MenuItem = models.MenuItem
const Order = models.Order
const User = models.User

const app = express ();
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'))

app.use(express.static('../images'));

app.set('view engine', 'hbs');
app.set("view options", {layout: "layouts/layout"});

app.use(session({
    store: new FileStore(fileStoreOptions),
    secret: 'keyboard cat',
    saveUninitialized: false,
    resave: false,
    retries: 0
}))

app.use(cookieParser())

const Handlebars = require('hbs');

Handlebars.registerHelper('filter_id', function (given_id, array_of_id) {
    return array_of_id.includes(given_id.toString())
});

let hasOrders = false

Handlebars.registerHelper("hasOrders", function() {
    hasOrders = true
});

Handlebars.registerHelper("checkIfHasOrders", function() {
    return hasOrders
});

let totalCost = 0

Handlebars.registerHelper('addCost', function (cost) {
    totalCost += cost
})

Handlebars.registerHelper('totalCost', function () {
    return totalCost
})

Handlebars.registerPartials('views/partials')

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("Server Listening on PORT:", PORT);
});

app.get('/signup', function (request, response) {
    sequelize
    .authenticate()
    .then(() => {
        response.render('signup.hbs')
    })
    .catch((error) => {
        response.send("No connection :(")
    })
})

app.post('/signup', function (request, response) {
    if (request.body.name && request.body.username && request.body.login && request.body.password && request.body.repeat) {
        if (request.body.password === request.body.repeat) {
            sequelize
            .authenticate()
            .then(() => {
                bcrypt.hash(request.body.password, 10, function (err, hash) {
                    const hashedPassword = hash
                    createUser(request.body, hashedPassword).then((user) => {
                        request.session.userId = user.id
                        if (user.role === 'admin') request.session.isAdmin = true
                        request.session.save(() => {
                            response.redirect('/')
                        })
                    }).catch((error) => {
                        response.render('signup.hbs', {
                            error: "Логин уже занят"
                        })
                    })
                })
            })
            .catch((error) => {
                response.send("No connection :(")
            })
        } else {
            response.render('signup.hbs', {
                error: "Пароли не совпадают"
            })
        }
    } else {
        response.render('signup.hbs', {
            error: "Все поля должны быть заполнены!"
        })
    }
})

app.get('/signin', function (request, response) {
    sequelize
    .authenticate()
    .then(() => {
        response.render('signin.hbs')
    })
    .catch((error) => {
        response.send("No connection :(")
    })
})

app.post('/signin', function (request, response) {
    if (request.body.login && request.body.password) {
        sequelize
        .authenticate()
        .then(() => {
            User.findOne({
                where: {
                    login: request.body.login
                }
            }).then((user) => {
                if (user) {
                    bcrypt.compare(request.body.password, user.password, function(err, result) {
                        if (result) {
                            request.session.userId = user.id
                            if (user.role === 'admin') request.session.isAdmin = true
                            request.session.save(() => {
                                response.redirect('/')
                            })
                        } else {
                            response.render('signin', {
                                error: "Неправильный пароль"
                            })
                        }
                    })
                } else {
                    response.render('signin', {
                        error: "Логин не существует"
                    })
                }
            })
        })
        .catch((error) => {
            response.send("No connection :(")
        })
    } else {
        response.render('signin', {
            error: "Все поля должны быть заполнены!"
        })
    }
})

app.get('/logout', function (request, response) {
    sequelize
    .authenticate()
    .then(() => {
        request.session.destroy(() => {
            response.clearCookie('connect.sid')
            response.redirect('/')
        })
    })
    .catch((error) => {
        response.send("No connection :(")
    })
})

app.use('/$', function (request, response) {
    sequelize
    .authenticate()
    .then(() => {
            User.findOne({
                where: {
                    id: request.session.userId || request.body.waiter_id || 0
                }
            }).then((user) => {
                if (user && (request.session.userId || user.role === "waiter")) {
                    getOrders().then((orders) => {
                        getMenu().then((menu) => {
                            if (user.role !== "admin") {
                                let render = ''
                                if (request.session.userId) {
                                    render = 'main_waiter.hbs'
                                    hasOrders = false
                                } else {
                                    render = 'main.hbs'
                                }
                                response.render(render, {
                                    order: orders,
                                    waiter_orders: user.orders,
                                    menu: menu,
                                    session: request.session || 0
                                });
                            } else {
                                getWaiters().then((waiters) => {
                                    response.render('main_admin.hbs', {
                                        order: orders,
                                        waiter: waiters,
                                        menu: menu,
                                        session: request.session || 0
                                    });
                                })
                            }
                        })
                    })
                        
                } else {
                    response.render('main.hbs')
                }
            })
    })
    .catch((error) => {
        response.send("No connection :(");})
})

app.get('/orders', function (request, response) {
    sequelize
    .authenticate()
    .then(() => {
        getMenu().then((menu) => {
            if (request.session.userId) {
                User.findOne({
                    where: {
                        id: request.session.userId
                    }
                }).then((user) => {
                    response.render("orders.hbs", {
                        me: user,
                        menu: menu,
                        disabled: "disabled",
                        session: request.session
                    })
                })
                
            } else {
                getWaiters().then((waiters) => {
                    response.render("orders.hbs", {
                        waiter: waiters,
                        menu: menu,
                    })
                })
            }
        }) })
    .catch((error) => {
        response.send("No connection :(");})
    
})

app.post('/orders', (request, response) => {
    const waiter = request.session.userId || request.body.waiters
    if (request.body.menu && waiter) {
        sequelize
        .authenticate()
        .then(() => {
            createOrder(request.body.menu, waiter).then((order) => {
                response.redirect('/orders/' + order.id)
            }) })
        .catch((error) => {
            response.send("No connection :(");})
    } else {
        response.redirect('/orders')
    }
    
})

app.get('/menu', (request, response) => {
sequelize
    .authenticate()
    .then(() => {
        getMenu().then((menu) => {
            response.render("menu.hbs", {
                menu: menu,
                session: request.session || 0
            });
        })
    })
    .catch((error) => {
        response.send("No connection :(");})
});

app.get('/orders/:id', (request, response) => {
    sequelize
    .authenticate()
    .then(() => {
        showOrder(request).then((order) => {
            getMenu().then((menu) => {
                totalCost = 0
                response.render("order.hbs", {
                    order: order,
                    menu: menu,
                    session: request.session || 0
                })
            })
            
        })})
    .catch((error) => {
        response.send("No connection :(");})
})

app.delete('/orders/:id', (request, response) => {
    sequelize
    .authenticate()
    .then(() => {
        deleteOrder(request).then(() => {
            response.redirect("/")
        })})
    .catch((error) => {
        response.send("No connection :(");})
})



async function getMenu() {
    return await MenuItem.findAll({raw:true})
}

async function createOrder(items, waiter_id) {
    const waiter = await User.findOne({
        where: {
            id: waiter_id
        }
    })
    if (waiter) {
        const new_order = await Order.create({
            isActive: true,
            items: items
        })
        const new_orders = waiter.orders
        new_orders.push(new_order.id)
        waiter.update({
            orders: new_orders
        })
        return new_order
    }
    return 0
}

async function getOrders() {
    return await Order.findAll({raw:true})
}

async function showOrder(request) {
    return await Order.findOne({
        where: {
            id: request.params.id
        }
    })
}

async function deleteOrder(request) {
    let ord = await Order.findOne({
        where: {
            id: request.params.id
        }
    })
    ord.update({
        isActive: false
    })
}

async function createUser(request, hashedPassword) {
    return await User.create({
        name: request.name,
        username: request.username,
        login: request.login,
        role: request.role,
        orders: '',
        password: hashedPassword
    })
}

async function getWaiters() {
    return await User.findAll({
        raw: true,
        where: {
            role: 'waiter'
        }
    })
}