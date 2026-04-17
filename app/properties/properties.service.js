const Property = require("./properties.model");
const {
  sendUserNotification,
} = require("../user_notifications/user_notification.service");

class PropertyService {
  async getAllProperties(query) {
    const { type, location, status = "active", featured, isNewLaunch } = query;

    const filter = {};

    if (status !== "all") {
      filter.status = status;
    }

    // New schema uses 'type' instead of 'propertyType'
    if (type && type !== "all") {
      filter.type = new RegExp(type, "i");
    }

    // New schema uses structured location
    if (location) {
      filter.$or = [
        { "location.city": new RegExp(location, "i") },
        { "location.area": new RegExp(location, "i") },
        { "location.address": new RegExp(location, "i") },
        { "location.landmark": new RegExp(location, "i") },
      ];
    }

    if (featured !== undefined) {
      filter.featured = featured === "true";
    }

    if (isNewLaunch !== undefined) {
      filter.isNewLaunch = isNewLaunch === "true";
    }

    const properties = await Property.find(filter)
      .populate("owner", "firstName lastName email phone")
      .sort({ createdAt: -1 });

    return properties;
  }

  async getPropertyById(id) {
    const property = await Property.findById(id).populate(
      "owner",
      "firstName lastName email phone avatar",
    );

    if (!property) {
      throw new Error("Property not found");
    }

    // Increment views
    property.views += 1;
    await property.save();

    return property;
  }

  async createProperty(data) {
    const property = await Property.create(data);

    // Automation: Notify all users about naya property launch!
    try {
      await sendUserNotification({
        title: "New Property Launch!",
        message: `${property.title} in ${property.location?.area || "your area"} is now available. Check it out!`,
        type: "new_property",
        targetType: "all",
        image:
          property.images && property.images.length > 0
            ? property.images[0]
            : "",
        link: `/properties/${property._id}`,
      });
    } catch (err) {
      console.error("Auto property notification failed:", err.message);
    }

    return property;
  }

  async bulkCreateProperties(dataArray) {
    const properties = await Property.insertMany(dataArray);
    return properties;
  }

  async updateProperty(id, data, user) {
    const property = await Property.findById(id);

    if (!property) {
      throw new Error("Property not found");
    }

    // Allow update if user is the owner OR user is an admin/superadmin
    const isAdmin = user.role === "admin" || user.role === "superadmin";
    if (property.owner.toString() !== user.id && !isAdmin) {
      throw new Error("Not authorized to update this property");
    }

    Object.assign(property, data);
    await property.save();

    return property;
  }

  async deleteProperty(id, user) {
    const property = await Property.findById(id);

    if (!property) {
      throw new Error("Property not found");
    }

    // Allow deletion if user is the owner OR user is an admin/superadmin
    const isAdmin = user.role === "admin" || user.role === "superadmin";
    if (property.owner.toString() !== user.id && !isAdmin) {
      throw new Error("Not authorized to delete this property");
    }

    await Property.findByIdAndDelete(id);
    return property;
  }
}

module.exports = new PropertyService();
