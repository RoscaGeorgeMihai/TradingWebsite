const Users = require('../models/Users');
const bcrypt = require('bcryptjs');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = async (req, res) => {
    try {
        const user = await Users.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('Error getting user profile:', err);
        res.status(500).send('Server error');
    }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { firstName, lastName, email } = req.body;

        // Build profile object
        const profileFields = {};
        if (firstName) profileFields.firstName = firstName;
        if (lastName) profileFields.lastName = lastName;
        if (email) profileFields.email = email;

        let user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update user
        user = await Users.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error('Error updating user profile:', err);
        res.status(500).send('Server error');
    }
};

// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await Users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check current password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Error updating password:', err);
        res.status(500).send('Server error');
    }
};

// @desc    Update newsletter subscription
// @route   PUT /api/users/newsletter
// @access  Private
exports.updateNewsletterSubscription = async (req, res) => {
    try {
        const { subscribed } = req.body;

        if (typeof subscribed !== 'boolean') {
            return res.status(400).json({ message: 'Invalid subscription status' });
        }

        const user = await Users.findByIdAndUpdate(
            req.user.id,
            { newsletterSubscribed: subscribed },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: subscribed ? 'Successfully subscribed to newsletter' : 'Successfully unsubscribed from newsletter',
            newsletterSubscribed: user.newsletterSubscribed
        });
    } catch (err) {
        console.error('Error updating newsletter subscription:', err);
        res.status(500).send('Server error');
    }
}; 