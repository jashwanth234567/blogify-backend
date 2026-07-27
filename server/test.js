import mongoose from "mongoose";

const uri =
    "mongodb+srv://blogify:Blogify12345@cluster0.u9ngkvc.mongodb.net/blogdb?retryWrites=true&w=majority&appName=Cluster0";

try {
    await mongoose.connect(uri);
    console.log("CONNECTED");
} catch (e) {
    console.error(e);
}

process.exit();