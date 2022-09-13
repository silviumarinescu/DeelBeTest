module.exports = (profile) => {
  const condition = {};
  if (profile.type == "client") condition.ClientId = profile.id;
  else if (profile.type == "contractor")
    condition.ContractorId = profile.id;
  return condition;
};
