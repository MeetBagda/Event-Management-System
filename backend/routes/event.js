const express = require("express");
const router = express.Router();
const { Event } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");
const zod = require("zod");
const cors = require("cors");
const { eventSchemaTypes } = require("../types");

router.use(cors());

router.get("/events", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json({
      msg: "Events retrieved successfully",
      events: events,
    });
  } catch (error) {
    console.error("Error getting events:", error);
    res.status(500).json({
      msg: "Error getting events",
      error: error.message,
    });
  }
});

router.post("/event", async (req, res) => {
  const createPayLoad = req.body;
  const parsedPayLoad = eventSchemaTypes.safeParse(createPayLoad);

  if (!parsedPayLoad.success) {
    return res.status(411).json({
      msg: "Invalid input",
      errors: parsedPayLoad.error.issues,
    });
  }

  try {
    const event = await Event.create({
      title: createPayLoad.title,
      description: createPayLoad.description,
      startTime: createPayLoad.startTime,
      endTime: createPayLoad.endTime,
      category: createPayLoad.category,
      location: createPayLoad.location,
      organizer: createPayLoad.organizer,
      attendees: createPayLoad.attendees,
      maxAttendees: createPayLoad.maxAttendees,
      imageUrl: createPayLoad.imageUrl,
      price: createPayLoad.price,
    });

    const eventId = event._id;

    res.status(201).json({
      msg: "Event created successfully",
      eventId: eventId,
      event: event
    });
  } catch (error) {
    console.error("Error during Event creation:", error);

    res.status(500).json({
      msg: "Error creating event",
      error: error.message,
    });
  }
});

router.get("/event/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }
    res.status(200).json({
      msg: "Event retrieved successfully",
      event: event,
    });
  } catch (error) {
    console.error("Error getting event:", error);
    res.status(500).json({
      msg: "Error getting event",
      error: error.message,
    });
  }
});

router.put("/event/:id", async (req, res) => {
    const updatePayLoad = req.body;
    const parsedPayLoad = eventSchemaTypes.safeParse(updatePayLoad);
    
    if (!parsedPayLoad.success) {
        return res.status(411).json({
        msg: "Invalid input",
        errors: parsedPayLoad.error.issues,
        });
    }
    
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updatePayLoad, {
        new: true,
        });
    
        if (!updatedEvent) {
        return res.status(404).json({ msg: "Event not found" });
        }
    
        res.status(200).json({
        msg: "Event updated successfully",
        event: updatedEvent,
        });
    } catch (error) {
        console.error("Error updating event:", error);
        res.status(500).json({
        msg: "Error updating event",
        error: error.message,
        });
    }
});

router.delete("/event/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ msg: "Event not found" });
    }
    res.status(200).json({
      msg: "Event deleted successfully",
      event: event,
    });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({
      msg: "Error deleting event",
      error: error.message,
    });
  }
});

module.exports = router;