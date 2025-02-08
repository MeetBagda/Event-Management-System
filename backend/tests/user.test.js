const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('../routes/user'); 
const {User} = require('../db');

const app = express();
app.use(express.json());
app.use('/api/v1/user', userRouter);

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterEach(async () => {
    await User.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('User Endpoints', () => {
    it('should create a new user', async () => {
        const res = await request(app)
        .post('/api/v1/user/signup')
        .send({
            username: 'testuser',
            email: 'test@example.com',
            password: 'password123',
        });
        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('msg', 'User created successfully');
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('userId');
    });
    it('should signin an existing user', async () => {
        
        const createUserRes = await request(app)
            .post('/api/v1/user/signup')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
            });
        expect(createUserRes.statusCode).toEqual(201);
        
        const res = await request(app)
            .post('/api/v1/user/signin')
            .send({
                email: 'test@example.com',
                password: 'password123',
            });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('userId');
    });
    it('should get user info', async () => {
        const createUserRes = await request(app)
            .post('/api/v1/user/signup')
            .send({
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123',
            });
        expect(createUserRes.statusCode).toEqual(201);
        const token = createUserRes.body.token;
        const res = await request(app)
            .get('/api/v1/user/me')
            .set('Authorization', `Bearer ${token}`); 
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('username');
    });
});