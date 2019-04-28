const Koa = require('koa');
const Router = require('koa-router');
const User = require('./models/User');
const app = new Koa();
const mongoose = require('mongoose');

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status) {
      ctx.status = err.status;
      ctx.body = {error: err.message};
    } else {
      ctx.status = 500;
      ctx.body = {error: 'Internal server error'};
    }
  }
});

const router = new Router();

router.get('/users', async (ctx) => {
  const users = await User.find({});
  ctx.body = users;
});

router.get('/users/:id', async (ctx) => {
  const id = ctx.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }

  const userById = await User.findById(id);

  if (userById) {
    ctx.body = userById;
  }
});

router.patch('/users/:id', async (ctx) => {
  const id = ctx.params.id;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }

  const updatedUser = await User.findByIdAndUpdate(id, {$set: ctx.request.body}, {new: true}, function(err) {

  });

  if (updatedUser) {
    ctx.body = updatedUser;
  }
});

router.post('/users', async (ctx) => {
  const newUser = await User.create(ctx.request.body);

  if (newUser) {
    ctx.body = newUser;
  }
});

router.delete('/users/:id', async (ctx) => {
  const id = ctx.params.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    ctx.status = 400;
    return;
  }

  const deletedUser = await User.findByIdAndRemove(id);

  if (deletedUser) {
    ctx.body = deletedUser;
  }

});

app.use(router.routes());

module.exports = app;
