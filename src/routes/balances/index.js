const express = require("express");
const { QueryTypes } = require("sequelize");
const router = express.Router();

//5. Deposits money into the the the balance of a client, a client can't deposit more than 25% his total of jobs to pay. (at the deposit moment)
router.post("/deposit/:userId", async (req, res) => {
  const amount = parseFloat(req.body.amount);
  if (!amount) return res.status(400).end("Amount not valid !");

  const { userId } = req.params;

  const rs = (
    await req.app.get("sequelize").query(
      `
    select sum(jobs.price) as 'amount', max(contracts.clientid) as 'client' from contracts 
    join jobs on contracts.id = jobs.ContractId

    where contracts.clientid = ?
    and jobs.paid is NULL
    `,
      {
        replacements: [userId],
        type: QueryTypes.SELECT,
      }
    )
  )[0];

  if (!rs.client) return res.status(404).end();

  const owedAmount = rs.amount || 0;

  if (amount > owedAmount * 0.25)
    return res
      .status(401)
      .end("You can not deposit more than 25% of your total jobs to pay !");

  const { Profile } = req.app.get("models");
  await Profile.increment("balance", { by: amount, where: { id: userId } });

  return res.status(200).json(
    await Profile.findOne({
      where: { id: userId || 0 },
    })
  );
});

module.exports = router;
