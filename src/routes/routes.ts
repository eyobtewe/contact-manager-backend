import { json, Router } from "express";
import { createContactHandler, deleteContactHandler, exportContactsHandler, getContactsHandler, updateContactHandler } from "../controllers/controller";

export const router = Router();

// GET /contacts: Fetch all contacts.
router.get(`/`, getContactsHandler);
router.get(`/contacts`, getContactsHandler);

// POST /contacts: Add a new contact.
router.post(`/contacts`, json(), createContactHandler);

// PATCH /contacts/:id: Update an existing contact.
router.patch(`/contacts/:id`, json(), updateContactHandler);

// DELETE /contacts/:id: Delete a contact.
router.delete(`/contacts/:id`, deleteContactHandler);

// GET /contacts/export: Export all contacts as .vcf files, compress and download as a .zip file.
router.get(`/contacts/export`, exportContactsHandler);

// router.get(`/populate`, populateContactsHandler);
