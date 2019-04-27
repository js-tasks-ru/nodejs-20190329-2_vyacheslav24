const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')('public'));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let subscribers = {};
const getId = (() => {
  let i = 0;

  return () => i++;
})();

router.get('/subscribe', async (ctx, next) => {
  await new Promise((resolve) => {
    ctx.resolve = resolve;
    subscribers[getId()] = ctx;
  });
});

router.post('/publish', async (ctx, next) => {
  const message = ctx.request.body.message;

  if (!message) {
    return next();
  }

  ctx.body = message;

  Object.values(subscribers).forEach((subscriber) => {
    subscriber.body = message;
    subscriber.resolve();
  });

  subscribers = {};
});

app.use(router.routes());

module.exports = app;
