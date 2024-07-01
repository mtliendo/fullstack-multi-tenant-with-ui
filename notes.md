# Multi-tenant Complete

This app is a continutation of what I have [here](https://github.com/mtliendo/fullstack-multi-tenant-data). In that repo I CRUDL operations setup as well as admin actions. This enables a user to register a tenant and perform API operations on `Todo` data. The admin of the tenant can also create new users. These users can do everything except create new users.

In this repo, I'll be adding the UI to implement this flow so that devs don't have to flip back and forth between the UI and the AppSync console to test things out.

In addition, I think I'll add the ability for Todos to contain images and for todos to be subscribed to.

This should show a complete picture of what it takes to create a robust multi-tenant solution.

Let's get started!

## Listing Todos

This should be easy. I think it makes sense for `todos` to be listed on the home page. That is `/:tenantId/protected`.

Looking at it, this is probably a good time to rename `protected` to `todos`. ✅

Listing these todos should take place in a `loader`. So I'll do just that.

I'm already using a `loader` on that route so I simply make the followoing call and pass the data:

```ts
const { data } = await client.queries.listTodos({})
```
