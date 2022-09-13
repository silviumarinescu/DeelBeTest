const express = require("express");
const router = express.Router();
const { QueryTypes } = require("sequelize");

//6. Returns the profession that earned the most money (sum of jobs paid) for any contactor that worked in the query time range.
router.get("/best-profession", async (req, res) => {
  const { start, end } = req.query;
  const rs = await req.app.get("sequelize").query(
    `
      select p.profession, sum(j.price) as 'sum' from Jobs j 
      join Contracts c on j.ContractId = c.id
      join Profiles p on p.id = c.ContractorId 
      
      WHERE j.paid is NOT NULL and 
      j.paymentDate > ? AND 
      j.paymentDate < ?
      
      group by p.profession
      
      order by sum(j.price) desc
      
      limit 1
    `,
    {
      replacements: [start, end],
      type: QueryTypes.SELECT,
    }
  );

  if (!rs.length) return res.status(401).end("No data found in interval !");

  return res.status(200).json(rs[0]);
});

//7. returns the clients the paid the most for jobs in the query time period. limit query parameter should be applied, default limit is 2.
router.get("/best-clients", async (req, res) => {
  const { start, end, limit = 2 } = req.query;
  const rs = await req.app.get("sequelize").query(
    `
        select p.id, max(p.firstName) as 'firstName', max(p.lastName) as 'lastName', sum(j.price) as 'sum'  from Jobs j 
        join Contracts c on j.ContractId = c.id
        join Profiles p on p.id = c.ClientId  
        
        WHERE j.paid is NOT NULL and 
        j.paymentDate > ? AND 
        j.paymentDate < ?
        
        group by p.id
        
        order by sum(j.price) desc
        
        limit ?
    `,
    {
      replacements: [start, end, limit],
      type: QueryTypes.SELECT,
    }
  );

  if (!rs.length) return res.status(401).end("No data found in interval !");

  return res.status(200).json(rs);
});

module.exports = router;
