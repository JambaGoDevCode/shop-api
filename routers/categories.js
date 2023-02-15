const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();

// get for category
router.get(`/`, async (req, res) =>{
    const categoryList = await Category.find();

    if(!categoryList){
        res.status(500).json({
            success: false
        })
    }
    res.status(200).send(categoryList);
})

// get only one category
router.get('/:id', async(req, res)=>{
    const category = await Category.findById(req.params.id);

    if(!category){
        res.status(500).json({
            message: 'Está categoria não foi encontrada'
        })
    }

    res.status(200).send(category);
})


router.put('/:id', async (req, res)=>{
    const category = await Category.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            icon: req.body.icon,
            color: req.body.color,
        },
        { new: true}
    )

    if(!category) 
    return res.status(400).send(' Está categia não pode ser atualizada')

    res.send(category);
})





// create category
router.post('/', async (req, res)=>{
    let category = new Category({
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color,
    })

    category = await category.save();

    if(!category)
    return res.status(404).send('Esta categoria não pode ser criada!')

    res.send(category);
})


// delete category
router.delete('/:id', (req, res)=>{
    Category.findByIdAndRemove(req.params.id).then(category =>{
        if(category){
            return res.status(200).json({
                success: true,
                message: 'Categoria eliminada!',
            })
        }else{
            return res.status(404).json({
                success: false, 
                message: 'Categoria não encontrada.',
            })
        }
    }).catch(err=>{
        return res.status(400).json({
            success: false, 
            error: err,
        })
    })
})

module.exports = router;