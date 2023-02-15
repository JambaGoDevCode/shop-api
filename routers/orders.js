const { Order} = require('../models/order');
const express = require('express');
const { OrderItems } = require('../models/order-items');
const router = express.Router();


// get the orderList
router.get(`/`, async (req, res)=>{
    const orderList = await Order.find().populate('user', 'name email image').sort({'dateOrderd': -1});

    if(!orderList){
        res.status(500).json({
            success: false
        })
    }
    res.send(orderList);
})

 

// create order
router.post('/', async (req, res)=>{
    const orderItemsIds = Promise.all(req.body.orderItems.map(async orderItems =>{
        let newOrderItem = new OrderItems({
            quantity: orderItems.quantity,
            product: orderItems.product
        })

        newOrderItem = await newOrderItem.save();
        return newOrderItem._id;
    }))
    // resolve a promise
    const orderItemsIdsResolved = await orderItemsIds;


    // calculate de total price of orderItems
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemsIds)=>{
        const orderItems = await OrderItems.findById(orderItemsIds).populate('product', 'price');
        const totalPrice = orderItems.product.price * orderItems.quantity;
        return totalPrice;
    }))

    const totalPrice = totalPrices.reduce((a,b)=> a+b, 0);

    console.log(typeof(totalPrices));
  
    let order = new Order({
        orderItems: orderItemsIdsResolved,
        shippingAddress1: req.body.shippingAddress1,
        shippingAddress2: req.body.shippingAddress2,
        city: req.body.city,
        zip: req.body.zip,
        country: req.body.country,
        phone: req.body.phone,
        status: req.body.status,
        totalPrice: totalPrice,
        user: req.body.user,
    })
  
    order = await order.save();

    if(!order)
    return res.status(404).send('pedidos vazio!')

    res.send(order);
})

 

// delete order
router.delete('/:id', (req, res)=>{
    Order.findByIdAndRemove(req.params.id).then(async order =>{
        if(order){
            await order.orderItems.map( async order=>{
                await orderItems.findByIdAndRemove(orderItems)
            })
            return res.status(200).json({
                success: true,
                message: 'Pedido eliminado!',
            })
        }else{
            return res.status(404).json({
                success: false, 
                message: 'Pedido não encontrada.',
            })
        }
    }).catch(err=>{
        return res.status(500).json({
            success: false, 
            error: err,
        })
    })
})


// show detals of order to Admin panel

router.get('/get/totalsales', async (req, res)=>{
    const totalSales = await Order.aggregate([
        {$group: {_id:null, totalsales: { $sum: '$totalPrice'}}}
    ]) 

    if(!totalSales){
        return res.status(400).send('O total de pedidos não gerado!')
    }

    res.send({totalsales: totalSales.pop().totalsales})
})


// get count the number of orders
router.get(`/get/count`, async (req, res)=>{
    const orderCount = await Order.find({}).count()

    if(!orderCount){
        res.status(500).json({success:false})
    }
    res.send({
        orderCount: orderCount
    })
});



// get the orderList history User 
router.get(`/get/usersorders/:userid`, async (req, res)=>{
    const userOrderList = await Order.find({user: req.params.userid}).populate({
        path:'orderItems', populate:{
        path:'product', populate:'category'
    }}).sort({'dateOrderd': -1});

    if(!userOrderList){
        res.status(500).json({
            success: false
        })
    }
    res.send(userOrderList);
})


// update de ordes 
router.put('/:id', async (req, res)=>{
    const order = await Order.findByIdAndUpdate(
        req.params.id,
        {
         status: req.body.status
        },
        { new: true}
    )

    if(!order) 
    return res.status(400).send('Estado do produto não atualizado!')

    res.send(order);
})

 
// get the only one order
router.get(`/:id`, async (req, res)=>{
    const order = await Order.findById(req.params.id)
    .populate('user', 'name email image')
    .populate({
        path: 'orderItems', populate:{
            path:'product', populate:'category'
        }
    });

    if(!order){
        res.status(500).json({
            success: false
        })
    }
    res.send(order);
})



module.exports = router;