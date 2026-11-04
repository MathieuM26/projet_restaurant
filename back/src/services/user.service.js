import userRepository from "../repository/userMemory.repository.js";

class UserService {
  authenticate(email) {
    const user = userRepository.getByEmail(email);
    if (!user || !user.active) {
      return { status: 401, error: "Identifiant invalide ou compte inactif." };
    }
    return {
      status: 200,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    };
  }

  getAllUsers() {
    return userRepository.getAllUsers();
  }

  getById(id) {
    return userRepository.getById(id);
  }

  create(userData) {
    return userRepository.create(userData);
  }

  deleteById(id) {
    return userRepository.deleteById(id);
  }
}

export default new UserService();
