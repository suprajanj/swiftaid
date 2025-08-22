export async function getAllUsers(req, res) {
  // Display user accs
  res.status(200).send("You have fetched accs");
}

export async function createUser(req, res) {
  // Create user acc
  res.status(200).send("You have created an acc");
}

export async function updateUser(req, res) {
  // Update user acc
  res.status(200).send("You have updated an acc");
}

export async function deleteUser(req, res) {
  // Delete user acc
  res.status(200).send("You have deleted an acc");
}
