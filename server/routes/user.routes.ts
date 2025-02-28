import { Router } from "express";
import { UserService } from "../services/user.service";
import { authMiddleware } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { UpdateUserProfileInput } from "../models/user.model";

const router = Router();
const userService = new UserService();

/**
 * @route GET /api/users/me
 * @desc Get current user profile
 * @access Private
 */
router.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user!.uid;
    const user = await userService.getUserById(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route PUT /api/users/me
 * @desc Update current user profile
 * @access Private
 */
router.put(
  "/me",
  authMiddleware,
  validateRequest(UpdateUserProfileInput),
  async (req, res, next) => {
    try {
      const userId = req.user!.uid;
      const updateData = req.body;

      const updatedUser = await userService.updateUserProfile(
        userId,
        updateData,
      );

      res.status(200).json({
        success: true,
        data: updatedUser,
      });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * @route DELETE /api/users/me
 * @desc Delete current user account
 * @access Private
 */
router.delete("/me", authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user!.uid;

    await userService.deleteUserProfile(userId);

    res.status(200).json({
      success: true,
      message: "User account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route GET /api/users/:id
 * @desc Get a user by ID (admin only or public profile)
 * @access Private
 */
router.get("/:id", authMiddleware, async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user!.uid;
    const isAdmin = req.user!.admin === true;

    // Only allow access if requesting own data or if admin
    if (id !== currentUserId && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: "You do not have permission to access this resource",
      });
    }

    const user = await userService.getUserById(id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
