import express, {Request, Response} from 'express';
import path from 'path';
import {routes} from "./routes";
import {API_PREFIX} from "./constant/common";
import logger from "./middleware/logger";
import {errorHandler} from "./util/error-handler";
import ScheduleHelper from "./util/schedules";
import config from "./util/env-parser";

const app = express();
const port = config.APP_PORT;

app.all("*", (req, resp, next) => {
    resp.header("Access-Control-Allow-Origin", "*");
    resp.header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Authorization, Accept, X-Requested-With");
    resp.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    req.method.toLowerCase() == 'options' ? resp.status(200).end() : next();
});

// 静态页面
app.use("/static", express.static(path.resolve(__dirname, "static")));

// 路由
routes.forEach((route) => {
    const {method, path, middleware, handler} = route;
    app[method](API_PREFIX + path, [...middleware, logger],
        (req: Request, resp: Response) => handler(req, resp)?.catch((err: Error) => errorHandler(err, req, resp)));
});

// 定时任务
ScheduleHelper.startAllSchedules();

process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
  }
);

app.listen(port, () => {
    console.log(`Express with Typescript! http://localhost:${port}/static/index.html`);
});
