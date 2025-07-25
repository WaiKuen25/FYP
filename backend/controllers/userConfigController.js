const userConfigService = require("../services/userConfigService");

const category = async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: "User is not authenticated" });
  }
  try {
    const data = await userConfigService.category(req);
    res.json(data);
  } catch (error) {
    console.error("Error in category controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const history = async (req, res) => {
  if(!req.userId) {
    return res.status(401).json({error: "User is not authenticated"});
  }
  try {
    const data = await userConfigService.history(req);
    res.json(data);
  } catch (error) {
    console.error("Error in history controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const favourite = async (req, res) => {
  if(!req.userId) {
    return res.status(401).json({error: "User is not authenticated"});
  }
  try {
    const data = await userConfigService.favourite(req);
    res.json(data);
  } catch (error) {
    console.error("Error in favourite controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const getHistory = async (req, res) => {
  if(!req.userId) {
    return res.status(401).json({error: "User is not authenticated"});
  }
  try {
    const data = await userConfigService.getHistory(req);
    res.json(data);
  } catch (error) {
    console.error("Error in getHistory controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const getFavourite = async (req, res) => {
  if(!req.userId) {
    return res.status(401).json({error: "User is not authenticated"});
  }
  try {
    const data = await userConfigService.getFavourite(req);
    res.json(data);
  } catch (error) {
    console.error("Error in getHistory controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const delHistory = async (req, res) => {
   if(!req.userId) {
    return res.status(401).json({error: "User is not authenticated"});
  }
  try {
    const data = await userConfigService.delHistory(req);
    res.json(data);
  } catch (error) {
    console.error("Error in delHistory controller:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}

const blockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const { reason } = req.body;
        
        if (!req.userId) {
            return res.status(401).json({ 
                success: false,
                message: 'User not authenticated' 
            });
        }

        console.log("Blocking user:", { 
            currentUserId: req.userId, 
            blockedUserId: userId, 
            reason: reason 
        }); // Debug log

        const result = await userConfigService.blockUser(req.userId, userId, reason);
        console.log("Block user result:", result); // Debug log

        res.json(result);
    } catch (error) {
        console.error("Error in blockUser controller:", error);
        res.status(400).json({ 
            success: false,
            message: error.message || "Failed to block user"
        });
    }
};

const unblockUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!req.userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const result = await userConfigService.unblockUser(req.userId, userId);
        res.json(result);
    } catch (error) {
        console.error("Error in unblockUser controller:", error);
        res.status(400).json({ message: error.message });
    }
};

const getBlockedUsers = async (req, res) => {
    try {
        if (!req.userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const userConfig = await userConfigService.getBlockedUsers(req.userId);
        res.json(userConfig.block || []);
    } catch (error) {
        console.error("Error in getBlockedUsers controller:", error);
        res.status(400).json({ message: error.message });
    }
};

module.exports = { category, history, favourite, getHistory, getFavourite, delHistory, blockUser, unblockUser, getBlockedUsers };
