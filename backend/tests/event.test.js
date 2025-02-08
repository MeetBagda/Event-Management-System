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
    await User.deleteMany({});  // Also clear users to prevent conflicts
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
        // Ensure a unique user for each test
        testUser = new User({
            username: 'newtestuser' + Date.now(), // Add a timestamp
            email: 'newtest7' + Date.now() + '@example.com', // Add a timestamp
            password: 'password123',
        });
        await testUser.save();
        testToken = generateToken(testUser._id);
    });

    it('should create a new event', async () => {
        const eventData = {
            title: 'Test Event',
            description: 'Test Description',
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + 3600000), // 1 hour from now
            category: 'Test Category',
            location: 'Test Location',
            organizer: testUser._id,
            attendees: [],
            maxAttendees: 100,
            imageUrl: 'http://example.com/image.jpg',
            price: 10,
        };

        const res = await request(app)
            .post('/api/v1/event/event')
            .set('Authorization', `Bearer ${testToken}`)
            .send(eventData);

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('msg', 'Event created successfully');
        expect(res.body).toHaveProperty('event');

        // You can't directly check for these properties this way. The organizer field
        // will be an ObjectId unless you use populate
        //expect(res.body.event.organizer).toHaveProperty('_id', testUser._id.toString()); //The organizer is ObjectId, cannot have property username.

    });

    it('should get all events', async () => {
        // First, create an event for to get an event
        const eventData = {
            title: 'Test Event',
            description: 'Test Description',
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + 3600000), // 1 hour from now
            category: 'Test Category',
            location: 'Test Location',
            organizer: testUser._id,
            attendees: [],
            maxAttendees: 100,
            imageUrl: 'http://example.com/image.jpg',
            price: 10,
        };

        const resCreateEvent = await request(app)
            .post('/api/v1/event/event')
            .set('Authorization', `Bearer ${testToken}`)
            .send(eventData);

        expect(resCreateEvent.statusCode).toEqual(201);

        const res = await request(app)
            .get('/api/v1/event/events');

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('msg', 'Events retrieved successfully');
        expect(res.body).toHaveProperty('events');
    });

    it('should get an event by id', async () => {
        // First, create an event for this id test case to work
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