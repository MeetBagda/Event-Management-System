const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const eventRouter = require('../routes/event'); 
const {Event} = require('../db');
const {User} = require('../db');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config');

const app = express();
app.use(express.json());
app.use('/api/v1/event', eventRouter); 

beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterEach(async () => {
    await Event.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Event Endpoints', () => {

const generateToken = (userId) => {
    return jwt.sign({ userId: userId }, JWT_SECRET, { expiresIn: "1h" });
};

let testUser, testToken;

beforeEach(async () => {
    
    testUser = new User({
        username: 'newtestuser',
        email: 'newtest7@example.com',
        password: 'password123', 
    });
    await testUser.save();
    testToken = generateToken(testUser._id);
});

it('should create a new event', async () => {
    const eventData = {
        title: 'Test Event',
        // ... other fields
        organizer: testUser._id, 
    };

    const res = await request(app)
        .post('/api/v1/event/event')
        .set('Authorization', `Bearer ${testToken}`)
        .send(eventData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('msg', 'Event created successfully');
    expect(res.body).toHaveProperty('event');

   
    expect(res.body.event.organizer).toHaveProperty('_id', testUser._id.toString()); 
    expect(res.body.event.organizer).toHaveProperty('username', testUser.username); 
});
it('should get all events', async () => {
    const res = await request(app)
        .get('/api/v1/event/events');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('msg', 'Events retrieved successfully');
    expect(res.body).toHaveProperty('events');
});
it('should get an event by id', async () => {
    
    const createEventRes = await request(app)
        .post('/api/v1/event/event')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
            title: 'Test Event',
            description: 'Test Description',
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + 3600000), 
            category: 'Test Category',
            location: 'Test Location',
            organizer: testUser._id,
            attendees: [],
            maxAttendees: 100,
            imageUrl: 'http://example.com/image.jpg',
            price: 10,
        });
    expect(createEventRes.statusCode).toEqual(201);

    const eventId = createEventRes.body.event._id;

    const res = await request(app)
        .get(`/api/v1/event/event/${eventId}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('msg', 'Event retrieved successfully');
    expect(res.body).toHaveProperty('event');
});
});