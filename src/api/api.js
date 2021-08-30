import { Appwrite } from "appwrite-realtime-preview";
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

  // createAccount: async (email, password, name) => {
  //   try {
  //     const account = await api
  //       .provider()
  //       .account.createAnonymous(email, password, name);
  //     return account;
  //   } catch (e) {
  //     console.log(e);
  //     return null;
  //   }
  // },

  getAccount: async () => {
    try {
      const account = await api.provider().account.get();
      return account;
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  createAnonymousSession: async () => {
    try {
      const session = await api
        .provider()
        .account.createAnonymousSession();
      return session;
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  createDocument: async (collectionId, data, read, write) => {
    try {
      const document = await api
        .provider()
        .database.createDocument(collectionId, data, read, write);
      return document;
    } catch (e) {
      console.log(e);
      return null;
    }
  },

  updateDocument: async (collectionId, documentId, data, read, write) => {
    try {
      const document = await api
        .provider()
        .database.updateDocument(collectionId, documentId, data, read, write);
      return document;
    } catch (e) {
      console.log(e);
      return null;
    }
  },
};

export default api;
