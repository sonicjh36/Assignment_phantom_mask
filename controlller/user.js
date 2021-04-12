
const top = (req,res,knex) => {
    // The top x users by total transaction amount of masks within a date range
    const {num} = req.params;
    const {dateRange} = req.query;
    let begin = dateRange.split('-')[0];
    let end = dateRange.split('-')[1];
    if(begin > end)
        res.status(500).send('wrong parameter')
    knex
    .raw(`select users.name, sum(purchase_histories.transaction_amount) as total
        from purchase_histories
        inner join users on users.id = purchase_histories.user_id
        where purchase_histories.transaction_date between :date_begin and :date_end
        group by users.id
        order by total DESC
        limit :num`, {date_begin:begin, date_end:end,num:num})
    .then((data) => {
        res.status(200).json(data.rows);
    })
    .catch((err) =>{
        res.status(400).send(err.toString());
    })
}

module.exports = {top};