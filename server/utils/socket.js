import { Server } from "socket.io";

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`⚡ [Socket.io] Client connected: ${socket.id}`);

    // Join room for post-specific real-time updates
    socket.on("join:blog", (blogId) => {
      socket.join(`blog:${blogId}`);
    });

    socket.on("leave:blog", (blogId) => {
      socket.leave(`blog:${blogId}`);
    });

    socket.on("disconnect", () => {
      console.log(`🔌 [Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    console.warn("Socket.io not initialized yet");
  }
  return io;
};

// Real-time helper emitters
export const emitBlogDeleted = (blogId) => {
  if (io) {
    io.emit("blog:deleted", { blogId });
    io.to(`blog:${blogId}`).emit("blog:deleted", { blogId });
  }
};

export const emitLikeUpdated = (blogId, likesCount) => {
  if (io) {
    io.to(`blog:${blogId}`).emit("like:updated", { blogId, likesCount });
    io.emit("feed:like_updated", { blogId, likesCount });
  }
};

export const emitCommentAdded = (blogId, comment) => {
  if (io) {
    io.to(`blog:${blogId}`).emit("comment:added", { blogId, comment });
  }
};
