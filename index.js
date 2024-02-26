const express = require ('express');
const app = express();
const dotenv = require ('dotenv');
const cookieParser = require ('cookie-parser');
const cors = require ('cors');

const credentials = require ('./config/cors/middleware/credentials.js');
const authRouter = require ('./api/auth/auth.controller.js');
const userRouter = require ('./api/users/user.controller.js');
const corsOptions = require ('./config/cors/corsOptions.js');

dotenv.config({ path: './.env'});

app.use(credentials);

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: false}));

app.use(express.json());

app.use(cookieParser());

app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

app.listen(process.env.APP_PORT, () => {
    console.log(`Server up and running on port: ${process.env.APP_PORT}`);
})
