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

                res.json({token});
            }
        );
    } catch(err){
        console.error(err.message);
        res.status(500).send('Something went wrong while trying to sign up!');
    }
};

exports.login = async(req,res) => {
    const {email,password} = req.body;

    try{
        const user = await Users.findOne({email});
        if(!user){
            return res.status(400).json({message:"Wrong credentials"});
        }
        const correctData = await bcrypt.compare(password,user.password);
        if(!correctData){
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
                if (err) throw err;

                res.cookie('token',token,{
                    httpOnly: true,
                    maxAge: 2 * 24 * 60 * 60 * 1000,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict'
                });

                res.json({token});
            }
        );
    } catch(err){
        console.error(err.message);
        res.status(500).send('Something went wrong while trying to sign in!');
    }
};

exports.logout = (req,res) => {
    res.clearCookie('token');
    res.json({message: 'Successfully logged out'});
};

exports.getMe = async (req, res) => {
    try {
      const user = await Users.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  };