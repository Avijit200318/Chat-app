import express from "express";

const router = express.Router();

router.get("/test", (req, res) => {
    res.send("this is test route");
});

export default router;