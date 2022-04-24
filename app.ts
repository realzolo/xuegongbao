import express from 'express';
import path from 'path';
import {routes} from "./routes";
import bodyParser from "./middleware/body-parser";
import cors from "./middleware/cors";

const app = express();
const PORT = 3000;

// 静态页面
app.use("/static", express.static(path.resolve(__dirname, "static")));

// 路由
routes.forEach((route) => {
    const {method, path, middleware, handler} = route;
    app[method](path, [...middleware, bodyParser, cors], handler);
});

app.listen(PORT, () => {
    console.log(`Express with Typescript! http://localhost:${PORT}`);
});