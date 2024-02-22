import { Router } from "express";
import CartsDBManager from "../dao/dbManagers/CartsDBManager.js";

const dbCartsRouter = Router();
const DBCartsManager = new CartsDBManager();

dbCartsRouter.get('/', async(req,res)=>{
    let download = await DBCartsManager.getCarts();
    let carritos = download;
    // console.log(carritos);
    res.render('carts',{
        carritos,
        title: `Listado de carritos`
    }) 
})

dbCartsRouter.get('/:ccod', async(req,res)=>{
    let {ccod} = req.params
    let download = await DBCartsManager.getCartById(ccod);
    let products = download.products;
    console.log(products);
    res.render('cartDetail', {
        ccod, products,
        title: `Productos en carrito código: ${ccod}`
    }) 
})

dbCartsRouter.post('/', async(req,res)=>{
    const newCart = req.body;    
    const upload = await DBCartsManager.addCart(newCart);
    res.send({status:"success", payload:upload})
})

dbCartsRouter.put('/:cId/products/:pId', async (req, res) => {
    const { cId, pId } = req.params;
    console.log("cId")
    console.log(cId)
    console.log("pId")
    console.log(pId)
    const addToCart = await DBCartsManager.addToCartById(cId, pId)
    res.send({ status: "success", payload: addToCart })
})

dbCartsRouter.delete('/:cId/products/:pId', async(req,res)=>{
    const { cId, pId } = req.params;   
    const deleteOne = await DBCartsManager.deleteProductById(cId,pId)
    res.send({status:"success", payload:deleteOne})
})

dbCartsRouter.put('/:cId', async(req,res)=>{
    const { cId } = req.params;
    const products = req.body;   
    const newProds = await DBCartsManager.updateProducts(cId, products)
    res.send({status:"success", payload:newProds})
})

dbCartsRouter.put('/:cId/products/:pId', async(req,res)=>{
    const { cId, pId } = req.params;
    const newQtty = parseInt(req.body.quantity);
    console.log(newQtty)
    const modQtty = await DBCartsManager.updateQuantity(cId, pId, newQtty)
    res.send({status:"success", payload:modQtty})
})

dbCartsRouter.delete('/:cId', async(req,res)=>{
    const { cId } = req.params;   
    const deleteProds = await DBCartsManager.emptyCart(cId)
    res.send({status:"success", payload:deleteProds})
})


export default dbCartsRouter;