const sortByPharmacy = (req,res, knex) => {
    // List all masks that are sold by a given pharmacy, sorted by mask name or mask price
    const {pharmacy} = req.params;
    const {sort} = req.query;
    if(sort != 'name' && sort != 'price')
        res.status(400).send('Wrong parameter for sorting method')
    knex('masks')
    .join('pharmacies','pharmacies.id', 'masks.pharmacy_id')
    .select('pharmacies.name as pharmacy_name','masks.name as mask_name','masks.amount','masks.price')
    .whereRaw('LOWER(pharmacies.name) = ?', pharmacy.toLowerCase())
    .orderBy('masks.'+sort, 'asc')
    .then((data) => {
        res.status(200).json(data);
    })
    .catch((err) => {
        res.status(400).send(err.toString());
    })
}
const editName = (req,res,knex) => {
    // Edit pharmacy name, mask name, and mask price
    const {name} = req.params;
    const {newName, pharmacyName} = req.body;
    if(pharmacyName != undefined) {
        knex
        .raw(`update masks set name = :newName
            where pharmacy_id in
            (select id from pharmacies where name = :pharmacyName) and lower(name) = :name`,
            {newName:newName,name:name.toLowerCase(),pharmacyName:pharmacyName})
        .then(row => {
            if(!row)
                res.status(404).json({success:false})
            res.json({success:true, rowCount:row.rowCount})
        })
        .catch(err =>{
            res.status(500).send(err.toString())
        })
    }
    else {
        knex
        .raw(`update masks set name = :newName where lower(name) = :name`,
            {newName:newName,name:name.toLowerCase()})
        .then(row => {
            if(!row)
                res.status(404).json({success:false})
            res.json({success:true, rowCount:row.rowCount})
        })
        .catch(err =>{
            res.status(500).send(err.toString())
        })
    }
}
const editPrice = (req,res,knex) => {
    // Edit pharmacy name, mask name, and mask price
    const {name} = req.params;
    const {newPrice, pharmacyName} = req.body;
    // res.send(req.body["newName"])
    if(pharmacyName != undefined) {
        knex
        .raw(`update masks set price = :newPrice
            where pharmacy_id in
            (select id from pharmacies where lower(name) = :pharmacyName) and lower(name) = :name`,
            {newPrice:newPrice,name:name.toLowerCase(),pharmacyName:pharmacyName.toLowerCase()})
        .then(row => {
            if(!row)
                res.status(404).json({success:false})
            res.json({success:true, rowCount:row.rowCount})
        })
        .catch(err =>{
            res.status(400).send(err.toString())
        })
    }
    else {
        knex
        .raw(`update masks set price = :newPrice where lower(name) = :name`,
            {newPrice:newPrice,name:name.toLowerCase()})
        .then(row => {
            if(!row)
                res.status(404).json({success:false})
            res.json({success:true, rowCount:row.rowCount})
        })
        .catch(err =>{
            res.status(500).send(err.toString())
        })
    }
}
const deleteMask = (req,res,knex) => {
    // Remove a mask product from a pharmacy given by mask name
    const {maskName} = req.params;
    const {pharmacyName} = req.query;
    if(pharmacyName != undefined) {
        console.log(pharmacyName, maskName)
        knex
        .raw(`update purchase_histories set mask_id = NULL where mask_id in
            (select p.mask_id from purchase_histories p
            left join masks m on m.id = p.mask_id
            left join pharmacies ph on ph.id = p.pharmacy_id
            where lower(m.name) = :maskName and lower(ph.name) = :pharmacyName)`,
            {maskName:maskName.toLowerCase(), pharmacyName:pharmacyName.toLowerCase()} )
        .then(row => {
            console.log(row.rowCount)
            if(!row)
                res.status(404).json({success:false})
            return knex
            .raw(`delete from masks where pharmacy_id in
                (select id from pharmacies where lower(name) = :pharmacyName)
                and lower(name) = :maskName`,
                {maskName:maskName.toLowerCase(), pharmacyName:pharmacyName.toLowerCase()})
            .then(row => {
                if(!row)
                    res.status(404).json({success:false})
                res.json({success:true, rowCount:row.rowCount})
            })
            .catch(err =>{
                res.status(400).send(err.toString())
            })
        })
    }
    else {
        knex
        .raw(`update purchase_histories set mask_id = NULL where mask_id in
        (select p.mask_id from purchase_histories p
        left join masks m on m.id = p.mask_id
        where lower(m.name) = :maskName)`,
        {maskName:maskName.toLowerCase()})
        .then(row => {
            if(!row)
                res.status(404).json({success:false})
            return knex
            .raw(`delete from masks where lower(name) = :maskName`,
                {maskName:maskName.toLowerCase()})
            .then(row => {
                if(!row)
                    res.status(404).json({success:false})
                res.status(200).json({success:true, rowCount:row.rowCount})
            })
            .catch(err =>{
                res.status(500).send(err.toString())
            })
        })
    }
}

module.exports = {
    sortByPharmacy,
    editName,
    editPrice,
    deleteMask
};