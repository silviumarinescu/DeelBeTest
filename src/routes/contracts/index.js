const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
const { getProfile } = require("../../middleware/getProfile");
const profileCheck = require("../../utils/profileCheck");


//1. This API is broken 😵! it should return the contract only if it belongs to the profile calling. better fix that!
router.get("/:id", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const { id } = req.params;
  const contract = await Contract.findOne({
    where: { id, ...profileCheck(req.profile) },
  });
  if (!contract) return res.status(404).end();
  res.json(contract);
});

//2. Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.
router.get("/", getProfile, async (req, res) => {
  const { Contract } = req.app.get("models");
  const contracts = await Contract.findAll({
    where: { status: { [Op.ne]: "terminated" }, ...profileCheck(req.profile) },
  });
  res.json(contracts);
});

module.exports = router;
