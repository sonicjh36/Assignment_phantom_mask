const express = require('express');
const router  = express.Router();

const pharmacyController = require('../controlller/pharmacy')
const userController = require('../controlller/user')
const maskController = require('../controlller/mask')
const transController = require('../controlller/transaction')

const knex = require('knex')({
    client: 'pg',
    connection: {
        host: 'db' || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: 'phantom_mask'
    }
});

router.use(express.json());

router.get('/' ,(req,res) =>{
    res.send("Hello there");
});

/**
 * @swagger
 *  /api/pharmacy:
 *      get:
 *          summary: List all pharmacies that are open at a certain datetime or on a day of the week, at a certain time
 *          tags: [Pharmacy]
 *          description:   (1) Get the pharmacy list by a certain datetime, please input datetime only.
 *                  <br> (2) Get the parmacy list a day of the week, at a certain time, dayofweek and time are required.
 *          parameters:
 *          - name: dateTime
 *            type: string
 *            in: query
 *            example: 2021-01-02 13:00
 *          - name: dayofweek
 *            type: string
 *            in: query
 *            description: Input the abbreviation of the day of the week
 *            example: mon
 *          - name: time
 *            type: string
 *            in: query
 *            example: 13:00
 *          responses:
 *              200:
 *                  description: A list of phaymacies with time open(begin_time) and close(end_time)
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  type: object
 *                                  properties:
 *                                      name:
 *                                          type: string
 *                                          description: The pharmacy name
 *                                          example: Better You
 *                                      begin_time:
 *                                          type: string
 *                                          description: The time that pharmacy will open on the day
 *                                          example: 12:21:00
 *                                      end_time:
 *                                          type: string
 *                                          description: The time that the pahrmacy will close on the day
 *                                          example: 13:00:00
 *              400:
 *                  description: Error message
 */

router.get('/pharmacy', (req,res) => pharmacyController.byTime(req,res,knex));

/**
 * @swagger
 *  /api/pharmacy/mask:
 *      get:
 *          summary: List all pharmacies that have more or less than x mask products within a price range
 *          tags: [Pharmacy]
 *          parameters:
 *          - name: amount
 *            type: string
 *            in: query
 *            required: true
 *            example: morethan5
 *            description: Input morethan or lessthan and the number after it.
 *          - name: priceRange
 *            type: string
 *            in: query
 *            required: true
 *            description: Input the price range with a '-' symbol
 *            example: 5-30
 *          responses:
 *              200:
 *                  description: A list of phaymacies with mask name, price and amount
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  type: object
 *                                  properties:
 *                                      pharmacy:
 *                                          type: string
 *                                          example: Better You
 *                                      name:
 *                                          type: string
 *                                          example: Better You
 *                                      price:
 *                                          type: string
 *                                          example: 12:21:00
 *                                      amount:
 *                                          type: integer
 *                                          example: 20
 *              400:
 *                  description: Error message
 */
router.get('/pharmacy/mask', (req,res) => pharmacyController.withMask(req,res,knex));

/**
 * @swagger
 *  /api/pharmacy/{name}:
 *      put:
 *          summary: Edit pharmacy name
 *          tags: [Pharmacy]
 *          parameters:
 *          - name: name
 *            type: string
 *            in: path
 *            required: true
 *            example: Cash Saver Pharmacy
 *            description: Input a Pharmacy name which is in the database.
 *          requestBody:
 *              content:
 *                  'application/json':
 *                      schema:
 *                       required:
 *                           - newName
 *                       properties:
 *                        newName:
 *                           type: string
 *                           example: good good pharmacy
 *          responses:
 *              200:
 *                  description: Update status
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  success:
 *                                      type: string
 *                                      description: Success or not
 *                                      example: true
 *                                  rowCount:
 *                                      type: string
 *                                      description: Updated row count
 *                                      example: 1
 *              400:
 *                  description: Error message
 *              404:
 *                  description: Executed but no row update
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  success:
 *                                      type: string
 *                                      example: fail
 */
router.put('/pharmacy/:name', (req,res) => pharmacyController.editName(req,res,knex));
/**
 * @swagger
 *  /api/search:
 *      get:
 *          summary: Search for pharmacies or masks by name, ranked by relevance to search term
 *          tags: [Search]
 *          parameters:
 *          - name: name
 *            type: string
 *            in: query
 *            required: true
 *            description: Keyword for searching.
 *          responses:
 *              200:
 *                  description: A list of name
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  type: object
 *                                  properties:
 *                                      name:
 *                                          type: string
 *                                          description: The pharmacy name
 *                                          example: Better You
 *              400:
 *                  description: Error message
 */
router.get('/search', (req,res) => pharmacyController.searchMaskOrPharmacy(req,res,knex));

/**
 * @swagger
 *  /api/user/top{num}:
 *      get:
 *          summary: The top x users by total transaction amount of masks within a date range
 *          tags: [User]
 *          parameters:
 *          - name: num
 *            type: integer
 *            in: path
 *            required: true
 *            description: Indicate how many user in the top
 *            example: 5
 *          - name: dateRange
 *            type: string
 *            in: query
 *            required: true
 *            example: 20210101-20210331
 *          responses:
 *              200:
 *                  description: A list of user name and their sum for the transaction.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  type: object
 *                                  properties:
 *                                      name:
 *                                          type: string
 *                                          description: The user name
 *                                          example: Eric Underwood
 *                                      total:
 *                                           type: number
 *                                           multipleOf: 0.01
 *                                           example: 779.96
 *              400:
 *                  description: Error message
 */

router.get('/user/top:num', (req,res) => userController.top(req,res,knex));

/**
 * @swagger
 *  /api/mask/{pharmacy}:
 *      get:
 *          summary: List all masks that are sold by a given pharmacy, sorted by mask name or mask price
 *          tags: [Mask]
 *          parameters:
 *          - name: pharmacy
 *            required: true
 *            in: path
 *            schema:
 *              type: string
 *              description: The pharmacy name
 *              example: Cash Saver Pharmacy
 *          - name: sort
 *            type: string
 *            in: query
 *            required: true
 *            description: Input the 'price' or 'name' to determine the sorting method
 *          responses:
 *              200:
 *                  description: A list with phaymacy name, mask name, amount and price
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  type: object
 *                                  properties:
 *                                      pharmacy_name:
 *                                          type: string
 *                                          description: The pharmacy name
 *                                          example: Better You
 *                                      mask_name:
 *                                          type: string
 *                                          description: The mask name
 *                                          example: MaskT (black) (10 per pack)
 *                                      amonut:
 *                                          type: integer
 *                                          description: The mask amount
 *                                          example: 10
 *                                      price:
 *                                          type: number
 *                                          multipleOf: 0.01
 *                                          description: The mask price
 *                                          example: 13.83
 *              400:
 *                  description: Error message
 */

router.get('/mask/:pharmacy',(req,res) => maskController.sortByPharmacy(req,res,knex));
/**
 * @swagger
 *  /api/mask/{name}}:
 *      put:
 *          summary: Edit mask name
 *          tags: [Mask]
 *          parameters:
 *          - name: name
 *            required: true
 *            in: path
 *            description: Input a mask name which is in the database.
 *            schema:
 *              type: string
 *              example: MaskT (black) (10 per pack)
 *          requestBody:
 *              description: If input the pharmacyName in the request body means only change the mask name sold by the given pharmacy.
 *              content:
 *                  'application/json':
 *                      schema:
 *                       required:
 *                           - newName
 *                       properties:
 *                        newName:
 *                           type: string
 *                           example: good good mask
 *                        pharmacyName:
 *                           type: string
 *                           example: Cash Saver Pharmacy
 *          responses:
 *              200:
 *                  description: Update status
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  success:
 *                                      type: string
 *                                      description: Success or not
 *                                      example: true
 *                                  rowCount:
 *                                      type: string
 *                                      description: Updated row count
 *                                      example: 1
 *              400:
 *                  description: Error message
 *              404:
 *                  description: Executed but no row update
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  success:
 *                                      type: string
 *                                      example: fail
 */
router.put('/mask/:name',(req,res) => maskController.editName(req,res,knex));
/**
 * @swagger
 *  /api/mask/{name}/price:
 *      put:
 *          summary: Edit mask price
 *          tags: [Mask]
 *          parameters:
 *          - name: name
 *            required: true
 *            in: path
 *            schema:
 *              type: string
 *              description: Input a mask name which is in the database.
 *              example: Masquerade (blue) (6 per pack)
 *          requestBody:
 *              description: If input the pharmacyName in the request body means only change the mask price sold by the given pharmacy.
 *              content:
 *                  'application/json':
 *                      schema:
 *                       required:
 *                           - newPrice
 *                       properties:
 *                        newPrice:
 *                           type: number
 *                           example: 10.3
 *                        pharmacyName:
 *                           type: string
 *                           example: Cash Saver Pharmacy
 *          responses:
 *              200:
 *                  description: Update status
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  success:
 *                                      type: string
 *                                      description: Success or not
 *                                      example: true
 *                                  rowCount:
 *                                      type: string
 *                                      description: Updated row count
 *                                      example: 1
 *              400:
 *                  description: Error message
 *              404:
 *                  description: Executed but no row update
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  success:
 *                                      type: string
 *                                      example: fail
 */
router.put('/mask/:name/price',(req,res) => maskController.editPrice(req,res,knex));

/**
 * @swagger
 *  /api/mask/{maskName}:
 *      delete:
 *          summary: Delete mask by a mask name
 *          tags: [Mask]
 *          parameters:
 *          - name: maskName
 *            required: true
 *            in: path
 *            schema:
 *              type: string
 *              description: Input a mask name which is in the database.
 *              example: Masquerade (blue) (6 per pack)
 *          - name: pharmacyName
 *            in: query
 *            type: string
 *            example: Cash Saver Pharmacy
 *            description: Input the pharmacyName only delete the mask by the given pharmacy name.
 *          responses:
 *              200:
 *                  description: Update status
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  success:
 *                                      type: string
 *                                      description: Success or not
 *                                      example: true
 *                                  rowCount:
 *                                      type: string
 *                                      description: Updated row count
 *                                      example: 1
 *              400:
 *                  description: Error message
 *              404:
 *                  description: Executed but no row update
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: object
 *                              properties:
 *                                  success:
 *                                      type: string
 *                                      example: fail
 */
router.delete('/mask/:maskName',(req,res) => maskController.deleteMask(req,res,knex));

/**
 * @swagger
 *  /api/transaction:
 *      get:
 *          summary: The total amount of masks and dollar value of transactions that happened within a date range
 *          tags: [Transaction]
 *          parameters:
 *          - name: dateRange
 *            type: string
 *            in: query
 *            required: true
 *            example: 20210101-20210310
 *          responses:
 *              200:
 *                  description: The total amount of mask and dollar value of the transaction.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  type: object
 *                                  properties:
 *                                      transaction_amount:
 *                                          type: number
 *                                          multipleOf: 0.01
 *                                          example: 779.96
 *                                      mask_amount:
 *                                          type: integer
 *                                          example: 100
 *              400:
 *                  description: Error message
 */
router.get('/transaction', (req,res) => transController.get(req,res,knex));
/**
 * @swagger
 *  /api/transaction:
 *      post:
 *          summary: Process a user purchases a mask from a pharmacy, and handle all relevant data changes in an atomic transaction
 *          tags: [Transaction]
 *          requestBody:
 *              content:
 *                  'application/json':
 *                      schema:
 *                       required:
 *                          - userName
 *                          - pharmacyName
 *                          - maskName
 *                          - dateRange
 *                       properties:
 *                          userName:
 *                              type: string
 *                              example: Eric Underwood
 *                          pharmacyName:
 *                              type: string
 *                              example: Cash Saver Pharmacy
 *                          maskName:
 *                              type: string
 *                              example: Masquerade (green) (6 per pack)
 *                          datetime:
 *                              type: string
 *                              example: 2021-04-28 19:00
 *          responses:
 *              200:
 *                  description: success status.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  type: object
 *                                  properties:
 *                                      status:
 *                                          type: string
 *                                          example: success
 *              400:
 *                  description: fail status.
 *                  content:
 *                      application/json:
 *                          schema:
 *                              type: array
 *                              items:
 *                                  type: object
 *                                  properties:
 *                                      status:
 *                                          type: string
 *                                          example: fail
 *                                      message:
 *                                          type: string
 *                                          example: error message
 */
router.post('/transaction', async (req,res) => transController.add(req,res,knex));

module.exports = router;