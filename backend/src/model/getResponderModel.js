// src/model/getResponderModel.js
import ResponderSchema from "./responderModel.js";

export default function getResponderModel() {
  if (!global.respondersDB) {
    throw new Error("Responders DB is not connected yet");
  }
  return global.respondersDB.model("Responder");
}

