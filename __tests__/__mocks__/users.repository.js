exports.getAllUsers = jest.fn().mockResolvedValue([
  { id: 1, name: "Mock User One" },
  { id: 2, name: "Mock User Two" },
]);
