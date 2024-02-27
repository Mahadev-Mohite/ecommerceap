import express from 'express'
import {
    createData,
    seeSeedData,
    searchAndPaginate,
    searchMonthOnly,
    statisticsMonth,
    barChart,
    pieChart,
    fetchDataFromAllApis
} from '../controller/seedData.Controller.js'
const router = express.Router();

router.get('/',createData);
router.get('/get-all',seeSeedData)
router.get('/statistics/:month',statisticsMonth)
router.get('/serach-month/:page/:month',searchMonthOnly)
router.get('/search/:page/:month/:title/:description/:price',searchAndPaginate)
router.get('/barchart/:month',barChart);
router.get('/piechart/:month',pieChart);
router.get('/fetch-all/:month',fetchDataFromAllApis)


export default router;