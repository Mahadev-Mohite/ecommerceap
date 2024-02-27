import prisma from "../db/db.config.js";
import request from "request";
import customErrorHandler from "../utils/customErrorHandeler.js"

const fetchData = (req,res,next) => {
    try{
        return new Promise((resolve, reject) => {
            const seedDataUrl = "https://s3.amazonaws.com/roxiler.com/product_transaction.json";
            request(seedDataUrl, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    try {
                        const data = JSON.parse(body);
                        resolve(data); 
                    } catch (err) {
                        reject(err); 
                    }
                } else {
                    reject(error); 
                }
            });
        });
    }catch(error){
        next(error)
    }
    
};

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); 
    const year = date.getFullYear().toString().slice(-2); 
    const day = date.getDate().toString().padStart(2, '0');

    return `${month}-${year}-${day}`;
};

const createData = async (req, res, next) => {
    try{
        let data = await fetchData()
        let createSeedFlag = true;
        if(data){
            data.forEach(async(element) => {
                const formattedDate = formatDate(element.dateOfSale);
                let temp = await prisma.seed.create({
                    data:{
                    productId:element.id,
                    title:element.title,
                    price:element.price,
                    description:element.description,
                    category:element.category,
                    image:element.image,
                    sold:element.sold,
                    dateOfSale:formattedDate,
                    }
                })
                if(!temp){
                    createSeedFlag = false;
                    return
                }
                
            });
            if(createSeedFlag){
                return res.send({message:"Successful.",data:data})
            }else{
                return next(customErrorHandler("Failed to creat seed data.",500))
            }
        }else{
            return next(customErrorHandler(400,"Could not fetch data."))
        }
    }catch(error){
        next(error)
    }
    
};

const seeSeedData = async (req,res,next) =>{
    try{
        let data = await prisma.seed.findMany({})
        return res.send({message:"Data load successfull.",success:true,data:data})
    }catch(error){
        next(error)
}
};

const searchAndPaginate = async (req, res, next) => {
    try {
        const { month, page, title, description, price} = req.params;
        const perPage = 10;
        const pageNumber = parseInt(page) || 1; 
        const skip = (pageNumber - 1) * perPage;
        let monthSerach = month.toString().padStart(2,'0')

        const results = await prisma.seed.findMany({
            skip,
            take: perPage,
            where: {
                AND: [
                    {
                        OR: [
                            { title: { contains: title || '' } },
                            { description: { contains: description || '' } },
                            { price: parseFloat(price) || undefined } 
                        ]
                    },
                    {
                        dateOfSale: {
                            startsWith: `${monthSerach}`
                        }
                    }
                ]
            },
            orderBy: { id: 'asc' },
        });

        res.send(results);
    } catch (error) {
        next(error);
    }
};


const searchMonthOnly = async(req,res)=>{
    const { month, page} = req.params;
    const perPage = 10;
        const pageNumber = parseInt(page) || 1; 
        const skip = (pageNumber - 1) * perPage;
        let monthSerach = month.toString().padStart(2,'0')

        const results = await prisma.seed.findMany({
            skip,
            take: perPage,
            where: {
                dateOfSale: {
                    startsWith: `${monthSerach}-`
                }     
            },
            orderBy: { id: 'asc' },
        });
    
        res.send(results);
}

const statisticsMonth = async(req,res) =>{
    try{
        const { month} = req.params;
    let monthSerach = month.toString().padStart(2,'0')
    const results = await prisma.seed.findMany({
        where: {
            dateOfSale: {
                startsWith: `${monthSerach}-`
            }     
        }
    });

    let saleAmount =0;
    let soldItems =0;
    let unSoldItems =0;

    results.forEach(async(item)=>{
        if(item.sold){
            saleAmount += item.price
            soldItems +=1
        }else{
            unSoldItems +=1;
        }
    })

    let data = {
        saleAmount:saleAmount,
        soldItems:soldItems,
        unSoldItems:unSoldItems
    }

    return res.send({message:"Statistics load successfull.",data:data,success:true})

    }catch(error){
        next(error)
    }
    
}

const generatePriceRanges = (price) => {
    if (price >= 0 && price <= 100) {
        return '0 - 100';
    } else if (price >= 101 && price <= 200) {
        return '101 - 200';
    } else if (price >= 201 && price <= 300) {
        return '201 - 300';
    } else if (price >= 301 && price <= 400) {
        return '301 - 400';
    } else if (price >= 401 && price <= 500) {
        return '401 - 500';
    } else if (price >= 501 && price <= 600) {
        return '501 - 600';
    } else if (price >= 601 && price <= 700) {
        return '601 - 700';
    } else if (price >= 701 && price <= 800) {
        return '701 - 800';
    } else if (price >= 801 && price <= 900) {
        return '801 - 900';
    } else {
        return '901 - above';
    }
};

const generateBarChartData = async (month) => {
    const results = await prisma.seed.findMany({
        where: {
            dateOfSale: {
                startsWith: `${month}`
            }
        },
        select: {
            price: true
        }
    });

    const priceRangesCount = {
        '0 - 100': 0,
        '101 - 200': 0,
        '201 - 300': 0,
        '301 - 400': 0,
        '401 - 500': 0,
        '501 - 600': 0,
        '601 - 700': 0,
        '701 - 800': 0,
        '801 - 900': 0,
        '901 - above': 0
    };

    results.forEach(seed => {
        const priceRange = generatePriceRanges(seed.price);
        priceRangesCount[priceRange]++;
    });

    return priceRangesCount;
};

const barChart = async (req, res, next) => {
    try {
        const { month } = req.params;
        let SerachMonth = month.toString().padStart(2,'0');
        const barChartData = await generateBarChartData(SerachMonth);
        res.send(barChartData);
    } catch (error) {
        next(error);
    }
};

const pieChart = async(req,res,next)=>{
    try{

        const { month } = req.params;
        let SerachMonth = month.toString().padStart(2,'0');
        const results = await prisma.seed.findMany({
            where: {
                dateOfSale: {
                    startsWith: `${SerachMonth}`
                }
            }
        });
        let categoryCounts = {};
    
        results.forEach(seed => {
            const category = seed.category;
            if (categoryCounts[category]) {
                categoryCounts[category]++;
            } else {
                categoryCounts[category] = 1;
            }
        });
    
        return res.send({message:"piechart load sucessfull,",data:categoryCounts});
    }catch(error){
        next(error);
    }
}

const fetchDataFromAllApis = async (req, res, next) => {
    try {
        const { month } = req.params;
        let SerachMonth = month.toString().padStart(2,'0');
        const api1Promise = new Promise((resolve, reject) => {
            request.get(`http://localhost:3000/pieChart/${month}`, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });

        const api2Promise = new Promise((resolve, reject) => {
            request.get(`http://localhost:3000/barchart/${month}`, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });

        const api3Promise = new Promise((resolve, reject) => {
            request.get(`http://localhost:3000/statistics/${SerachMonth}`, (error, response, body) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(body));
                }
            });
        });

        const [data1, data2, data3] = await Promise.all([api1Promise, api2Promise, api3Promise]);

        const combinedData = {
            piechart: data1,
            barchart: data2,
            statistics: data3
        };

        res.json(combinedData);
    } catch (error) {
        next(error);
    }
};

export {
    createData,
    seeSeedData,
    searchAndPaginate,
    searchMonthOnly,
    statisticsMonth,
    barChart,
    pieChart,
    fetchDataFromAllApis
};
