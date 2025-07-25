const UserConfig = require("../models/userConfig");

const category = async (req) => {
  const { categoryId } = req.params;

  try {
    const userConfig = await UserConfig.findOne({ userId: req.userId });

    if (!userConfig) {
      throw new Error("User not found");
    }

    const index = userConfig.followCategory.indexOf(Number(categoryId));
    if (index === -1) {
      userConfig.followCategory.push(Number(categoryId));
    } else {
      userConfig.followCategory.splice(index, 1);
    }

    await userConfig.save();

    return { success: true, followCategory: userConfig.followCategory };
  } catch (error) {
    console.error("Error updating follow category:", error);
    throw new Error("Internal server error");
  }
};

const history = async (req) => {
  const { postId } = req.params;

  try {
    const userConfig = await UserConfig.findOne({ userId: req.userId });

    if (!userConfig) {
      throw new Error("User not found");
    }

    const numericPostId = Number(postId);
    const currentTime = new Date();

    if (!userConfig.history || userConfig.history.length === 0) {
      userConfig.history = [{
        time: currentTime,
        postId: numericPostId
      }];
    } else {
      const existingEntryIndex = userConfig.history.findIndex(
        (entry) => entry.postId === numericPostId
      );

      if (existingEntryIndex !== -1) {
        userConfig.history[existingEntryIndex].time = currentTime;
        userConfig.markModified("history");
      } else {
        userConfig.history.push({
          time: currentTime,
          postId: numericPostId
        });
      }
    }

    await userConfig.save();

    console.log("Updated history:", userConfig.history); // Debug log
    return { success: true, history: userConfig.history };
  } catch (error) {
    console.error("Error updating history:", error);
    throw new Error("Internal server error");
  }
};

const favourite = async (req) => {
    const { postId } = req.params;

    try {
    const userConfig = await UserConfig.findOne({ userId: req.userId });

    if (!userConfig) {
      throw new Error("User not found");
    }

    const numericPostId = Number(postId);

    if (!userConfig.favourite || userConfig.favourite.length === 0) {
      userConfig.favourite = [{
        time: new Date(),
        postId: numericPostId
      }];
    } else {
      const newestEntry = userConfig.favourite[userConfig.favourite.length - 1];

      if (newestEntry.postId === numericPostId) {
        newestEntry.time = new Date();
      } else {
        userConfig.favourite.push({
          time: new Date(),
          postId: numericPostId
        });
      }
    }

    await userConfig.save();

    return { success: true, favourite: userConfig.favourite };
  } catch (error) {
    console.error("Error updating favourite:", error);
    throw new Error("Internal server error");
  }
}

const getHistory = async (req) => {
  try {
    const userConfig = await UserConfig.findOne({ userId: req.userId });

    if (!userConfig) {
      throw new Error("User not found");
    }

    return { 
      success: true, 
      history: userConfig.history || [] 
    };
  } catch (error) {
    console.error("Error retrieving history:", error);
    throw new Error("Internal server error");
  }
};

const getFavourite = async (req) => {
  try {
    const userConfig = await UserConfig.findOne({ userId: req.userId });

    if (!userConfig) {
      throw new Error("User not found");
    }

    return { 
      success: true, 
      favourite: userConfig.favourite || [] 
    };
  } catch (error) {
    console.error("Error retrieving favourite:", error);
    throw new Error("Internal server error");
  }
};

const delHistory = async (req) => {
  const { postId } = req.params;

  try {
    const userConfig = await UserConfig.findOneAndUpdate(
      { userId: req.userId },
      { $pull: { history: { postId: Number(postId) } } },
      { new: true }
    );

    if (!userConfig) {
      return {
        success: false,
        message: "User configuration not found"
      };
    }

    return {
      success: true,
      message: "Post deleted from history",
    };

  } catch (error) {
    return {
      success: false,
      message: "Error deleting post from history",
      error: error.message
    };
  }
};

const blockUser = async (userId, blockedUserId, reason) => {
    try {
        // Validate inputs
        if (!userId || !blockedUserId) {
            throw new Error('Invalid user IDs provided');
        }

        // Check if user is trying to block themselves
        if (userId === blockedUserId) {
            throw new Error('Cannot block yourself');
        }

        const userConfig = await UserConfig.findOne({ userId });
        if (!userConfig) {
            // Create new user config if it doesn't exist
            const newUserConfig = new UserConfig({
                userId: userId,
                block: [blockedUserId]
            });
            await newUserConfig.save();
            return {
                success: true,
                blockedUsers: [blockedUserId]
            };
        }

        // Initialize block array if it doesn't exist
        if (!userConfig.block) {
            userConfig.block = [];
        }

        // Check if user is already blocked
        if (userConfig.block.includes(blockedUserId)) {
            return {
                success: true,
                blockedUsers: userConfig.block
            };
        }

        // Add user to block list
        userConfig.block.push(blockedUserId);
        await userConfig.save();

        return {
            success: true,
            blockedUsers: userConfig.block
        };
    } catch (error) {
        console.error("Error blocking user:", error);
        throw new Error(`Error blocking user: ${error.message}`);
    }
};

const unblockUser = async (userId, blockedUserId) => {
    try {
        const userConfig = await UserConfig.findOne({ userId });
        if (!userConfig) {
            throw new Error('User config not found');
        }

        // Remove the blocked user from the array
        if (userConfig.block) {
            userConfig.block = userConfig.block.filter(id => id !== blockedUserId);
            await userConfig.save();
        }

        return {
            success: true,
            blockedUsers: userConfig.block || []
        };
    } catch (error) {
        console.error("Error unblocking user:", error);
        throw new Error(`Error unblocking user: ${error.message}`);
    }
};

const getBlockedUsers = async (userId) => {
    try {
        const userConfig = await UserConfig.findOne({ userId });
        if (!userConfig) {
            throw new Error('User config not found');
        }

        // Get the blocked users array
        const blockedUsers = userConfig.block || [];

        // For each blocked user, get their details from the users collection
        const blockedUsersWithDetails = await Promise.all(
            blockedUsers.map(async (blockedUserId) => {
                const [userDetails] = await pool.promise().query(
                    "SELECT userId, nickName, email FROM users WHERE userId = ?",
                    [blockedUserId]
                );

                return {
                    userId: blockedUserId,
                    nickName: userDetails[0]?.nickName || "Unknown User",
                    email: userDetails[0]?.email || "No email",
                    blockDate: new Date().toISOString(),
                    reason: "No reason provided"
                };
            })
        );

        console.log("Blocked users with details:", blockedUsersWithDetails); // Debug log
        return blockedUsersWithDetails;
    } catch (error) {
        console.error("Error getting blocked users:", error);
        throw new Error(`Error getting blocked users: ${error.message}`);
    }
};

module.exports = {
  category,
  history,
  favourite,
  getHistory,
  getFavourite,
  delHistory,
  blockUser,
  unblockUser,
  getBlockedUsers
};