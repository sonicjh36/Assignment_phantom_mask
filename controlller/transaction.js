const dayIndex = {
    0:"Sun",
    1:"Mon",
    2:"Tue",
    3:"Wed",
    4:"Thu",
    5:"Fri",
    6:"Sat"
}
const get = (req,res,knex) => {
    // The total amount of masks and dollar value of transactions that happened within a date range
    const {dateRange} = req.query;
    let start = dateRange.split('-')[0];
    let end = dateRange.split('-')[1];
    knex
    .raw(`select sum(purchase_histories.transaction_amount) as transaction_amount,
        sum(masks.amount) as mask_amount
        from purchase_histories
        inner join masks on purchase_histories.mask_id = masks.id
        where transaction_date between :start_date and :end_date`,
        {start_date:start, end_date:end})
        .then((data) => {
            res.status(200).json(data.rows);
        })
        .catch((err) =>{
            res.status(500).send(err.toString());
        })
}

const add = async (req,res,knex) => {
    // Process a user purchases a mask from a pharmacy, and handle all relevant data changes in an atomic transaction
    const trx = await knex.transaction();
    try {
        const {userName,pharmacyName,maskName,datetime} = req.body;
        let dayofweek = new Date(datetime).getDay();
        let date = datetime.split(" ")[0];
        let time = datetime.split(" ")[1];
        await trx('open_hours')
                .join('pharmacies', 'pharmacies.id', 'open_hours.pharmacy_id')
                .select('pharmacies.name','open_hours.begin_time','open_hours.end_time')
                .where('open_hours.begin_time', '<=', time)
                .where('open_hours.end_time', '>=', time)
                .where('open_hours.dayofweek', '=', dayIndex[dayofweek])
                .where('pharmacies.name', '=',pharmacyName )
            .then(pharmacyOpen => {
                if(pharmacyOpen.length == 0)
                    res.status(400).json({message:"The pharmacy is not open on this datetime"})
            })

        let data = await trx.raw(`SELECT m.id, m.pharmacy_id, m.price FROM masks m
                        INNER JOIN pharmacies p ON m.pharmacy_id = p.id
                        WHERE p.name = :pharmacyName AND m.name = :maskName`,
                        {pharmacyName:pharmacyName,maskName:maskName})
        if(data.rows.length == 0) res.status(400).send("This mask is not sold in the pharmacy")
        await trx.raw(`INSERT INTO purchase_histories
                        (transaction_amount, transaction_date, transaction_time, pharmacy_id, user_id, mask_id)
                        VALUES(:price, :date, :time, :pharmacyID, (select id from users where name = :userName),
                        :maskID)`,
                        {price:data.rows[0].price, date:date, time:time, userName:userName,
                        pharmacyID:data.rows[0].pharmacy_id, maskID:data.rows[0].id})
        await trx.raw(`UPDATE users SET \"cashBalance\" = \"cashBalance\" - :price WHERE name = :userName`,
                        {price:data.rows[0].price, userName:userName})
        await trx.raw(`UPDATE pharmacies SET \"cashBalance\" = \"cashBalance\" + :price WHERE name = :pharmacyName`,
                        {price:data.rows[0].price, pharmacyName:pharmacyName})
        trx.commit();
        res.status(200).json({
            status: 'success'
        });
    } catch(err) {
        trx.rollback();
        res.status(400).json({
            status: 'fail',
            message: err.toString()
        });
    }
}

module.exports = {
    get,add
};