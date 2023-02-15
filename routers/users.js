const { User} = require('../models/user');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


// get list of users
router.get(`/`, async (req, res) =>{
    const userList = await User.find().select('-passwordHash');

    if(!userList){
        res.status(500).json({
            success: false
        })
    }
    res.send(userList);
})



// create user
router.post('/', async (req, res)=>{
    
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        image: req.body.image,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })

    user = await user.save();

    if(!user)
    return res.status(404).send('Usuário não pode ser criada!')

    res.send(user);
})



// get login user with token (jwt)
router.post('/login', async(req, res)=>{

    const user = await User.findOne({email: req.body.email})
    const secret = process.env.secret;

    if(!user){
        return res.status(400).send('Usuário não encontrado');
    }

    if(user && bcrypt.compareSync(req.body.password, user.passwordHash)){
        const  token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin,
            },
            secret,
            {expiresIn:"7d",}
        )
        
        res.status(200).send({user: user.email, token: token})
    }else{
        res.status(400).send('Senha incorreta!')
    }
})

  
// Post Register user 
router.post('/register', async (req, res)=>{
    
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        image: req.body.image,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    })

    user = await user.save();

    if(!user)
    return res.status(400).send('Usuário não pode ser criada!')

    res.send(user);
})


// get count the number of products
router.get(`/get/count`, async (req, res)=>{
    const userCount = await User.find({}).count()

    if(!userCount){
        res.status(500).json({success:false})
    }
    res.send({
        userCount: userCount
    })
});


// get only one user
router.get('/:id', async(req, res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash');

    if(!user){
        res.status(500).json({
            message: 'Usuário não foi encontrado'
        })
    }
    res.status(200).send(user);
})



module.exports = router;