const Koa = require('koa')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')

const mongoose = require('mongoose')
const bodyParser = require('koa-bodyparser')
const session = require('koa-generic-session')
const Redis = require('koa-redis')
const json = require('koa-json')
const dbConfig = require('./dbs/config.js')
const passport = require('./interface/utils/passport.js')
const users = require('./interface/users.js')
const geo = require('./interface/geo.js')
const search = require('./interface/search.js')
const category = require('./interface/categroy.js')
const cart = require('./interface/cart.js')


const app = new Koa()
app.keys = ['mt', 'keys']
// ?
app.proxy = true
app.use(session({
  key: 'mt',
  prefix: 'mt:uid',
  store: new Redis()
}))
app.use(bodyParser({
  extendTypes: ['json', 'form', 'text']
}))
app.use(json())

mongoose.connect(dbConfig.dbs, {
  useNewUrlParser: true
})
app.use(passport.initialize())
app.use(passport.session())

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = app.env !== 'production'

async function start() {
  // Instantiate nuxt.js
  const nuxt = new Nuxt(config)

  const {
    host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000
  } = nuxt.options.server

  // Build in development
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // 路由
  app.use(users.routes()).use(users.allowedMethods())
  app.use(geo.routes()).use(geo.allowedMethods())
  app.use(search.routes()).use(search.allowedMethods())
  app.use(category.routes()).use(category.allowedMethods())
  app.use(cart.routes()).use(cart.allowedMethods())




  app.use((ctx) => {
    ctx.status = 200
    ctx.respond = false // Bypass Koa's built-in response handling
    ctx.req.ctx = ctx // This might be useful later on, e.g. in nuxtServerInit or with nuxt-stash
    nuxt.render(ctx.req, ctx.res)
  })

  app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })
}

start()
