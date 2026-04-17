const User = require("./user.model");

class UserService {
  async getAllUsers(query) {
    const { page = 1, limit = 10, role, isActive } = query;

    const filter = { role: { $nin: ["admin", "superadmin"] } };
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const users = await User.find(filter)
      .select("-password")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(filter);

    return {
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    };
  }

  async getUserById(id) {
    const user = await User.findById(id).select("-password");
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async updateUser(id, data) {
    // Remove sensitive fields that shouldn't be updated directly
    delete data.password;
    delete data.role;

    const user = await User.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async deleteUser(id) {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}

module.exports = new UserService();
