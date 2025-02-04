import { RequestHandler } from "express";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { v4 as uuidv4 } from "uuid";
import {
  Contact,
  contactIdSchema,
  ContactList,
  contactListSchema,
  createContactSchema,
  updateContactSchema,
} from "../models/schema";
import vCard from "vcf";
import archiver from "archiver";
import { initializeApp, ServiceAccount } from 'firebase-admin/app';

import { Firestore, DocumentSnapshot } from "firebase-admin/firestore";
import admin from "firebase-admin";

// const app = initializeApp();
// var admin = require("firebase-admin");
import dotenv from 'dotenv';

dotenv.config();

// var serviceAccount = require("../../firebase-service-account.json");
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });
const serviceAccount = {
  type: process.env.FIREBASE_TYPE,
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,

};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  // storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const getStorePath = join(__dirname, `data`, "contacts.json");

// // req params, resp body, req body, query params
// // GET /contacts: Fetch all contacts.
// export const getContactsHandler: RequestHandler = async (req, res, next) => {
//   try {
//     const response = readFileSync(getStorePath, "utf-8");

//     if (!response) {
//       res.json(contactListSchema.safeParse([]));
//       return;
//     }

//     const contacts = contactListSchema.parse(JSON.parse(response));
//     res.json(contacts);
//   } catch (error) {
//     next(error);
//   }
// };
// // POST /contacts: Add a new contact.
// export const createContactHandler: RequestHandler = (req, res, next) => {
//   try {
//     const requestBody = createContactSchema.safeParse(req.body);

//     if (!requestBody.success) throw requestBody.error;

//     let response = readFileSync(getStorePath, "utf-8");
//     let contacts: ContactList;
//     let modifiedContacts: ContactList;

//     const newContact: Contact = { ...requestBody.data, id: uuidv4() };

//     if (response) {
//       contacts = contactListSchema.parse(JSON.parse(response));
//       if (
//         contacts.find(
//           (c) => c.name.toLowerCase() === newContact.name.toLowerCase()
//         )
//       ) {
//         throw new Error("name already exists");
//       } else if (
//         contacts.find((c) => c.phone.trim() === newContact.phone.trim())
//       ) {
//         throw new Error("phone number already exists");
//       }
//       modifiedContacts = [newContact, ...contacts];
//     } else {
//       modifiedContacts = [newContact];
//     }

//     writeFileSync(getStorePath, JSON.stringify(modifiedContacts));

//     res.status(201).json(newContact);
//   } catch (error) {
//     console.error("Error creating contact:", error);
//     next(error); // Pass error to error-handling middleware
//   }
// };
// // PATCH /contacts/:id: Update an existing contact.
// export const updateContactHandler: RequestHandler = (req, res, next) => {
//   try {
//     const reqBody = updateContactSchema.safeParse(req.body);
//     const reqParams = contactIdSchema.safeParse(req.params);

//     if (!reqBody.success) throw reqBody.error;
//     if (!reqParams.success) throw reqParams.error;

//     let response = readFileSync(getStorePath, "utf-8");
//     const contacts = contactListSchema.safeParse(JSON.parse(response));

//     let modifiedContact: Contact | null = null;
//     const updatedContacts = contacts?.data?.map((c) => {
//       if (c.id === reqParams.data.id) {
//         modifiedContact = { ...c, ...reqBody.data };
//         return modifiedContact;
//       }
//       return c;
//     });
//     writeFileSync(getStorePath, JSON.stringify(updatedContacts));

//     if (modifiedContact) {
//       res.status(200).json(modifiedContact);
//     } else {
//       res.status(404).json({ error: "Contact not found" });
//     }
//   } catch (error) {
//     console.error("Error creating contact:", error);
//     next(error); // Pass error to error-handling middleware
//   }
// };
// // DELETE /contacts/:id: Delete a contact.
// export const deleteContactHandler: RequestHandler = (req, res, next) => {
//   try {
//     const reqParams = contactIdSchema.safeParse(req.params);

//     if (!reqParams.success) throw reqParams.error;

//     let response = readFileSync(getStorePath, "utf-8");
//     const contacts = contactListSchema.safeParse(JSON.parse(response));
//     let flag = false;
//     const updatedContacts = contacts?.data?.filter((c) => {
//       flag = true;
//       return c.id !== reqParams.data.id;
//     });
//     if (flag) {
//       throw new Error("Contact not found");
//     }
//     writeFileSync(getStorePath, JSON.stringify(updatedContacts));

//     res.status(200).json({ message: "Contact deleted successfully" });
//   } catch (error) {
//     console.error("Error creating contact:", error);
//     next(error); // Pass error to error-handling middleware
//   }
// };
// // GET /contacts/export: Export all contacts as .vcf files, compress and download as a .zip file.
// export const exportContactsHandler: RequestHandler = async (req, res, next) => {
//   try {
//     const response = readFileSync(getStorePath, "utf-8");

//     if (!response) {
//       res.json(contactListSchema.safeParse([]));
//       return;
//     }

//     const contacts = contactListSchema.parse(JSON.parse(response));
//     let cards: vCard[] = [];

//     contacts.forEach((element) => {
//       const card = new vCard();
//       card.set("id", element.id);
//       card.set("name", element.name);
//       card.set("phone", element.phone);
//       card.set("email", element.email ?? "");
//       card.set("bookmarked", `${element.bookmarked}`);
//       cards.push(card);
//     });

//     const zip = archiver("zip", { zlib: { level: 9 } });

//     // Set response headers
//     res.setHeader("Content-Type", "application/zip");
//     res.setHeader("Content-Disposition", 'attachment; filename="contacts.zip"');

//     zip.pipe(res);

//     // Append vCards as virtual files (no need to write to disk)
//     cards.forEach((card, index) => {
//       zip.append(card.toString(), { name: `contact${index + 1}.vcf` });
//     });

//     // Finalize ZIP
//     zip.finalize();

//     zip.on("error", (err) => {
//       console.error("ZIP Error:", err);
//       res.status(500).send("Error generating ZIP file");
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// // Unknown routes
// export const route_not_found: RequestHandler = (req, res, next) => {
//   next(new Error("Route not found"));
// };


const db = admin.firestore();
const contactsCollection = db.collection("contacts");

// GET /contacts: Fetch all contacts.
export const getContactsHandler: RequestHandler = async (req, res, next) => {
  try {
    const snapshot = await contactsCollection.get();
    const contacts: ContactList = snapshot.docs.map((doc: DocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    })) as ContactList;

    res.json(contactListSchema.parse(contacts));
  } catch (error) {
    next(error);
  }
};

// POST /contacts: Add a new contact.
export const createContactHandler: RequestHandler = async (req, res, next) => {
  try {
    const requestBody = createContactSchema.safeParse(req.body);
    if (!requestBody.success) throw requestBody.error;

    const newContact: Contact = { ...requestBody.data, id: uuidv4() };

    // Check for duplicate name or phone
    const snapshot = await contactsCollection.get();
    const contacts = snapshot.docs.map((doc: DocumentSnapshot) => doc.data()) as ContactList;
    if (contacts.find((c) => c.name.toLowerCase() === newContact.name.toLowerCase())) {
      throw new Error("name already exists");
    } else if (contacts.find((c) => c.phone.trim() === newContact.phone.trim())) {
      throw new Error("phone number already exists");
    }

    await contactsCollection.doc(newContact.id).set(newContact);
    res.status(201).json(newContact);
  } catch (error) {
    console.error("Error creating contact:", error);
    next(error);
  }
};

// PATCH /contacts/:id: Update an existing contact.
export const updateContactHandler: RequestHandler = async (req, res, next) => {
  try {
    const reqBody = updateContactSchema.safeParse(req.body);
    const reqParams = contactIdSchema.safeParse(req.params);

    if (!reqBody.success) throw reqBody.error;
    if (!reqParams.success) throw reqParams.error;

    const contactRef = contactsCollection.doc(reqParams.data.id);
    const doc = await contactRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: "Contact not found" });
      return;
    }

    await contactRef.update(reqBody.data);
    res.status(200).json({ id: reqParams.data.id, ...reqBody.data });
  } catch (error) {
    console.error("Error updating contact:", error);
    next(error);
  }
};

// DELETE /contacts/:id: Delete a contact.
export const deleteContactHandler: RequestHandler = async (req, res, next) => {
  try {
    const reqParams = contactIdSchema.safeParse(req.params);

    if (!reqParams.success) throw reqParams.error;

    const contactRef = contactsCollection.doc(reqParams.data.id);
    const doc = await contactRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: "Contact not found" });
      return;
    }

    await contactRef.delete();
    res.status(200).json({ message: "Contact deleted successfully" });
  } catch (error) {
    console.error("Error deleting contact:", error);
    next(error);
  }
};

// GET /contacts/export: Export all contacts as .vcf files, compress and download as a .zip file.
export const exportContactsHandler: RequestHandler = async (req, res, next) => {
  try {
    const snapshot = await contactsCollection.get();
    const contacts: ContactList = snapshot.docs.map((doc: DocumentSnapshot) => doc.data()) as ContactList;

    if (contacts.length === 0) {
      res.status(404).json({ error: "No contacts available for export" });
      return;
    }

    let cards: vCard[] = contacts.map((contact) => {
      const card = new vCard();
      card.set("id", contact.id);
      card.set("name", contact.name);
      card.set("phone", contact.phone);
      card.set("email", contact.email ?? "");
      card.set("bookmarked", `${contact.bookmarked}`);
      return card;
    });

    const zip = archiver("zip", { zlib: { level: 9 } });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="contacts.zip"');

    zip.pipe(res);

    cards.forEach((card, index) => {
      zip.append(card.toString(), { name: `contact${index + 1}.vcf` });
    });

    zip.finalize();

    zip.on("error", (err) => {
      console.error("ZIP Error:", err);
      res.status(500).send("Error generating ZIP file");
    });
  } catch (error) {
    next(error);
  }
};

// Unknown routes
export const route_not_found: RequestHandler = (req, res, next) => {
  next(new Error("Route not found"));
};


// GET /populate: Populate Firestore with contacts from JSON file.
// export const populateContactsHandler: RequestHandler = async (req, res, next) => {
//   try {
//     const response = readFileSync(getStorePath, "utf-8");
//     if (!response) {
//       res.json(contactListSchema.safeParse([]));
//       return;
//     }

//     const contacts = contactListSchema.parse(JSON.parse(response));
//     const batch = db.batch();

//     contacts.forEach((contact) => {
//       const contactRef = contactsCollection.doc(contact.id);
//       batch.set(contactRef, contact);
//     });

//     await batch.commit();
//     res.status(201).json({ message: "Contacts populated successfully" });
//   } catch (error) {
//     next(error);
//   }
// };
