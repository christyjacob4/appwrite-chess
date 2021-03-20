import Appwrite from "appwrite";
import { ChessCollection, Server } from "../utils/config";
import { createId } from "../utils/utils";

let api = {
  sdk: null,

  provider: () => {
    if (api.sdk) return api.sdk;
    let appwrite = new Appwrite();
    appwrite.setEndpoint(Server.endpoint).setProject(Server.project);
    api.sdk = appwrite;
    return appwrite;
  },

  createAccount: async (email, password, name) => {
    return await api.provider().account.create(email, password, name);
  },

  getAccount: async () => {
    return await api.provider().account.get();
  },

  createSession: async (email, password) => {
    return await api.provider().account.createSession(email, password);
  },

  createDocument: async (collectionId, data, read, write) => {
    return await api
      .provider()
      .database.createDocument(collectionId, data, read, write);
  },

  updateDocument: async (collectionId, documentId, data, read, write) => {
    return await api
      .provider()
      .database.updateDocument(collectionId, documentId, data, read, write);
  },
};

export default api;
