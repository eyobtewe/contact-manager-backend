import { z } from "zod";


export const baseContactSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  phone: z.string().regex(/^[\+\-\s\(\)0-9]+$/, "Invalid phone number format"), // E.164 format
  email: z.string().email().optional(),
  bookmarked: z.boolean().default(false),
});


// Schema for list of contacts
export const contactListSchema = z.array(baseContactSchema);

// Schema for creating a contact (excludes `id`)
export const createContactSchema = baseContactSchema.omit({ id: true });

// Schema for updating a contact (partial fields for PATCH)
export const updateContactSchema = baseContactSchema.partial();

// Schema for validating contact ID (for DELETE, PATCH)
export const contactIdSchema = baseContactSchema.pick({ id: true });



export type Contact = z.infer<typeof baseContactSchema>

// Define a schema for an array of contacts
export type ContactList = z.infer<typeof contactListSchema>;

