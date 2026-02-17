---
title: 'ShiftAPI: Full-Stack Type Safety from Go'
date: '2026-02-17'
spoiler: "I've been craving full-stack type safety from Go for years. So I built it."
---

I've been craving full-stack type safety from Go for years.

The TypeScript ecosystem figured this out a while ago. tRPC gives you end-to-end types from backend to frontend. You change a return type on the server and your frontend lights up with compiler errors. It's great. Go has nothing like it.

I kept running into the same problem: I'd write a Go struct, then rewrite it as a TypeScript interface, sometimes with an OpenAPI spec in between. They'd drift apart, and it was a pain every time I wanted to add a feature. I'd swear I'd fix it this time. I never did.

So I built [ShiftAPI](https://github.com/fcjr/shiftapi).

## What It Does

ShiftAPI is a thin layer on top of `net/http`. You define your Go types, write a handler, and ShiftAPI reflects those types into an OpenAPI 3.1 schema at runtime. The types themselves are captured at compile time via generics. Validation happens automatically via [go-playground/validator](https://github.com/go-playground/validator) struct tags. Interactive docs get served at `/docs`. You don't write any of this by hand.

```go
type CreateUserRequest struct {
    Name  string `json:"name" validate:"required"`
    Email string `json:"email" validate:"required,email"`
}

type CreateUserResponse struct {
    ID    string `json:"id"`
    Name  string `json:"name"`
    Email string `json:"email"`
}

func CreateUser(r *http.Request, body *CreateUserRequest) (*CreateUserResponse, error) {
    // your logic here
    return &CreateUserResponse{
        ID:    "123",
        Name:  body.Name,
        Email: body.Email,
    }, nil
}
```

```go
api := shiftapi.New()
shiftapi.Post(api, "/users", CreateUser)
shiftapi.ListenAndServe(":8080", api)
// interactive docs at http://localhost:8080/docs
```

That's the whole thing. Invalid requests get a `422 Unprocessable Entity` with per-field errors before your handler is ever called:

```json
{
    "message": "validation failed",
    "errors": [
        { "field": "Name",  "message": "this field is required" },
        { "field": "Email", "message": "must be a valid email address" }
    ]
}
```

But the schema generation isn't the point. The point is what it enables on the frontend.

## The TypeScript Side

This is the part I actually cared about.

```bash
npm install @shiftapi/vite-plugin
```

```ts
// vite.config.ts
import shiftapi from "@shiftapi/vite-plugin";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        shiftapi({
            server: "./cmd/server", // your Go entry point
        }),
    ],
});
```

The Vite plugin extracts the OpenAPI spec from your Go binary and generates TypeScript types via [openapi-typescript](https://github.com/openapi-ts/openapi-typescript). In dev mode it also starts your Go server, proxies API requests through Vite, watches your `.go` files, and hot-reloads the frontend when types change. Edit a struct field in Go, and your TypeScript client updates automatically.

Then you use the generated typed client:

```ts
import { client } from "@shiftapi/client";

const { data } = await client.POST("/users", {
    body: { name: "frank", email: "frank@example.com" },
});
// body and response are fully typed from your Go structs
```

A type error in your frontend means your API contract is broken. You find out at build time, not in production. One source of truth. The Go struct.

## Why `net/http`

I didn't want to build a framework. I wanted to build a layer.

The `API` type implements `http.Handler`. You can use it with the standard library server and any middleware that accepts `http.Handler`. Test with `httptest`. Mount it under a prefix with `http.StripPrefix`. There's no custom router and no framework you're locked into. If you decide ShiftAPI isn't for you, your handlers are still just functions that take a request and return a response.

Errors work the way you'd expect in Go: return an error from your handler and it becomes a JSON error response. Return `shiftapi.Error` when you need to control the status code:

```go
return nil, shiftapi.Error(http.StatusNotFound, "user not found")
```

Any other error returns `500`. You write functions that return values or errors. That's it.

## Try It

```bash
npm create shiftapi@latest
```

This scaffolds a full-stack project with a Go backend and a React or Svelte frontend wired together. Or just grab the library:

```bash
go get github.com/fcjr/shiftapi
```

ShiftAPI is still early and there are rough edges. But the core idea works today: define a Go struct once, and get validation, docs, error handling, and a typed TypeScript client without writing any of it yourself.

Source code is on [GitHub](https://github.com/fcjr/shiftapi).
