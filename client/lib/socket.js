import { io } from "socket.io-client";
import api from "./api";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
   autoConnect: false,

   auth: async (callback) => {
      try {
         const response = await api.get("/auth/socket-token");

         callback({
            token: response.data.token,
         });
      } catch (error) {
         console.error("Unable to get socket token:", error);

         callback({
            token: null,
         });
      }
   },
});

export default socket;
