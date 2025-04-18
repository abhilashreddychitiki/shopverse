// middleware.ts
import { auth } from "./auth";

export default auth;

export const config = {
  matcher: ["/checkout"], // whatever routes you want to protect
};
