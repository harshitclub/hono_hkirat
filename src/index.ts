import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.use("/api/v1/blog/*", async (c, next) => {
  const header = c.req.header("authorization") || "";
  const token = header.split(" ")[1];
  // @ts-ignore
  const response = await verify(token, "temporaryenvvariablefixitsoon");
  if (response.id) {
    await next();
  } else {
    c.status(403);
    return c.json({ error: "Unauthorized" });
  }
});

app.post("/api/v1/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
      },
    });
    // const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    const token = await sign({ id: user.id }, "temporaryenvvariablefixitsoon");
    console.log(token);

    return c.json({ token: token, message: "user created", data: user });
  } catch (e) {
    console.log(e);

    c.status(403);
    return c.json({ error: "error while signing up" });
  }
});
app.post("/api/v1/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();
  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password,
    },
  });

  if (!user) {
    c.status(403);
    return c.json({ error: "User not found!" });
  }
  const token = await sign({ id: user.id }, "temporaryenvvariablefixitsoon");
  return c.json({ token: token, data: user });
});
app.get("/api/v1/blog/:id", (c) => {
  const id = c.req.param("id");
  console.log(id);
  return c.text("get blog route");
});
app.post("/api/v1/blog", (c) => {
  return c.text("blog route");
});
app.put("/api/v1/blog", (c) => {
  return c.text("update blog route");
});

export default app;
