import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { AuthRequest } from '../types';
import { ApiError } from '../middleware/errorHandler';

// @desc    Get user profile
// @route   GET /api/users/profile
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, phone, avatar } = req.body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user!.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
export const changePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user!.id).select('+password');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      throw new ApiError(400, 'Current password is incorrect');
    }

    user.password = newPassword;
    user.refreshToken = undefined; // Invalidate all sessions
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully. Please login again.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user addresses
// @route   GET /api/users/addresses
export const getAddresses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id).select('addresses');
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    res.json({
      success: true,
      data: { addresses: user.addresses },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add address
// @route   POST /api/users/addresses
export const addAddress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // If this is set as default, unset other defaults
    if (req.body.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    // If first address, make it default
    if (user.addresses.length === 0) {
      req.body.isDefault = true;
    }

    user.addresses.push(req.body);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: { addresses: user.addresses },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
export const updateAddress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const address = (user.addresses as any).id(req.params.addressId);
    if (!address) {
      throw new ApiError(404, 'Address not found');
    }

    // If setting as default, unset other defaults
    if (req.body.isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    Object.assign(address, req.body);
    await user.save();

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: { addresses: user.addresses },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
export const deleteAddress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const addressIndex = user.addresses.findIndex(
      (addr) => (addr as any)._id?.toString() === req.params.addressId
    );

    if (addressIndex === -1) {
      throw new ApiError(404, 'Address not found');
    }

    const wasDefault = (user.addresses[addressIndex] as any).isDefault;
    user.addresses.splice(addressIndex, 1);

    // If deleted address was default, make first remaining address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Address deleted successfully',
      data: { addresses: user.addresses },
    });
  } catch (error) {
    next(error);
  }
};
