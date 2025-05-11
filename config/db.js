if (process.env.NODE_ENV === "production") {
  module.exports = {
    mongoURI:
      "mongodb+srv://davi:123456Davi@cluster0.4pl6ms5.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  };
} else {
    module.exports={
        mongoURI: "mongodb://localhost/blogapp"
    }
}
