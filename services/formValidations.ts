import { z } from "zod";
const addressValidation = z.object({
  name: z.string().min(3, "Name should be atleast 3 characters"),
  address: z.string().min(10, "Invalid wallet address"),
});

export { addressValidation };
