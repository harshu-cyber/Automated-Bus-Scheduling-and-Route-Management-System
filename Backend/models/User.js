const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true, lowercase: true },
    email:    { type: String, trim: true, lowercase: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ['admin', 'depot', 'driver', 'conductor', 'passenger'], default: 'admin' },
    fullName: { type: String, default: '' },
    phone:    { type: String, default: '' },
    location: { type: String, default: '' },
    depot:    { type: String, default: '' },
    depotId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Depot', default: null },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
