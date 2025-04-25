const Users = require('../models/Users');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async(req,res) => {
    const {firstName,lastName,email,password}=req.body;

    try{
        let user = await Users.findOne({email});
        if(user){
            return res.status(400).json({message: 'An account with this email already exists!'});
        }

        user = new Users({
            firstName,
            lastName,
            email,
            password
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password,salt);

        await user.save();

        const payload = {
            user:{
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: '2d'},
            (err,token) =>{
                if (err) throw err;

                res.cookie('token',token,{
                    httpOnly: true,
                    maxAge: 2 * 24 * 60 * 60 * 1000,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });

                // Send user data without password
                const userResponse = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    totalBalance: user.totalBalance,
                    availableFunds: user.availableFunds,
                    investedAmount: user.investedAmount
                };

                res.json({ user: userResponse });
            }
        );
    } catch(err){
        console.error('Register error:', err);
        res.status(500).send('Something went wrong while trying to sign up!');
    }
};

exports.login = async(req,res) => {
    const {email,password} = req.body;
    
    console.log('Login attempt:', { email });

    try{
        const user = await Users.findOne({email});
        console.log('User found:', user ? 'Yes' : 'No');
        
        if(!user){
            console.log('User not found with email:', email);
            return res.status(400).json({message:"Wrong credentials"});
        }

        const correctData = await bcrypt.compare(password,user.password);
        console.log('Password correct:', correctData);
        
        if(!correctData){
            console.log('Invalid password for user:', email);
            return res.status(400).json({message:"Wrong credentials"});
        }

        const payload = {
            user:{
                id: user.id
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {expiresIn: '2d'},
            (err,token) =>{
                if (err) {
                    console.error('JWT Sign error:', err);
                    throw err;
                }

                res.cookie('token',token,{
                    httpOnly: true,
                    maxAge: 2 * 24 * 60 * 60 * 1000,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });

                // Send user data without password
                const userResponse = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    totalBalance: user.totalBalance,
                    availableFunds: user.availableFunds,
                    investedAmount: user.investedAmount
                };

                console.log('Login successful for:', email);
                res.json({ user: userResponse });
            }
        );
    } catch(err){
        console.error('Login error:', err);
        res.status(500).send('Something went wrong while trying to sign in!');
    }
};

exports.logout = (req,res) => {
    res.clearCookie('token');
    res.json({message: 'Successfully logged out'});
};

exports.getMe = async (req, res) => {
    try {
        // req.user is already populated by the auth middleware
        const user = await Users.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error('GetMe error:', err);
        res.status(500).send('Server error');
    }
};