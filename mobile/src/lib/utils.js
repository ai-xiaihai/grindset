export const truncateName = (name) =>
  name.length > 10 ? name.slice(0, 10) + '…' : name
