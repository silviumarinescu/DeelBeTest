const express = require("express");
const { Op, literal } = require("sequelize");
const router = express.Router();
const { getProfile } = require("../../middleware/getProfile");
const profileCheck = require("../../utils/profileCheck");

//3. Get all unpaid jobs for a user (either a client or contractor), for active contracts only.
router.get("/unpaid", getProfile, async (req, res) => {
  const { Job, Contract } = req.app.get("models");
  const jobs = await Job.findAll({
    where: { paid: { [Op.is]: null } },
    include: {
      model: Contract,
      // contracts are considered active only when in status `in_progress`
      where: { status: "in_progress", ...profileCheck(req.profile) },
    },
  });
  res.json(jobs);
});

//4. Pay for a job, a client can only pay if his balance >= the amount to pay. The amount should be moved from the client's balance to the contractor balance.
router.post("/:job_id/pay", getProfile, async (req, res) => {
  if (req.profile.type != "client")
    return res.status(401).end("Only clients can make payments !");

  const { Job, Contract, Profile } = req.app.get("models");
  const { job_id } = req.params;

  const t = await req.app.get("sequelize").transaction();

  try {
    // use transaction to avoid Double-spending problem
    const job = await Job.findOne({
      where: { id: job_id, paid: { [Op.is]: null } },
      include: {
        model: Contract,
        where: { ...profileCheck(req.profile) },
        include: [
          {
            model: Profile,
            as: "Contractor",
            foreignKey: "ContractorId",
          },
          {
            model: Profile,
            as: "Client",
            foreignKey: "ClientId",
          },
        ],
      },
      transaction: t,
    });

    if (!job) {
      await t.rollback();
      return res.status(404).end();
    }

    if (job.paid) {
      await t.rollback();
      return res.status(401).end("Job already payed !");
    }

    if (job.price > job.Contract.Client.balance) {
      await t.rollback();
      return res.status(401).end("Insuficient funds !");
    }

    job.Contract.Client.balance -= job.price;
    job.Contract.Contractor.balance += job.price;
    job.paid = true;
    job.paymentDate = literal("CURRENT_TIMESTAMP");

    await req.profile.save({ transaction: t });
    await job.Contract.Contractor.save({ transaction: t });
    await job.save({ transaction: t });

    await t.commit();
    res.json(job);
  } catch (error) {
    await t.rollback();
    return res.status(500).end();
  }
});

module.exports = router;
