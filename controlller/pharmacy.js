const dayIndex = {
    0:"Sun",
    1:"Mon",
    2:"Tue",
    3:"Wed",
    4:"Thu",
    5:"Fri",
    6:"Sat"
}

const byTime = (req,res,knex) => {
    // List all pharmacies that are open at a certain datetime
    if(req.query.dateTime && !req.query.dayofweek && !req.query.time) {
        const{dateTime} = req.query;
        let day = new Date(dateTime).getDay();
        let hour = new Date(dateTime).getHours().toString();
        let min = new Date(dateTime).getMinutes().toString();
        if(hour.length < 2) hour = "0" + hour;
        if(min.length < 2) min = "0" + min;
        let time = hour+min;
        knex('open_hours')
            .join('pharmacies', 'pharmacies.id', 'open_hours.pharmacy_id')
            .select('pharmacies.name','open_hours.begin_time','open_hours.end_time')
            .where('open_hours.begin_time', '<=', time)
            .where('open_hours.end_time', '>=', time)
            .where('open_hours.dayofweek', '=', dayIndex[day])
            .then((data) =>{
                res.status(200).json(data);
            })
            .catch((err) =>{
                res.status(400).send(err.toString());
            })
    }
    // List all pharmacies that are open on a day of the week, at a certain time
    else if(req.query.dayofweek && req.query.time && !req.query.dateTime){
        const{dayofweek,time} = req.query;
        knex('open_hours')
        .join('pharmacies', 'pharmacies.id', 'open_hours.pharmacy_id')
        .select('pharmacies.name', 'open_hours.dayofweek','open_hours.begin_time','open_hours.end_time')
        .whereRaw('LOWER(dayofweek) = ?', dayofweek.toLowerCase())
        .where('open_hours.begin_time', '<=', time)
        .where('open_hours.end_time', '>=', time)
        .then((data) =>{
            res.status(200).json(data);
        })
        .catch((err) =>{
            res.status(500).send(err.toString());
        })
    }
    else    res.status(400).send(err.toString());
}
const withMask = (req,res,knex) => {
    // List all pharmacies that have more or less than x mask products within a price range
    const {priceRange, amount} = req.query;
    let symbol = null;
    let amountArray = amount.toLowerCase().split("than");
    let priceArray = priceRange.split("-");
    if(amountArray[0].toLowerCase() == 'more') symbol = '>'
    else if(amountArray[0].toLowerCase() == 'less') symbol = '<'
    else res.status(400).send('Wrong parameter for the more-less')
    knex
    .raw(
        `select p.name as pharmacy, m.name, m.price, m.amount
        from masks m
        inner join pharmacies p
        on p.id = m.pharmacy_id
        where m.price between ${priceArray[0]} and ${priceArray[1]}
        and amount ${symbol} ${amountArray[1]}
        order by m.price ASC;`
    )
    .then((data) => {
        res.status(200).json(data.rows);
    })
    .catch((err) =>{
        res.status(500).send(err.toString());
    })
}
const editName = (req,res,knex) => {
    // Edit pharmacy name, mask name, and mask price
    const {name} = req.params;
    knex
    .raw(`update pharmacies set name = :newName
            where lower(name) = :name`,
            {newName:req.body["newName"], name:name.toLowerCase()})
    .then(row => {
        if(!row)
            res.status(404).json({success:false})
        res.status(200).json({success:true,rowCount:row.rowCount})
    })
    .catch(err =>{
        res.status(400).send(err.toString())
    })
}

const searchMaskOrPharmacy = (req,res,knex) =>{
    // Search for pharmacies or masks by name, ranked by relevance to search term
    const {name} = req.query;
    knex
    .raw(`SELECT name FROM pharmacies
        WHERE LOWER(name) ILIKE :name
        UNION ALL
        SELECT name FROM masks
        WHERE LOWER(name) ILIKE :name
        ORDER BY name`,  {name:`%${name.toLowerCase()}%`} )
    .then((data) => {
        res.status(200).json(data.rows);
    })
    .catch((err) =>{
        res.status(400).send(err.toString());
    })
}

module.exports = {
    byTime,
    withMask,
    editName,
    searchMaskOrPharmacy
};