router.post("/block/:userId", auth, userConfigController.blockUser);
router.post("/unblock/:userId", auth, userConfigController.unblockUser); 