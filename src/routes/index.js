const express = require("express");
const router = express.Router();

router.use("/contracts", require("./contracts"));
router.use("/jobs", require("./jobs"));
router.use("/balances", require("./balances"));
router.use("/admin", require("./admin"));


module.exports = router;
