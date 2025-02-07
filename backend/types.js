const z = require("zod");

const userSchemaTypes = z.object({
  email: z.string().email(),
  username: z.string().min(3, "Username must be at least 3 character"),
  password: z.string().min(4, "Password must be at least 4 character"),
});

const eventSchemaTypes = z.object({
  title: z.string(),
  description: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  category: z.string(),
  location: z.string(),
  organizer: z.string(),
  attendees: z.array(z.string()),
  maxAttendees: z.number(),
  imageUrl: z.string(),
  price: z.number(),
});

module.exports = {
  userSchemaTypes,
  eventSchemaTypes,
};
