import ProductService from '../services/product-service'
import { Response, Request, NextFunction } from 'express'
import { ProductModel } from '../models/product-model'
import { ApiError } from '../exceptions/api-error'
import { v4 } from 'uuid'
import * as process from 'process'
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
// import { UploadApiResponse } from 'cloudinary.UploadApiResponse'

class ProductController {
   async getAll(req: Request, res: Response) {
      try {
         const products = await ProductService.getAll()
         return res.json(products)
      } catch (e) {
         console.log(e)
      }
   }

   async addProduct(req: Request, res: Response, next: NextFunction) {
      try {
         const coverFile = req.body.cover

         const coverUrl = cloudinary.url(coverFile, {
            width: 500,
            height: 500,
         })

         const product = { ...req.body, cover: coverUrl }

         const existed = await ProductModel.findOne({ title: product.title })
         if (existed) {
            return next(
               ApiError.BadRequest(
                  `${product.title} is already exist, can't add one more`
               )
            )
         }

         const createdProduct = await ProductService.addProduct(product)

         if (typeof createdProduct !== 'string') {
            return res.json({
               createdProduct,
               message: 'new product was successfully added',
            })
         }
         return next(ApiError.BadRequest(createdProduct))
      } catch (e) {
         console.log(e)
      }
   }

   async getOne(req: Request, res: Response) {
      try {
         const { id } = req.params
         if (id) {
            const product = await ProductService.getOne(id)
            return res.json(product)
         }
         return res.json({ message: 'cant find this product' })
      } catch (e) {
         console.log(e)
      }
   }

   async uploadCover(req: any, res: Response) {
      try {
         const coverFile = req.files.file.data
         let buff = new Buffer(coverFile)
         let base64data = buff.toString('base64')

         const coverJSON = await cloudinary.uploader
            .upload(base64data)
            .then((result) => console.log(result))

         console.log('coverJSON', coverJSON)

         const cover = await ProductService.addProductCover({
            title: 'sd',
            image: JSON.stringify(coverJSON),
         })
         return res.status(200).json({ message: 'Upload cover success', cover })
      } catch (e) {
         console.log(e)
         return res.status(400).json({ message: 'Upload cover error' })
      }
   }
}

export default new ProductController()
